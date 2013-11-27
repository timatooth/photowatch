/**
* Photo Watch Client
* @author Tim Sullivan <tim@timatooth.com>
* @license MIT
*/

var socket = io.connect();
var lastImage;

socket.on('new-photo', function(photo) {

    var photoBack = $('<div/>', {
	class: 'photoBack',
    }).prependTo('.photoArea');

    var img = $('<img/>', {
	//id: 'foo', TODO - METADATA
	src: photo['url'],
	//title: '',
	class: 'photo',
    }).appendTo(photoBack).hide();
    $(img).load(function(){
	//still buggy will deal to later
	newDate = new Date();
	newDate.setSeconds(newDate.getSeconds() - 3);
	if(lastImage < newDate){
	    $(this).fadeIn("slow");
	    lastImage = new Date();
	} else {
	    //defer the loading of a new image by 3 seconds.
	    setTimeout(function(obj){
		//alert('deferred called');
		$(obj).fadeIn();
	    }, 3000, $(this));
	}
    });
    
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
    //set a date of last image to be in the past.
    lastImage = new Date()
    lastImage.setSeconds(lastImage.getSeconds() - 10);
});
