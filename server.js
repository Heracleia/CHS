var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = __dirname + '/views/';

app.get('/', function(req, res) {
	res.sendFile(path + 'index.html');
});

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));
app.use('/fonts', express.static('fonts'));
app.use('/sounds', express.static('sounds'));

io.on('connection', function(socket) {
	console.log('User connected');
	socket.on('disconnect', function() {
		console.log('User disconnected');
	});
	
	socket.on('recordStart', function() {
		console.log('Forwarding record start request');
		io.emit('recordStart');
	});
	
	socket.on('recordCancel', function() {
		console.log('Forwarding record cancel request');
		io.emit('recordCancel');
	});
	
	socket.on('recordComplete', function() {
		console.log('Forwarding record complete request');
		io.emit('recordComplete');
	});
});

http.listen(3000, function() {
	console.log('Listening on localhost:3000');
});