/**
* Photo Watch Client
* @author Tim Sullivan <tim@timatooth.com>
* @license MIT
*/

var socket = io.connect();

socket.on('new-photo', function(photo) {

    var photoBack = $('<div/>', {
	class: 'photoBack',
    }).prependTo('.photoArea');

    var img = $('<img/>', {
	//id: 'foo',
	src: photo['url'],
	//title: '',
	class: 'photo',
    }).appendTo(photoBack);

    if(photo.exif){
	var photoMeta = $('<div/>', {
	    class: 'photoMeta',
	}).appendTo(photoBack);
	
	var f = ((photo.exif.FNumber != null ) ? photo.exif.FNumber : "-");
	var iso = ((photo.exif.ISO != null ) ? photo.exif.ISO : "-");
	var s = ((photo.exif.ExposureTime != null ) ? photo.exif.ExposureTime : "-");
	
	$('<div/>', {
	    html: s + "s <em>f</em> "+f+" ISO"+iso,
	    class: 'photoMetaText',
	}).appendTo(photoMeta);
    }

    
});


$(function(){
    
});
