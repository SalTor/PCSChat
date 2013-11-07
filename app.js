var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var usernames = [];

server.listen(3001);

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(usernames.indexOf(data)!=-1){
			callback(false); //If entered username already exists, don't allow
		}else{
			callback(true);
			socket.username = data; //Save username data to the username socket
			usernames.push(socket.username); //Add username to array
			updateUsernames(); //Add new user to list of conncted users
		}
	});

	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
		//Update list of users connected
	}

	socket.on('send message', function(data){
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	socket.on('disconnect', function(data){
		if(!socket.username) return; //If user closes tab before entering username, nothing happens
		usernames.splice(usernames.indexOf(socket.username), 1); //Else remove user who was occupying that socket
		updateUsernames(); //Update list of users connected
	});
});