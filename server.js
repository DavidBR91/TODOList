var express = require('express')
    , flash = require('connect-flash')
    , util = require('util'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    user = require('./router/user.js');

mongoose.connect('mongodb://localhost:27017/test');
user.localAuth(passport);

var app = express();

// configure Express
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.engine('ejs', require('ejs-locals'));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(flash());
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});


app.get('/', function (req, res) {
    res.redirect('/index');
});

app.get('/index', ensureAuthenticated, user.getAll);

app.get('/login', function (req, res) {
    res.render('login', { user: req.user, message: req.flash('error'), registered: req.flash('registered')});
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/register', function (req, res) {
    res.render('register', {message: req.flash('error'), user: req.user });
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
            res.send(500);
        }
    });
})

app.listen(3000);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}