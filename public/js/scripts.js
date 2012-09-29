var socket = io.connect();

  socket.on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });

  socket.on('connect', function (){
    console.info('successfully established a working connection');
    if($('.chat .chat-box').length == 0) {
      socket.emit('history request');
    }
  });

socket.on('message:send', function(data) {
	$('#chat-container').append('<p>'+data.msg+'</p>');
});

$(".chat-input input").keypress(function(e) {
    var inputText = $(this).val().trim();
    if(e.which == 13 && inputText) {

    socket.emit('me:message:send', {
      room: 'Test',
      msg: inputText
    });

	$(this).val('');

      return false;
    }
  });