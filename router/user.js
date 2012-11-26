var LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  _ = require('underscore');

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
  ]
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
            return done(null, false, { message:'Unknown user ' + username });
          }
          if (user.password !== password) {
            return done(null, false, { message:'Invalid password' });
          }
          return done(null, user);
        });
      });
    }
  ));
};
exports.getAll = function (req, res) {
  User.find(function (err, users) {
    res.send(_.omit(users, 'password', 'question', 'answer'));
  });
};

exports.register = function (req, done) {

  process.nextTick(function () {
    var userData = _.pick(req.body, 'username', 'password', 'name', 'surname', 'email', 'country', 'city');
    if (!(_.isEmpty(_.difference(['username', 'password', 'name', 'surname', 'email', 'country', 'city'], _.keys(userData))))){
      done(true, false, { message:'No has completado todos los datos:' });
    }
    else {
    User.findOne({username:userData.username}, function (err, user) {
      console.log(user);
      if (err) {
        return done(err);
      }
      if (user) {
        done(null, false, { message:'This username is already chosen: ' + userData.username });
      } else {
        var newUser = new User(userData);
        newUser.save(function (err, user) {
          if (err) {
            done(err);
          }
          done(null, user);
        });
      }
    });
    }
  });
};


exports.localAuth = localAuth;
exports.User = User;