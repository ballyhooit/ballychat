var socket = io.connect();

socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (){
  socket.emit('me:chat:init');
});

socket.on('chat:init', function(data) {
  $('ul#room-list').empty();
  $('#chat-users').empty();
  for(i = 0; i < data.rooms.length; i++) {
    $('ul#room-list').append('<li><a href="#" id="'+data.rooms[i]+'">'+data.rooms[i]+'</a></li>');
  }
  for(i = 0; i < data.users.length; i++) {
    $('#chat-users').append('<div id="user"><p>'+data.users[i]+'</p></div>');
  }
});

socket.on('user:join', function(data) {
  console.log(data);
  console.log($('#chat-users .'+data.user).length);
  if($('#chat-users .'+data.user).length == 0) {
    $('#chat-users').append('<div id="user" class="'+data.user+'"><p>'+data.user+'</p></div>');
  }
});

socket.on('user:leave', function(data) {
  $('#chat-users .'+data.user).remove();
});

socket.on('message:send', function(data) {
  console.log(data);
	$('#chat-content').append('<p><strong>'+data.nickname+': </strong>'+data.msg+'</p>');
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