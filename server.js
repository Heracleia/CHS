var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
var path = __dirname + '/views/';

router.use(function(req, res, next) {
	console.log('/', req.method);
	next();
});

router.get('/', function(req, res) {
	res.sendFile(path + 'index.html');
});

app.use('/', router);
app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));
app.use('/fonts', express.static('fonts'));
app.use('/sounds', express.static('sounds'));

app.listen(3000, function() {
	console.log('Running at port 3000');
});