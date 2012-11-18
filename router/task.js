var mongoose = require('mongoose'),
  _ = require('underscore'),
  list = require('./list.js'),
  user = require('./user.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
  user:ObjectId,
  list:ObjectId,
  name:{type : String, required : true},
  description:String,
  creation_date: {type:Date, default:Date.now },
  expiration_date: {type : Date, required : true },
  completed : {type : Boolean, default : false}
});

var Task = mongoose.model('Task', TaskSchema);

exports.create = function (req, res) {
  var name = req.body.name;
  list.List.findById(req.params.listid).populate('tasks')
    .exec(function (err, list) {
      var nameList = _.pluck(list.tasks, 'name');
      if (err) {
        console.log(err);
        res.json({ok:false, error:err}, 500);
      } else if (list.user.toString() !== req.user.id) {
        console.log(list.user);
        res.json({ok:false, error:"Not authorized"}, 401);
      } else if (!(_.contains(nameList, name))) {
        var task = new Task(_.pick(req.body, 'name', 'description', 'expiration_day', 'completed'));
        task.list = req.params.listid;
        task.user = req.user._id;
        task.save(function (err, task) {
          if (!err) {
            loc = req.headers.host + '/list/' + list.id + '/task/' + task.id;
            res.setHeader('Location', loc);
            res.json({ok:true, data:task}, 201);
            saveInList(list, task);
          }
          else {
            console.log('Error');
            res.json({ok:false, error:err}, 500);
          }
        });
      }
      else {
        console.log('Error');
        res.json({ok:false, error:'Already exists'});
      }
    });
}
function saveInList(clist, task) {
  console.log(clist);
  list.List.update({_id:clist.id}, {$push:{tasks:task._id}}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully added");
    }
  });
};

exports.showAll = function (req, res) {
  list.List.findById(req.params.listid).populate('tasks')
    .exec(function (err, list) {
      if (!err) {
        if (list.user === req.user._id) {
          res.json(list.tasks);
        }
        else {
          res.json({ok:false, error:"Not authorized"}, 401);
        }
      }
    });
};

exports.show = function (req, res) {
  Task.findById(req.params.taskid, function (error, task) {
    if (error) {
      res.json({ok:false, error:error});
    }
    else {
      if (!task) {
        res.json({ok:true, data:null}, 200);
      }
      else if (task.user.toString() === req.user.id && task.list.toString() === req.params.listid) {
        res.json({ok:true, data:task}, 200);
      }
      else {
        res.json({ok:false, error:"Not authorized"}, 401);
      }
    }
  });
};