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

    var title = ((photo.iptc.ObjectName != null) ? photo.iptc.ObjectName : "");
    var img = $('<img/>', {
	src: photo['url'],
	title: title,
	class: 'photo',
	alt: title
    }).appendTo(photoBack).hide();

    $(img).load(function(){
	var now = new Date();

	//if last image was more than deferTime ms ago:
	if(lastImage.getTime() < now.getTime() - deferTime){
	    $(this).fadeIn("slow", addMeta(photo, photoBack));
	    lastImage = now;

	} else { //defer the load of the image by adding it to queue data struct.
	    var obj = {
		jqueryObj: $(this),
		photo: photo,
		photoBack: photoBack 
	    };

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
    if(photo.iptc || photo.exif){
	photoMeta = $('<div/>', {
	    class: 'photoMeta',
	}).appendTo(photoBack);
    }

    if(photo.exif){
	var f = ((photo.exif.FNumber != null ) ? photo.exif.FNumber : "-");
	var fspl = f.split("/");
	if(f != "-") {
	    f = Number(fspl[0]) / Number(fspl[1]);
	}
	var iso = ((photo.exif.ISO != null ) ? photo.exif.ISO : "-");
	var s = ((photo.exif.ExposureTime != null ) ? photo.exif.ExposureTime : "-");
	var spl = s.split("/");
	if(spl[1] == "1"){
	    s = spl[0];
	}
	
	$('<div/>', {
	    html: s + "s <em>f</em> "+f+" ISO"+iso,
	    class: 'photoExifText',
	}).appendTo(photoMeta);
    }
    
    if(photo.iptc){
	var title = ((photo.iptc.ObjectName != null ) ? photo.iptc.ObjectName : "");
	var author = ((photo.iptc.Byline != null ) ? photo.iptc.Byline : "Unknown Author");
	var caption = ((photo.iptc.Caption != null ) ? photo.iptc.Caption : "");
	
	$('<div/>', {
	    html: author,
	    class: 'photoAuthorText'
	}).appendTo(photoMeta);

	$('<div/>', {
	    html: title,
	    class: 'photoTitleText'
	}).appendTo(photoMeta);

	$('<div/>', {
	    html: caption,
	    class: 'photoCaptionText'
	}).appendTo(photoMeta);
    }
    
    $(photoMeta).fadeIn("slow");
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
