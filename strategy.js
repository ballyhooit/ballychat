
/*
 * Module dependencies
 */

var parent = module.parent.exports
  , passport = require('passport')
  , GithubStrategy = require('passport-github').Strategy

/*
 * Auth strategy
 */

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GithubStrategy({
    clientID: parent.nconf.get('GITHUB_CONSUMER'),
    clientSecret: parent.nconf.get('GITHUB_SECRET'),
    callbackURL: parent.nconf.get('GITHUB_CALLBACK')
  },
  function(token, tokenSecret, profile, done) {
    return done(null, profile);
  }
));