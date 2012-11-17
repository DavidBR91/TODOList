var mongoose = require('mongoose'),
  _ = require('underscore'),
  list = require('./list.js'),
  user = require('./user.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
  list:ObjectId,
  name:String,
  description:String,
  creation_date:{ type:Date, default:Date.now },
  expiration_date:Date,
  completed:Boolean
});

var Task = mongoose.model('Task', TaskSchema);

exports.create = function (req, res) {
  var name = req.body.name;
  list.List.findById(req.params.listid).populate('tasks')
    .exec(function (err, list) {
      var nameList = _.pluck(list.tasks, 'name');
      if (err) {
        console.log(err);
      } else if (!(_.contains(nameList, name))) {
        var task = new Task(_.pick(req.body, 'name', 'description', 'expiration_day', 'completed'));
        task.list = req.params.listid;
        task.save(function (err, task) {
          if (!err) {
            loc = req.headers.host + '/list/' + list.id + '/task/' + task.id;
            res.setHeader('Location', loc);
            res.json(task, 201);
            saveInList(list, task);
          }
          else {
            console.log('Error');
            res.json({ok:false});
          }
        });
      }
      else {
        console.log('Error');
        res.json({ok:false, error:'Already exists'});
      }
    });
  function saveInList(clist, task) {
    console.log(clist);
    list.List.update({_id:clist.id}, {$push:{tasks:task._id}}, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully added");
      }
    });
  }
};

exports.showAll = function (req, res) {
  list.List.findById(req.params.listid).populate('tasks')
    .exec(function (err, list) {
      if (!err) {
        console.log(req.user.id);
        if(list.user == req.user.id){
          res.json(list.tasks);
        }
        else {
          res.json({ok:false});
        }
      }
    });
};

exports.show = function (req, res) {
  list.findById(req.params.taskid, function (error, task) {
    res.json(task);
  });
};