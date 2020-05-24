const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formMessage = require('./utilities/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utilities/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use (express.static(path.join(__dirname)));

const botName = 'Brook Bot';

// Run when a client connects
io.on('connection', socket => {
    console.log('New Web Socket Connection');

    // Add user 
    socket.on('joinLobby', ({username, ready}) => {
        const user = userJoin(socket.id, username, ready);
        
        socket.emit('message', formMessage(botName, 'Welcome to the Quarantine Quiz'));
    });

    // Run when user disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'User has disconnects');
        console.log('User disconnected');
    });
});

const port = 3000 || process.env.port;

server.listen(port, () => console.log(`Server running on port: ${port}`));