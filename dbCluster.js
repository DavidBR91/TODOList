var redis = require('redis');
var centinell = redis.createClient();
var uuid = require('node-uuid');
var _ = require('underscore'),
  async = require('async');

var conUsers = [];
var usersSockets = [];
var sio;

var createDB = function(socketIo){
  sio = socketIo;
  sio.sockets.on("connection", function (socket) {
    console.log("user connected: ", socket.handshake.user.username);
    userConnected(socket, socket.handshake.user.username);
    socket.emit('ready');
    socket.on('newTask',function(message){
      var taskList = 'TL:' + uuid.v4();
      var taskInfo = 'TI:' + uuid.v4();

      var arr = message.taskList;
      var user = message.user;

      async.parallel([
        function(callback){
          async.forEach(arr, function(item, cb){
            centinell.sadd(taskList,item,cb);
          }, callback);
        },
        function(callback){
          centinell.hset(taskInfo, 'user', socket.handshake.user.username, callback);
        },
        function(callback){
          centinell.hset(taskInfo, 'TL', taskList,callback);
        },
        function(callback){
          centinell.rpush('share:' + user, taskInfo,callback);
        }
      ],
        function(){
          centinell.publish('share:' + user,'new');
        });
    })
  });
}

var userConnected = function(socket,user){
  conUsers.push(user);
  var usSock = {user : user, socket : socket};
  usersSockets.push(usSock);
  var client = redis.createClient();
  client.subscribe('share:' + user);
  client.on('message',function(){
    showNotifications(user, socket);
  })
}

var showNotifications = function (user, socket){
  var notArray = [];
  var client = redis.createClient();
  client.lrange("share:" + user, 0, -1, function(err, lists){
    for(var i = 0; i<lists.length; i++){
      var notObj = {};
      notObj.taskList = [];
      notObj.listId = lists[i];
      client.hget(lists[i],"user",function(err,userList){
        notObj.user = userList;
      });
      client.hget(lists[i],"TL",function(err,taskList){
        client.smembers(taskList,function(err, tasks){
          notObj.taskList = tasks;
          notArray.push(notObj);
        });
      });
    }
  });
}
/*sio.sockets.on("connection", function (socket) {
  console.log("user connected: ", socket.handshake.user.name);

  //filter sockets by user...
  var userGender = socket.handshake.user.gender,
    opposite = userGender === "male" ? "female" : "male";

  passportSocketIo.filterSocketsByUser(sio,function (user) {
    return user.gender === opposite;
  }).forEach(function (s) {
      s.send("a " + userGender + " has arrived!");
    });
});*/

exports.createDB = createDB;

