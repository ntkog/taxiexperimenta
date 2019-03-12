var express = require('express');
var router = express.Router();

var path = require('path');
var uuid = require('uuid');
var authService = require('../services/authService');
var passport = require('passport');
var QRCode = require('qrcode');
authService.configurePassport(passport)


const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}



const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(`${process.cwd()}/data/db.json`);
const db = low(adapter);

//==========================
// root route
//==========================

// display home page
router.get('/', function(req, res) {
  res.render('home')
})

router.get('/qrcode/:driverId', function(req, res) {
  var info = db.get('users').find({ id: req.params.driverId }).value();
  res.render('formulario', { name : capitalize(info.username) , matricula: info.matricula });
})

router.get('/transito', isLoggedIn(), function(req, res) {
  res.render('transito');
})



router.post('/driver/newrun', isLoggedIn(), function(req, res) {
  var carreras =  db.get('users').find({ id: req.user.id }).get('carreras').value();
  // get data from form
  console.log(req.body);
  var carreraId = req.body.carreraId;
  var command = req.body.command;
  var ts = req.body.ts;
  var geo = req.body.geo;

  switch(command) {
    case 'start':
        carreras[carreraId] = {
          started : ts,
          route : [{
            lat : geo.lat,
            lon : geo.lon,
            ts : ts
          }],
          finished : null
        };
        break;
    case 'track':
        carreras[carreraId].route.push({
          lat : geo.lat,
          lon : geo.lon,
          ts : ts
        });
        break;
    case 'stop' :
        carreras[carreraId].finished = ts;
        break;
  }




  // carreras.push({
  //   carreraId : carreraId ,
  //   command : command,
  //   ts : ts,
  //   geo : geo
  // });
  // insert new book into database
  db.get('users')
    .find({ id: req.user.id })
    .assign({ carreras })
    .write();

  res.status(200).json({});
})

// display one book
router.get('/books/:id', function(req, res) {
  var book = db.get('books').find({ id: req.params.id }).value()
  var author;
  if(book) {
    author = db.get('authors').find({ id: book.author_id }).value()
  }

  res.render('book', { book: book || {}, author: author || {}})
})

//==========================
// auth routes
//==========================

var signup_view_path = path.join('auth', 'signup');
var login_view_path = path.join('auth', 'login');

// display signup page only if user is not logged in
router.get('/signup', isLoggedOut(), function(req, res) {
  res.render(signup_view_path)
})

// create user
router.post('/signup', function(req, res) {
  // remove extra spaces
  var username = req.body.username.trim();
  var password = req.body.password.trim();
  var password2 = req.body.password2.trim();
  var matricula = req.body.matricula.trim();

  // validate form data
  req.checkBody('username', 'Username must have at least 3 characters').isLength({min: 3});
  req.checkBody('password', 'Password must have at least 3 characters').isLength({min: 3});
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Confirm password is required').notEmpty();
  req.checkBody('password', 'Password do not match').equals(password2);
  req.checkBody('matricula','You have to provide your matricula').notEmpty();
  req.checkBody('matricula','You have to provide a valid matricula').isLength(8);
  // check for errors
  var errors = req.validationErrors();
  // if there are errors, display signup page
  if (errors) {
    return res.render(signup_view_path, {errors: errors.map(function(error) {return error.msg})})
  }

  var options = {
    username: username,
    password: password,
    matricula : matricula,
    successRedirectUrl: '/',
    signUpTemplate: signup_view_path,
  }
  authService.signup(options,res);
})

// display login page  if user is not logged in
router.get('/login', isLoggedOut(), function(req, res) {
  res.render(login_view_path, { errors: [] })
})

// peform login
router.post(
  '/login',
  passport.authenticate(
    'local',
    {
      successRedirect:'/',
      failureRedirect:'/login',
      failureFlash: true,
      successFlash: 'You are logged in',
    }
  )
)

// logout user
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/')
})

// display profile page if user is logged in
router.get('/profile', isLoggedIn(), function(req, res) {
  var dbUser =  db.get('users').find({ id: req.user.id }).value();

  QRCode.toDataURL(`${req.headers.host}/qrcode/${req.user.id}`, function (err, url) {
    res.render('profile', { dbUser:  dbUser, qrcodeUrl : url });
  })

})

//==========================
// middleware
//==========================

// isAuthenticated comes from passport;
// when a user is logged in, isAuthenticated return true.

function isLoggedIn () {
	return (req, res, next) => {
    // if there is a logged in user, do the next thing, and execute the
    // function for the route
    if (req.isAuthenticated()) { return next() };

    // if there isn't a login user, skip the function for the route, and
    // redirect to the login page
    return res.redirect('/login')
	}
}

function isLoggedOut () {
	return (req, res, next) => {
    // if there isn't a login user, execute the function for the route
    if (!req.isAuthenticated()) { return next() };

    // if there is a logged in user, redirect
    return res.redirect('/')
	}
}

module.exports = router;
