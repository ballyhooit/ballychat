
/*
 * Restrict paths
 */

exports.restrict = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.redirect('/');
};

/*
 * Checks if room exists
 */
exports.roomExists = function(client, data) {
  client.sismember('chat:rooms', data.room , function(err, reply) {
    return reply;
  });
};

/*
 * Creates a room
 */       
exports.createRoom = function(client, data, next) {
  var test = client.sismember('chat:rooms', data.room);
  console.log(test);
  console.log(exports.roomExists(client,data));
  if(test == true) {
    console.log('room does not exist');
    client.sadd('chat:rooms',data.room, function(err, reply) {
      console.log('test');
      if(reply == 1) {
        next();
      } else {

      }
    })
  }
};

/*
 * Get connected users at room
 */

exports.getUsersInRoom = function(client, data) {
  client.smembers('chat:'+data.room+':members', function(err, reply) {
    return reply;
  });
};

/*
 * Enter to a room
 */

exports.enterRoom = function(client, data, next){
  client.sadd('chat:rooms:'+data.room+':members',data.nickname, function(err, reply) {
    if(!err) {
      client.sadd('chat:users:'+data.nickname+':rooms', data.room, function(er, rep) {
        if(!err) {
          next();
        }
      });
    }
  });
};

exports.leaveRoom = function(client, nickname, room, io) {
  client.srem('chat:rooms:'+room+':members', nickname, function(err,reply) {
    io.sockets.in(room).emit('user:delete', {user: nickname});
  });
};

/*
 * Get rooms that a user is a member of
 */

exports.getUserRooms = function(client, data) {
  client.smembers('chat:users:'+data.nickname+':rooms', function(err, reply) {
    return reply;
  });
};

exports.userDisconnect = function(client, nickname, io) {
  client.smembers('chat:users:'+nickname+':rooms', function(err, rooms) {
    rooms.every(function(element, index, array) {
      exports.leaveRoom(client, nickname, element, io);
    })
    //client.srem('chat:users',nickname);
  });
};


/*
 * Sort Case Insensitive
 */
exports.caseInsensitiveSort = function (a, b) { 
   var ret = 0;

   a = a.toLowerCase();
   b = b.toLowerCase();

   if(a > b) ret = 1;
   if(a < b) ret = -1; 

   return ret;
};