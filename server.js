/**
 * Photo Watch Server
 * @author Tim Sullivan <tim@timatooth.com>
 * @license MIT
 */
var http = require('http')
var express = require('express'), app = express();
var server = http.createServer(app).listen(3000);
var jade = require('jade');
var io = require('socket.io').listen(server);
var watch = require('watch'); //https://github.com/mikeal/watch
var path = require('path');
var ex = require('exiv2'); //https://github.com/dberesford/exiv2node/

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false });
app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
    res.render('index.jade');
});

io.sockets.on('connection', function(socket){
    //register events on connection
    console.log("Got new connection!");
});

watch.createMonitor(__dirname + '/public/photos',
		    {ingoreDotFiles: true},
		    function (monitor) {
			monitor.on("created", function (f, stat) {
			    // Handle new files
			    //this is a work-around on osx for the event double firing bug.
			    if (monitor.files[f] === undefined && isExtOk(f)) {
				//
				setTimeout(loadImageMeta, 1000, f);
			    }
			    
			})
			monitor.on("changed", function (f, curr, prev) {
			    // Handle file changes
			})
			monitor.on("removed", function (f, stat) {
			    // Handle removed files
			})
		    })

function broadcastPhoto(photo){
    var toSend = {
	url:  path.relative(path.join(__dirname, "public"), photo['filename']),
	exif: photo.exif,
	iptc: photo['iptc']
    };
    io.sockets.emit('new-photo', toSend);
}

function isExtOk(filename){
    var ext = path.extname(filename);
    var allowedExt = ['.jpg', '.png', '.gif'];
    if(allowedExt.indexOf(ext) >= 0 ){
	return true;
    }
    
    return false;
}

/**
* Build JSON data structure containing EXIF & IPTC information for transmission
* @param filename The valid filename of image to fetch metadata.
*/
function loadImageMeta(filename) {
    var photo = {
	filename: filename,
	exif: null,
	iptc: null
    };
    
    ex.getImageTags(filename, function(err, tags) {
	if(err != null ){
	    console.log("Error reading image metadata. Details:");
	    console.log(err);
	}
	
	var exif = {
	    ExposureTime: tags['Exif.Photo.ExposureTime'],
	    FNumber: tags['Exif.Photo.FNumber'],
	    ISO: tags['Exif.Photo.ISOSpeedRatings']
	};

	var iptc = {
	    ObjectName: tags['Iptc.Application2.ObjectName'],
	    Caption: tags['Iptc.Application2.Caption'],
	    Byline: tags['Iptc.Application2.Byline']
	}

	photo.exif = exif;
	photo.iptc = iptc;
	console.log(photo);
	broadcastPhoto(photo);
    });
    
}
