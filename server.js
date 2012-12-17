var express = require('express')
  , flash = require('connect-flash')
  , util = require('util'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  http = require('http'),
  user = require('./router/user.js'),
  list = require('./router/list.js'),
  task = require('./router/task.js'),
  dbCluster = require('./dbCluster.js');

mongoose.connect('mongodb://localhost:27017/test2');
user.localAuth(passport);

var app = express(),
server = http.createServer(app);


var socketIo = require("socket.io"),
  passportSocketIo = require("passport.socketio");

var MemoryStore = express.session.MemoryStore,
  sessionStore = new MemoryStore();
// configure Express
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs-locals'));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    store: sessionStore,
    secret: 'secret',
    key: 'express.sid'}));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


var sio = socketIo.listen(server);

sio.set("authorization", passportSocketIo.authorize({
  sessionKey:'express.sid', //the cookie where express (or connect) stores its session id.
  sessionStore:sessionStore, //the session store that express uses
  sessionSecret:"secret", //the session secret to parse the cookie
  fail:function (data, accept) {     // *optional* callbacks on success or fail
    accept(null, false);             // second param takes boolean on whether or not to allow handshake
  },
  success:function (data, accept) {
    accept(null, true);
  }
}));


dbCluster.createDB(sio);

var desiredURL;

app.get('/', ensureAuthenticated, function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/login', function (req, res) {
  res.render('login', { user:req.user, message:req.flash('error'), registered:req.flash('registered')});
});

app.post('/login',
  passport.authenticate('local', { failureRedirect:'/login', failureFlash:true }),
  function (req, res) {
    if (!desiredURL || desiredURL === '/login') {
      res.redirect('/');
    } else {
      console.log(desiredURL);
      setTimeout(function () {
        res.redirect(desiredURL);
      }, 50000);

    }
  });

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/register', function (req, res) {
  res.render('register', {message:req.flash('error'), user:req.user });
});

app.post('/register', function (req, res) {
  console.log(req.body);
  user.register(req, function (err, user, info) {
    console.log(user);
    if (!err) {
      if (user) {
        req.flash('registered', 'You just registered, log in');
        res.redirect('/login');
      }
      else {
        req.flash('error', info.message);
        res.redirect('/register');
      }
    }
    else {
      req.flash('error', info.message);
      res.redirect('/register');
    }
  });
})

app.get('/user', ensureAuthenticated, user.getAll);

app.post('/list', ensureAuthenticated, list.create);

app.get('/list', ensureAuthenticated, list.showAll);

app.get('/list/:listid', ensureAuthenticated, list.show);

app.delete('/list/:listid', ensureAuthenticated, list.delete);

app.post('/list/:listid/task', ensureAuthenticated, task.create);

app.get('/list/:listid/task', ensureAuthenticated, task.showAll);

app.get('/list/:listid/task/:taskid', ensureAuthenticated, task.show);

app.put('/list/:listid/task/:taskid', ensureAuthenticated, task.update);

app.delete('/list/:listid/task/:taskid', ensureAuthenticated, task.delete);

server.listen(3000);

function ensureAuthenticated(req, res, next) {
  desiredURL = req.path;
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
};