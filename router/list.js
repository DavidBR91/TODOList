var mongoose = require('mongoose'),
    _ = require('underscore'),
    user = require('./user.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ListSchema = new Schema({
    name: String,
    tasks: [ObjectId]
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
                list.save(function (err, list) {
                    if (!err) {
                        loc = req.headers.host + '/list/' + list.name;
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
        /*user.User.findByIdAndUpdate(cuser.id, {taskList: cuser.taskList.push(list.id)}, function (err, user) {
         console.log(user);
         console.log(err);
         });*/
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
        res.send(lists);
    });
};

exports.show = function (req, res) {
    Disco.findOne({name: req.params.id}, function (error, list) {
        res.json(list);
    });
};

exports.List = List;