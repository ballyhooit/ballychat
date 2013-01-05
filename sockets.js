
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
  , utils = require('./utils')
  , redis = require('socket.io/node_modules/redis')
  , redisUrl = require('url').parse(process.env.REDISTOGO_URL)
  , redisAuth = redisUrl.auth.split(':')
  , hubotAddr = process.env.HUBOT_ADDRESS.split(',');

var store = redis.createClient(redisUrl.port, redisUrl.hostname);
var pub = redis.createClient(redisUrl.port, redisUrl.hostname);
var sub = redis.createClient(redisUrl.port, redisUrl.hostname);

store.auth(redisAuth[1]);
pub.auth(redisAuth[1]);
sub.auth(redisAuth[1]);

init(store);

var io = sio.listen(server);

io.configure(function() {
  io.set('store', new sio.RedisStore({
    redisPub : pub
    , redisSub : sub
    , redisClient : store}));
  io.set('origins', '*:*');
  io.enable('browser client minification');
  io.enable('browser client gzip');
});

io.set('authorization', function (hsData, accept) {
  if(hsData.headers.cookie) {
    console.log(hsData.address.address);
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
    if(hubotAddr.some(function(value) {
      return hsData.address.address.indexOf(value) > -1;
    }) || hsData.address.address.split('.')[0] == '10') {
      console.log(hsData.address.address);
      hsData.ballychat = {
        user : {
          username: process.env.HUBOT_NAME,
          provider: 'Hubot'
        }
      }

      console.log('Hubot?');

      return accept(null, true);

    } else {
      console.log(hsData.address.address);
      console.log('something faild');
      return accept(null, false);
    }
  }
});


io.sockets.on('connection', function (socket) {
  var hs = socket.handshake
    , nickname = hs.ballychat.user.username
    , provider = hs.ballychat.user.provider
    , userKey = provider + ":" + nickname
    , now = new Date();
  
  if(store.sismember('chat:rooms:home:members', nickname)) {
    utils.enterRoom(store, {nickname: nickname, room:'home'}, function() {
      socket.join('home');
      io.sockets.in('home').emit('user:get',{user:nickname});
    });
  }

  socket.on('me:chat:init', function(data) {
    store.smembers('chat:rooms', function(err, rooms) {
      data = {};
      data.rooms = rooms;
      store.smembers('chat:rooms:home:members', function(err, users) {
        data.users = users;
        socket.emit('chat:init', data);
      });
    });
  });

  socket.on('message:post', function(data) {
    var no_empty = data.msg.replace("\n","");
    if(no_empty.length > 0) {
      io.sockets.in(data.room).emit('message:get', {
        nickname: nickname,
        provider: provider,
        msg: data.msg
      });        
    }   
  });

  socket.on('room:post', function(data) {
    utils.createRoom(store, data, function() {
      io.sockets.emit('room:get', data);
    });
  });

  socket.on('disconnect', function() {
    utils.userDisconnect(store, nickname, io);
  });
});
