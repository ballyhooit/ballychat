var express = require('express')
	, http = require('http')
	, passport = require('passport')
	, redisUrl = require('url').parse(process.env.REDISTOGO_URL)
	, redisAuth = redisUrl.auth.split(':')
	, RedisStore = require('connect-redis')(express);


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
    key: "ballychat",
    store: sessionStore
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});


require('./routes');

exports.server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Ballyhoo started on port %d', app.get('port'));
});

require('./sockets')