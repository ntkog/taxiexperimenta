var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const passport = require('passport');
const session = require('express-session');
const store = require('connect-nedb-session')(session);
const flash = require('connect-flash');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.use(expressLayouts);


// bodyParser reads a form's input and stores it in request.body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

// form and url validation
app.use(expressValidator());

// cookie, session, passport is for authentication
app.use(cookieParser());

// setup sessions
var sessionOptions = {
  store: new store({ filename: path.join('data', 'sessionFile.json')}),
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false,
}
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sessionOptions.cookie.secure = true // serve secure cookies for https
}
app.use(session(sessionOptions))

// intialize passport
app.use(passport.initialize());
// use express.session() before passport.session()
app.use(passport.session());

// initialize flash; flash must be after cookieParser and session
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));


// global variables that are available to the views
app.use(function(req, res, next) {
  res.locals.errors = null;
  // req.user comes from passport. this makes 'user' available in the view.
  res.locals.user = req.user || null;
  // req.flash comes from flash
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next();
})

app.use('/', indexRouter);

app.listen(process.env["PORT"] || 3000 , function() {
  console.log(`Started at port ${process.env["PORT"] || 3000}`);
})
module.exports = app;
