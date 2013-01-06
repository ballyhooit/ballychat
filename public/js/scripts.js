$(function() {
  resizeHandle();
  $('#settings-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
  $('.nano').nanoScroller();
  $(window).resize(function() {
    resizeHandle();
  });
});

var socket = io.connect('https://localhost', {secure:true});
var delivery; 
socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (){
  delivery = new Delivery(socket);
  socket.emit('me:chat:init');

  document.getElementById('chat-input').ondrop = function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    console.log(file);
    delivery.send(file);
  };

  delivery.on('send.success', function(fileUID) {
    console.log('success');
  });
});

socket.on('chat:init', function(data) {
  $('body').data('current-room','home');
  $('ul#room-list #room').remove();
  $('#users').empty();
  for(i = 0; i < data.rooms.length; i++) {
    $('ul#room-list').append(room_template_function({room:data.rooms[i]}));
  }
  for(i = 0; i < data.users.length; i++) {
    $('#users').append(user_template_function({user:data.users[i]}));
  }
});

socket.on('user:get', function(data) {
  if($('#users .'+data.user).length == 0) {
    $('#users').append(user_template_function(data));
  }
});

socket.on('user:delete', function(data) {
  $('#users .'+data.user).remove();
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
    var currentRoom = $('body').data('current-room');
    if(e.which == 13 && inputText) {

    socket.emit('message:post', {
      room: currentRoom,
      msg: inputText
    });

    $(this).val('');

    return false;
  }
});

$('ul#room-list').on('click','li', function(e) {
  var room = $(e.target).data('room');
  socket.emit('room:join', {room: room});
  console.log(room);
  $('body').data('current-room',room);
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
var room_template_function = Handlebars.compile('<li class="room"><a href="#" data-room="{{room}}">{{room}}</a></li>')