var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nskinect = io.of('/kinect');
var nssite = io.of('/site');
var path = __dirname + '/views/';
var kinectConnected = false;
var siteConnected = false;
var fs = require('fs');
var wstream = null;
var name = '';

app.get('/', function(req, res) {
	res.sendFile(path + 'index.html');
});

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));
app.use('/fonts', express.static('fonts'));
app.use('/sounds', express.static('sounds'));

nssite.on('connection', function(socket) {
	console.log('Site user connected');
	siteConnected = true;	
	if(kinectConnected) {
		socket.emit('kinectConnected');
	}
	
	socket.on('disconnect', function() {
		console.log('Site user disconnected');
		siteConnected = false;
	});	
	
	socket.on('recordStart', function(data) {
		console.log('Forwarding record start request for step ' + data);
		nskinect.emit('recordStart', data);
		var date = new Date();
		var filename = '';
		filename += 'tmp/' + date.getDay().toString() + '.' + date.getHours().toString() + '.' + date.getMinutes().toString() + '-step' + data.toString() + '-' + name + '.csv';
		wstream = fs.createWriteStream(filename);
	});
	
	socket.on('writeTime', function(data) {
		wstream.write(data + '\n');
	});
	
	socket.on('recordCancel', function() {
		console.log('Forwarding record cancel request');
		nskinect.emit('recordCancel');
		wstream.end();
	});
	
	socket.on('recordComplete', function() {
		console.log('Forwarding record complete request');
		nskinect.emit('recordComplete');
		wstream.end();
	});
	
	socket.on('participantName', function(data) {
		console.log('Forwarding participant name: ' + data);
		nskinect.emit('participantName', data);
		name = data.toString();
	});
	
	socket.on('reqVideo', function(data) {
		var path = 'C:/Users/dylan/AppData/Local/Packages/33ba04fc-07f2-4c70-b056-f6f14aeb9b79_2ysye2qyxxc1e/LocalState/23.08-step01-Dylan/';
		fs.readdir(path, function(err, files) {
			if(err)
				console.log(err);
			else {
				var i = 0;
				var buffers = [];
				setInterval(function() {
					if(i < files.length) {
						fs.readFile(path + files[i], function(err, buf) {
							if(err)
								console.log(err);
							else {
								socket.emit('image', {buffer: buf.toString('base64'), index: i, max: files.length});
								console.log(i);
							}
						});
						i++;
					}
				}, 100);				
			}
		});
	});
});

nskinect.on('connection', function(socket) {
	console.log('Kinect user connected');	
	kinectConnected = true;	
	if(siteConnected) {
		nssite.emit('kinectConnected');
	}
	
	socket.on('disconnect', function() {
		console.log('Kinect user disconected');
		kinectConnected = false;		
		if(siteConnected)
			nssite.emit('kinectDisconnected');
	});
});

http.listen(3000, function() {
	console.log('Listening on localhost:3000');
});