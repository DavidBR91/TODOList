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
                        console.log('Error');
                        res.json({ok: false});
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
    List.find(function (err, lists) {
        res.json(lists);
    });
};

exports.show = function (req, res) {
    List.findById(req.params.listid, function (error, list) {
        res.json(list);
    });
};

exports.List = List;