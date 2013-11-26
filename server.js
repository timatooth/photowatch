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
var watch = require('watch');
var path = require('path');

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

    socket.on('setPseudo', function(data){
	socket.set('pseudo', data);
    });

    socket.on('message', function (message) {
	socket.get('pseudo', function (error, name) {
	    var data = { 'message' : message, pseudo : name };
	    socket.broadcast.emit('message', data);
	    console.log(name + ": " + message);
	})
    });
    
});

watch.createMonitor(__dirname + '/public/photos',
		    {ingoreDotFiles: true},
		    function (monitor) {
			monitor.on("created", function (f, stat) {
			    // Handle new files
			    //this is a work-around on osx for the event double firing bug.
			    if (monitor.files[f] === undefined) {
				var ext = path.extname(f);
				var allowedExt = ['.jpg', '.png', '.gif'];
				if(allowedExt.indexOf(ext) >= 0 ){
				    var photo =  path.relative(path.join(__dirname, "public"), f);
				    /**
				       We need to set a timeout before sending the new-photo message because
				       the watcher may have detected the new image before it has been completely
				       written to disk. 
				    */
				    setTimeout(broadcastPhoto, 15000, photo);
				}
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
    console.log("broadcasting photo: " + photo );
    io.sockets.emit('new-photo', photo);
}
