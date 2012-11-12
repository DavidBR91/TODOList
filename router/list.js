var mongoose = require('mongoose'),
  _ = require('underscore'),
  user = require('./user.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ListSchema = new Schema({
  name:String,
  tasks:[ObjectId]
});

var List = mongoose.model('List', ListSchema);

exports.create = function (req, res) {
  user.User.findOne({username : req.user},function(err, user){
    user.hasList('hola', function(err, hasList){
      console.log(hasList);
      if(!hasList){
        var list = new List(_.pick(req.body, 'name'));
        list.save(function (err, list) {
          if (!err) {
            loc = req.headers.host + '/list/' + list.name;
            res.setHeader('Location', loc);
            res.json(list, 201);
          }
          else {
            console.log('Error');
            res.json({ok:false});
          }
        });
      }
    });
  })
};

exports.showAll = function (req, res) {
  List.find(function (err, lists) {
    res.send(lists);
  });
};

exports.show = function (req, res) {
  Disco.findOne({name : req.params.id}, function (error, list) {
    res.json(list);
  });
};

exports.List = List;