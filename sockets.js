
/*
 * Module dependencies
 */

var parent = module.parent.exports 
  , app = parent.app
  , server = parent.server
  , express = require('express')
  , sessionStore = parent.sessionStore
  , sio = require('socket.io')
  , parseCookies = require('connect').utils.parseSignedCookies
  , cookie = require('cookie')
  , fs = require('fs')
  , init = require('./init')
  , redis = require('socket.io/node_modules/redis')
  , redisUrl = require('url').parse(process.env.REDISTOGO_URL)
  , redisAuth = redisUrl.auth.split(':');

var store = redis.createClient(redisUrl.port, redisUrl.hostname);
var pub = redis.createClient(redisUrl.port, redisUrl.hostname);
var sub = redis.createClient(redisUrl.port, redisUrl.hostname);

store.auth(redisAuth[1]);
pub.auth(redisAuth[1]);
sub.auth(redisAuth[1]);

init(store);

var io = sio.listen(server);
io.set('authorization', function (hsData, accept) {
  console.log(hsData.address);
  if(hsData.headers.cookie) {
    var cookies = parseCookies(cookie.parse(hsData.headers.cookie), 'ThisIsASecret')
      , sid = cookies['ballychat'];

    sessionStore.load(sid, function(err, session) {
      if(err || !session) {
        return accept('Error retrieving session!', false);
      }

      hsData.ballychat = {
        user: session.passport.user
      };

      return accept(null, true);
      
    });
  } else {
    if(hsData.address.address = process.env.HUBOT_ADDRESS) {
      hsData.ballychat = {
        user : {
          username: process.env.HUBOT_NAME,
          provider: 'Hubot'
        }
      }

      return accept(null, true);

    } else {
      return accept(null, false);
    }
  }
});

io.configure(function() {
  io.set('store', new sio.RedisStore({
    redisPub : pub
    , redisSub : sub
    , redisClient : store}));
  io.enable('browser client minification');
  io.enable('browser client gzip');
});


io.sockets.on('connection', function (socket) {
  var hs = socket.handshake
    , nickname = hs.ballychat.user.username
    , provider = hs.ballychat.user.provider
    , userKey = provider + ":" + nickname
    , now = new Date();
  
  socket.join('home');

  socket.on('me:message:send', function(data) {
    console.log(data);
    var no_empty = data.msg.replace("\n","");
    if(no_empty.length > 0) {
      io.sockets.in(data.room).emit('message:send', {
        nickname: nickname,
        provider: provider,
        msg: data.msg
      });        
    }   
  });

  socket.on('me:status:update', function(data) {
    var status = data.status;

    io.sockets.emit('user:status:update', {
      username: nickname,
      provider: provider,
      status: status
    });
  });

  socket.on('me:room:create', function(data) {
    store.sadd('rooms:info',data.room, function(err, reply) {
      store.smembers('rooms:info', function(er, res) {
        io.sockets.emit('room:create', data);
      });
    });
  });

  socket.on('disconnect', function() {
    io.sockets.emit('room:leave', {
      nickname: nickname,
      provider: provider
    });
  });
});
