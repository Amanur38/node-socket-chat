var path = require('path');
var express = require('express');
var cors = require('cors')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(cors())
var port = process.env.PORT || 4000;

server.listen(port, function () {
    console.log('Listening on http://localhost:' + port);
});
app.use(express.static(path.join(__dirname, 'static')));
var numberOfUsers = 0;
io.on('connection', (socket) => {
    var userJoined = false;
    socket.on('new message', (msg) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: msg
        });
    });
    socket.on('user joined', (username) => {
        if (userJoined) return;
        socket.username = username;
        userJoined = true;
        numberOfUsers++;
        socket.emit('login', {
            numberOfUsers: numberOfUsers
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numberOfUsers: numberOfUsers
        });
    });
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });
    socket.on('disconnect', () => {
        if (userJoined) {
            --numberOfUsers;
            socket.broadcast.emit('user left', {
                username: socket.username,
                numberOfUsers: numberOfUsers
            });
        }
    });
});