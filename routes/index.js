
/*
 * Module dependencies
 */

var parent = module.parent.exports 
  , app = parent.app
  , passport = require('passport')
  , utils = require('../utils.js');

/*
 * Homepage
 */

app.get('/', function(req, res, next) {
  if(req.isAuthenticated()){
    res.redirect('/chat');
  } else{
    res.render('index');
  }
});

/*
 * Authentication routes
 */

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/'
  })
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/*
 * Chat Route
 */

app.get('/chat', utils.restrict, function(req, res) {
  if(req.isAuthenticated()){
    res.render('chat');
  } else{
    res.redirect('/index');
  }
});