
/*
 * Initialize the application
 */

/*
 * Module dependencies
 */

var fs = require('fs');


/*
 * Initialize the 
 *
 * @param {Object} Redis client instance
 * API @public
 */

module.exports = function(client){

  /*
   * Clean all forgoten sockets in Redis.io
   */

  client.del('rooms:info', function(err, reply) {
    client.sadd('rooms:info','home');
  });


};

