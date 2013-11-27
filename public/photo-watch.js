/**
* Photo Watch Client
* @author Tim Sullivan <tim@timatooth.com>
* @license MIT
*/

var socket = io.connect();
var lastImage;
var imageQueue = [];
var queueFlushState = false;
var deferTime = 3000;

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
	var now = new Date();
	if(lastImage.getTime() < now.getTime() - deferTime){
	    $(this).fadeIn("slow", addMeta(photo, photoBack));
	    lastImage = now;
	} else {
	    var obj = {
		jqueryObj: $(this),
		photo: photo,
		photoBack: photoBack };

	    imageQueue.push(obj);

	    if(!queueFlushState){
		setTimeout(imageQueueFlusher, deferTime);
		queueFlushState = true;
	    }
	}
    });
});

function addMeta(photo, photoBack){
    var photoMeta;
    if(photo.exif){
	photoMeta = $('<div/>', {
	    class: 'photoMeta',
	}).appendTo(photoBack);
	
	var f = ((photo.exif.FNumber != null ) ? photo.exif.FNumber : "-");
	var iso = ((photo.exif.ISO != null ) ? photo.exif.ISO : "-");
	var s = ((photo.exif.ExposureTime != null ) ? photo.exif.ExposureTime : "-");
	
	$('<div/>', {
	    html: s + "s <em>f</em> "+f+" ISO"+iso,
	    class: 'photoMetaText',
	}).appendTo(photoMeta);
	$(photoMeta).fadeIn("slow");
    }
}

function imageQueueFlusher(){
    if(imageQueue.length == 0){
	queueFlushState = false;
	return;
    }
    var obj = imageQueue.shift();
    var image = obj.jqueryObj;
    $(image).fadeIn("slow", addMeta(obj.photo, obj.photoBack));
    setTimeout(imageQueueFlusher, deferTime);
}

$(function(){
    //set a date of last image to be in the past.
    lastImage = new Date();
    lastImage.setSeconds(lastImage.getSeconds() - 10);
});
