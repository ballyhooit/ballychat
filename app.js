var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , RedisStore = require('connect-redis')(express)
  , fs = require('fs')
  , nconf = exports.nconf = require('nconf')
  , kn = require('knox')
  , winston = exports.winston = require('winston');

winston.cli({colorize: true});

var options = {
  http: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }
};

nconf.env().file('config.json');

winston.log('info', nconf.get('REDISTOGO_URL'));

var knox = exports.knox = kn.createClient({
  key: nconf.get('AWS_KEY'),
  secret: nconf.get('AWS_SECRET'),
  bucket: nconf.get('AWS_BUCKET')
});

var redisUrl = exports.redisUrl = require('url').parse(nconf.get('REDISTOGO_URL'))
   , redisAuth = exports.redisAuth = redisUrl.auth.split(':');

var sessionStore = exports.sessionStore = new RedisStore({host: redisUrl.hostname, port: redisUrl.port, db: redisAuth[0], pass: redisAuth[1]});

require('./strategy');

var app = exports.app = express();

app.configure(function() {
  app.set('port', nconf.get('PORT'));
  app.set('view engine', 'jade'); 
  app.set('views', __dirname + '/views/themes/default');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('ThisIsASecret'));
  app.use(express.session({
    key: nconf.get('SESSION_KEY'),
    store: sessionStore
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

require('./routes');

exports.server = http.createServer(app).listen(app.get('port'), function() {
  winston.info('Ballyhoo started on port '+ app.get('port'));
});

require('./sockets')