$(function() {
  resizeHandle();
  $('.nano').nanoScroller();
  $(window).resize(function() {
    resizeHandle();
  });
});

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
    $('ul#room-list').append(room_template_function({room:data.rooms[i]}));
  }
  for(i = 0; i < data.users.length; i++) {
    $('#chat-users').append(user_template_function({user:data.users[i]}));
  }
});

socket.on('user:get', function(data) {
  if($('#chat-users .'+data.user).length == 0) {
    $('#chat-users').append(user_template_function(data));
  }
});

socket.on('user:delete', function(data) {
  $('#chat-users .'+data.user).remove();
});

socket.on('message:get', function(data) {
  $('#chat-content-messages').append(message_template_function(data));
  $('.nano').nanoScroller().nanoScroller({scroll:'bottom'});
});

socket.on('room:get', function(data) {
  $('ul#room-list').append(room_template_function(data));
});

$("#chat-input textarea").keypress(function(e) {
    var inputText = $(this).val().trim();
    if(e.which == 13 && inputText) {

    socket.emit('message:post', {
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

    socket.emit('room:post', {
      room: inputText
    });

    $(this).val('');
    $('#room-create').modal('hide');
    return false;
  }
});

function resizeHandle() {
  chatHeight = $(window).height() - $('header.navbar').height() - $('#chat-input').height() - 25;

  $('#chat-container').height(chatHeight);
  $('.nano').nanoScroller().nanoScroller({scroll:'bottom'});
}

var message_template_function = Handlebars.compile("<p><strong>{{nickname}} : </strong>{{msg}}</p>");
var user_template_function = Handlebars.compile('<div id="user" class="{{user}}"><p>{{user}}</p></div>');
var room_template_function = Handlebars.compile('<li><a href="#" id="{{room}}">{{room}}</a></li>')