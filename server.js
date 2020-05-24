const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use (express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', socket => {
    console.log('New Web Socket Connection');

    // Run when user disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'User has disconnects');
        console.log('User disconnected');
    });
});

const port = 3000 || process.env.port;

server.listen(port, () => console.log(`Server running on port: ${port}`));