
/*
 * Initialize the application
 */

/*
 * Module dependencies
 */

var fs = require('fs'),
	utils = require('./utils.js');


/*
 * Initialize the 
 *
 * @param {Object} Redis client instance
 * API @public
 */

module.exports = function(client) {

  /*
   * Clean all forgoten sockets in Redis.io
   */

  client.del('chat:rooms:home:members', 'chat:rooms:home', 'chat:rooms', 'chat:users', function(err, reply) {
    if(!err) {
    	client.sadd('chat:rooms', 'home');
    } else {
      console.log('Error cleaning up')
    }
  });

};

