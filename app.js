var express = require('express')
  , https = require('https')
  , passport = require('passport')
  , RedisStore = require('connect-redis')(express)
  , fs = require('fs')
  , nconf = exports.nconf = require('nconf');

var options = {
   key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
nconf.env().file('config.json');

var redisUrl = exports.redisUrl = require('url').parse(nconf.get('REDISTOGO_URL'))
   , redisAuth = exports.redisAuth = redisUrl.auth.split(':');

var sessionStore = exports.sessionStore = new RedisStore({host: redisUrl.hostname, port: redisUrl.port, db: redisAuth[0], pass: redisAuth[1]});

require('./strategy');

var app = exports.app = express();

app.configure(function() {
  app.set('port', 1337);
  app.set('view engine', 'jade'); 
  app.set('views', __dirname + '/views/themes/default');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('ThisIsASecret'));
  app.use(express.session({
    key: "ballychat-local",
    store: sessionStore
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});


require('./routes');

exports.server = https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Ballyhoo started on port %d', app.get('port'));
});

require('./sockets')