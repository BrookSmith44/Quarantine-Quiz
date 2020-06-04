const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formMessage = require('./utilities/messages');
const {userJoin, getCurrentUser, userLeave, getUsers, getReadyUsers} = require('./utilities/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use (express.static(path.join(__dirname, 'public')));

const botName = 'Brook Bot';

// Run when a client connects
io.on('connection', socket => {
    console.log('New Web Socket Connection');

    socket.on('joinLobby', (username) => {
        const user = userJoin(socket.id, username, false);
        console.log(user);

        // Welcome the user to the quiz
        // Single client
        socket.emit('message', formMessage(botName, 'Welcome to the Quarantine Quiz'));

        // Broadcast when the user connects 
        // Broadcast emits to everyone except current user
        socket.broadcast.emit('message', formMessage(botName, `${user.username} has joined the chat`));

        // Send user info
        io.emit('users', {
            users: getUsers(),
            currentuser: getCurrentUser(socket.id)
        });
    });

    // Listen for ready
    socket.on('ready', () => {
        // Get current user
        const user = getCurrentUser(socket.id);
        // Get all users array
        const users = getUsers();
        if(user.ready == false) {
            user.ready = true;
        }
        else {
            user.ready = false;
        }
        io.emit('id', {
            user: getCurrentUser(socket.id)
        });
        // Get readt users ready
        const usersReady = getReadyUsers();
        // Check if there is more than one user
        if (users.length > 1) {
            console.log('Users: ', users.length, 'Ready Users: ', usersReady.length);
            // Check if user array is the same length as the  user ready array
            if (users.length == usersReady.length) {
               // Emit ready all to check if all the users are ready to start the quiz
                socket.emit('readyAll', {
                users: getUsers(),
                usersReady: getReadyUsers()
        });
            }
        } 
    });

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        io.emit('message', formMessage(user.username, message));
    });

    // Listen for quiz start
    socket.on('quizStart', (message) => {
        io.emit('message', formMessage(botName, message));
    });

    // Run when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            // All Clients
            io.emit('message', formMessage(botName, `${user.username} has disconnected`));
            console.log('User disconnected');

            // Send user info
        io.emit('users', {
            users: getUsers()
        });
        }
    });
});

const port = 3000 || process.env.port;

server.listen(port, () => console.log(`Server running on port: ${port}`));