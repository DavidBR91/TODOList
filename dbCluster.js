var redis = require('redis');
var centinell = redis.createClient();
var uuid = require('node-uuid');
var _ = require('underscore'),
    list = require('./router/list.js'),
    user = require('./router/user.js'),
    async = require('async');

var usersSockets = {};
var sio;


var userConnected = function (user, socket) {
    console.log('user %s connected', user);
    if (!usersSockets.hasOwnProperty(user)) {
        console.log('user %s connected', user);
        usersSockets[user] = socket;
        var client = redis.createClient();
        client.subscribe('share:' + user);
        client.on('message', function () {
            showNotifications(user, socket);
        });
        socket.on('disconnect', function () {
            delete usersSockets[user];
            client.quit();
            console.log("CERRANDO SOCKET")
        });
        socket.on('deleteList', function (listId) {
            console.log('Deleting list from: ' + user);
            deleteList(user, listId);
        });
        socket.on('addList', function (listId) {
            console.log('Adding from: ' + user);
            addList(user, listId);
        });
    }
};

var createDB = function (socketIo) {
    sio = socketIo;
    sio.sockets.on("connection", function (socket) {
        console.log('llega');
        userConnected(socket.handshake.user.username, socket);
        showNotifications(socket.handshake.user.username, socket);
        socket.on('newTask', function (message) {
            var taskList = 'TL:' + uuid.v4();
            var taskInfo = 'TI:' + uuid.v4();

            var arr = message.taskList;
            var user = message.user;

            async.parallel([
                function (callback) {
                    async.forEach(arr, function (item, cb) {
                        centinell.sadd(taskList, item, cb);
                    }, callback);
                },
                function (callback) {
                    centinell.hset(taskInfo, 'user', socket.handshake.user.username, callback);
                },
                function (callback) {
                    centinell.hset(taskInfo, 'TL', taskList, callback);
                },
                function (callback) {
                    centinell.rpush('share:' + user, taskInfo, callback);
                }
            ],
                function () {
                    centinell.publish('share:' + user, 'new');
                });
        });
    });
};

var showNotifications = function (user, socket) {
    var notArray = [];
    var client = redis.createClient();
    var functionArray = [];

    async.waterfall([
        function (callback) {
            client.lrange("share:" + user, 0, -1, function (err, lists) {
                callback(null, lists);
            });
        },
        function (lists, callback) {
            for (var i = 0; i < lists.length; i++) {
                functionArray.push(parallel(lists[i]));
            }
            async.parallel(functionArray, callback);
        }
    ], function () {
        console.log("Sending notifications to %s.", user);
        socket.emit('notification', notArray);
        client.quit();
    });

    function parallel(listId) {
        return function (cb) {
            var notObj = {};
            notObj.taskList = [];
            notObj.listId = listId;
            client.hget(listId, "user", function (err, userList) {
                notObj.user = userList;
            });
            client.hget(listId, "TL", function (err, taskList) {
                client.smembers(taskList, function (err, tasks) {
                    notObj.taskList = tasks;
                    notArray.push(notObj);
                    cb();
                });
            });
        };
    }
};

var deleteList = function (userList, listId) {
    var client = redis.createClient();
    async.parallel([
        function (cb) {
            client.hget(listId, 'TL', function (err, taskList) {
                client.del(taskList);
                cb();
            });
        },
        function (cb) {
            client.lrem("share:" + userList, 1, listId);
            cb();
        }
    ], function () {
        client.del(listId);
        client.quit();
    });
};

var addList = function (userList, listId) {

    var client = redis.createClient();

    client.hget(listId, "TL", function (err, taskList) {
        client.smembers(taskList, function (err, tasks) {
            console.log(tasks);
        });
    });
    console.log(userList);
    user.User.findOne({username: userList}).populate('taskList')
        .exec(function (err, user) {
            list.List.findOne({user : user.id, name : 'Lista principal'},function(err, list){
                console.log(list);
            });
        });
};


exports.createDB = createDB;
exports.userConnected = userConnected;

