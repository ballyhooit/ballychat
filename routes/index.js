
/*
 * Module dependencies
 */

var parent = module.parent.exports 
  , app = parent.app
  , passport = require('passport');

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

app.get('/chat', function(req, res) {
  res.render('chat');
});