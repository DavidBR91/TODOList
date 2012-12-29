var LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  _ = require('underscore'),
  list = require('./list.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  username:{type:String, required:true},
  password:{type:String, required:true},
  name:{type:String, required:true},
  surname:{type:String, required:true},
  email:{type:String, required:true},
  country:{type:String, required:true},
  city:{type:String, required:true},
  question:Number,
  answer:String,
  taskList:[
    {type:ObjectId, ref:"List"}
  ],
  settings: {
    tasks_per_page : {type : Number, default: 10},
    default_list : {type : Number, default : 0}
  }
});

var User = mongoose.model('User', UserSchema);

var localAuth = function (passport) {

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
  passport.use(new LocalStrategy(
    function (username, password, done) {
      process.nextTick(function () {
        User.findOne({username:username}, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, { message:'El usuario ' + username + ' no existe'});
          }
          if (user.password !== password) {
            return done(null, false, { message:'Contraseña incorrecta' });
          }
          return done(null, user);
        });
      });
    }
  ));
};
exports.get = function (req, res) {
  User.findById(req.user.id,function (err, user) {
    res.json(_.omit(user, ['password', 'question', 'answer']));
  });
};

exports.delete = function(req, res){
    User.findByIdAndRemove(req.user.id, function(err, res){
      res.send(200);
    });
};

exports.update = function (req, res) {
  'use strict';
  User.findByIdAndUpdate(req.user.id, _.omit(req.body,'_id'),function (err, user) {
    console.log(err);
    res.json(user,200)
  });
};


exports.register = function (req, done) {

  process.nextTick(function () {
    var userData = _.pick(req.body, 'username', 'password', 'name', 'surname', 'email', 'country', 'city');
    User.findOne({username:userData.username}, function (err, user) {
      console.log(user);
      if (err) {
        return done(err, null, { message:'Server Error'});
      }
      if (user) {
        done(null, false, { message:'Este nombre ya está en uso: ' + userData.username });
      } else {
        var newUser = new User(userData);
        newUser.save(function (err, user) {
          if (err) {
            return done(err, null, { message:'No has completado todos los campos'});
          }
          else {
            var first_list = new list.List({user : user._id, name : "Lista principal" });
            first_list.save();
            user.taskList.push(first_list);
            user.save();
            done(null, user);
          }
        });
      }
    });
  });

};


exports.localAuth = localAuth;
exports.User = User;