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
var exiv2 = require('exiv2'); //https://github.com/dberesford/exiv2node/
var PHOTOWATCH_DELAY = 0;

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
				setTimeout(loadImageMeta,
					   PHOTOWATCH_DELAY, {
					       filename: f,
					       callback: broadcastPhoto
					   });
			    }
			    
			})
		    });

function broadcastPhoto(photo){
    photo.url = path.relative(path.join(__dirname, "public"), photo['filename']);
    io.sockets.emit('new-photo', photo);
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
* @param args Object containing filename and callback.
*/
function loadImageMeta(args, callback) {
    var photo = {
	filename: args.filename,
	exif: null,
	iptc: null,
    };
    
    exiv2.getImageTags(args.filename, function(err, tags) {
	if(err != null ){
	    console.log("Error reading image metadata. Details:");
	    console.log(err);
	}
	
	photo.exif = {
	    ExposureTime: tags['Exif.Photo.ExposureTime'],
	    FNumber: tags['Exif.Photo.FNumber'],
	    ISO: tags['Exif.Photo.ISOSpeedRatings']
	};

	photo.iptc = {
	    ObjectName: tags['Iptc.Application2.ObjectName'],
	    Caption: tags['Iptc.Application2.Caption'],
	    Byline: tags['Iptc.Application2.Byline']
	}

	photo.width = 900; //FIXME: Get image dimensions.

	if (args.callback){
	    args.callback(photo);
	} else if (callback){
	    callback(photo);
	}
    });
    
}
