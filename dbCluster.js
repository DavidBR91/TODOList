var redis = require('redis');
var createRedis = function (cb) {
  var client = redis.createClient(6379, 'nodejitsudb6172298819.redis.irstack.com');
  client.auth('nodejitsudb6172298819.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
    if (err) {
      throw err;
    }
    cb(client);
  });
}

var uuid = require('node-uuid');
var _ = require('underscore'),
  list = require('./router/list.js'),
  user = require('./router/user.js'),
  task = require('./router/task.js'),
  async = require('async');

var usersSockets = {};
var sio;


var userConnected = function (user, socket) {
  if (!usersSockets.hasOwnProperty(user)) {
    console.log('user %s connected', user);
    usersSockets[user] = socket;
    createRedis(function (client) {
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
        doAction('delete', listId, user);
      });
      socket.on('addList', function (listId) {
        console.log('Adding from: ' + user);
        addList(user, listId);
        doAction('add', listId, user);
      });
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

      createRedis(function (centinell) {

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
  });
};

var showNotifications = function (user, socket) {
  var notArray = [];
  var functionArray = [];

  createRedis(function (client) {

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
            var cmp = 0;
            for (var i = 0; i < tasks.length; i++) {
              var taskId = tasks[i];
              task.Task.findById(taskId, 'name', function (err, task) {
                notObj.taskList.push(task.name);
                cmp++;
                if (cmp === tasks.length) {
                  notArray.push(notObj);
                  cb();
                }
              });
            }
          });
        });
      };
    }
  });
};

var deleteList = function (userList, listId) {
  createRedis(function (client) {
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
  });
};

var addList = function (userList, listId) {

  createRedis(function (client) {

    client.hget(listId, "TL", function (err, taskList) {
      client.smembers(taskList, function (err, tasks) {
        user.User.findOne({username:userList}).populate('taskList')
          .exec(function (err, user) {
            for (var i = 0; i < tasks.length; i++) {
              var currTask = tasks[i];
              task.Task.findById(currTask, function (err, infoTask) {
                list.List.findOne({user:user.id, name:'Lista principal'}, function (err, list) {
                  var taskData = _.pick(infoTask, 'name', 'description', 'creation_date', 'expiration_date', 'expectedDays', 'completed', 'favorite');
                  taskData.user = user._id;
                  taskData.list = list._id;
                  var newTask = new task.Task(taskData);
                  newTask.save(function (err, newTask) {
                    list.tasks.push(newTask.id);
                    list.save();
                    deleteList(userList, listId);
                  });
                });
              });

            }
          });
      });
    });
  });
};

var doAction = function (option, listId, recUser) {
  createRedis(function (client) {
    client.hget(listId, "user", function (err, sendingUser) {
      user.User.findOne({username:sendingUser}, function (err, userObj) {
        var email = userObj.email;

      });
    });
  });
}

exports.createDB = createDB;
exports.userConnected = userConnected;

