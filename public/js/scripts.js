var socket = io.connect();

  socket.on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });

  socket.on('connect', function (){
    console.info('successfully established a working connection');
    if($('.chat .chat-box').length == 0) {
      
    }
  });

socket.on('message:send', function(data) {
	$('#chat-container').append('<p><strong>'+data.nickname+': </strong>'+data.msg+'</p>');
});

socket.on('room:create', function(data) {
  $('ul#room-list').append('<li><a href="#" id="'+data.room+'">'+data.room+'</a></li>');
  console.log(data);
});

$("#chat-input textarea").keypress(function(e) {
    var inputText = $(this).val().trim();
    if(e.which == 13 && inputText) {

    socket.emit('me:message:send', {
      room: 'home',
      msg: inputText
    });

    $(this).val('');

    return false;
  }
});

$("body").on('keypress', 'input.new-room', function(e) {
  var inputText = $(this).val().trim();
  if(e.which == 13 && inputText) {
    console.log('pressed enter');

    socket.emit('me:room:create', {
      room: inputText
    });

    $(this).val('');
    $('#room-create').modal('hide');
    return false;
  }
});