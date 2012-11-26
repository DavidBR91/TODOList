var mongoose = require('mongoose'),
    _ = require('underscore'),
    user = require('./user.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var ListSchema = new Schema({
    user : ObjectId,
    name: String,
    tasks: [{type : ObjectId, ref: "Task"}]
});

var List = mongoose.model('List', ListSchema);

exports.create = function (req, res) {
    var name = req.body.name;
    user.User.findOne({username: req.user.username}).populate('taskList')
        .exec(function (err, user) {
            console.log(user);
            var nameList = _.pluck(user.taskList, 'name');
            if (err) {
                console.log(err);
            } else if (!(_.contains(nameList, name))) {
                var list = new List(_.pick(req.body, 'name'));
                list.user = req.user;
                list.save(function (err, list) {
                    if (!err) {
                        loc = req.headers.host + '/list/' + list.id;
                        res.setHeader('Location', loc);
                        res.json(list, 201);
                        saveInUser(user, list);
                    }
                    else {
                        res.json({ok: false, error : err});
                    }
                });
            }
            else {
                console.log('Error');
                res.json({ok: false, error : 'Already exists'});
            }
        });
    function saveInUser(cuser, list) {
        console.log(cuser);
        user.User.update({_id: cuser.id}, {$push: {taskList: list._id}}, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully added");
            }
        });
    }
};

exports.showAll = function (req, res) {
    user.User.findById(req.user.id).populate('taskList')
      .exec(function(err, user){
        if(err){
          res.json({ok:false, error : err}, 500);
        } else {
          if(!user){
            res.json({ok : true, data : null}, 200);
          } else {
            res.json({ok : true, data : user.taskList}, 200);
          }
        }
      });
};

exports.show = function (req, res) {
    List.findById(req.params.listid, function (error, list) {
      if (error){
        res.json({ok:false, error : error});
      }
      else{
        if(!list){
          res.json({ok : true, data : null}, 200);
        }
        else if (list.user.toString() === req.user.id){

          res.json({ok : true, data : list}, 200);
        }
        else{
          console.log(list.user);
          res.json({ok:false, error : "Not authorized"}, 401);
        }
      };
    });
};

exports.List = List;