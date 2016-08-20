var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nskinect = io.of('/kinect');
var nssite = io.of('/site');
var path = __dirname + '/views/';
var kinectConnected = false;
var siteConnected = false;

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
	});
	
	socket.on('recordCancel', function() {
		console.log('Forwarding record cancel request');
		nskinect.emit('recordCancel');
	});
	
	socket.on('recordComplete', function() {
		console.log('Forwarding record complete request');
		nskinect.emit('recordComplete');
	});
	
	socket.on('participantName', function(data) {
		console.log('Forwarding participant name: ' + data);
		nskinect.emit('participantName', data);
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