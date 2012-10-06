
/*
 * Module dependencies
 */

var passport = require('passport')
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
    clientID: process.env.GITHUB_CONSUMER,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK
  },
  function(token, tokenSecret, profile, done) {
    return done(null, profile);
  }
));