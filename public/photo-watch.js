/**
* Photo Watch Client
* @author Tim Sullivan <tim@timatooth.com>
* @license WTFPL
*/

var socket = io.connect();

socket.on('new-photo', function(photo) {
    $('.photoArea').prepend("<img src='"+photo+"' />").hide().fadeIn();
});

$(function(){
    
});
