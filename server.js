const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formMessage = require('./utilities/messages');
const {userJoin, getCurrentUser, userLeave, getUsers, getReadyUsers} = require('./utilities/users');
const {collectRounds, getRounds, resetRounds} = require('./utilities/questionRound');

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

        // Welcome the user to the quiz
        // Single client
        socket.emit('message', formMessage(botName, 'Welcome to the Quarantine Quiz'));

        // Broadcast when the user connects 
        // Broadcast emits to everyone except current user
        socket.broadcast.emit('message', formMessage(botName, `${user.username} has joined the chat`));

        // Send user info
        io.emit('users', {
            users: getUsers(),
            currentuser: getCurrentUser(socket.id),
            readyUsers: getReadyUsers()
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
        // Change button text
        socket.emit('btnReady', {
            user: getCurrentUser(socket.id)
        });
        // Get readt users ready
        const usersReady = getReadyUsers();
        // Check if there is more than one user
        if (users.length > 1) {
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

    // Listen for round submit
    socket.on('roundSubmit', (roundArr) => {
        const user = getCurrentUser(socket.id);
        collectRounds(socket.id, user.username, roundArr);
        const getRound = getRounds();
        console.log(getRound);
        io.emit('numOfRounds', {
            numOfRounds: getRound.length
        });
    });

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        io.emit('message', formMessage(user.username, message));
    });

    // Listen for quiz start
    socket.on('quizStart', (message) => {
        io.emit('message', formMessage(botName, message));
        io.emit('startCountdown');
    });

    // Listen for get round
    socket.on('getRound', () => {
        const rounds = getRounds();
        // Send rounds to frontend
        socket.emit('sendRound', (rounds));
    });

    // Run when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        const users = getUsers();
        if (user) {
            // All Clients
            io.emit('message', formMessage(botName, `${user.username} has disconnected`));
            console.log('User disconnected');

            // Send user info
             io.emit('users', {
            users: getUsers()
            });
        }

        // If all users leave
        if (users.length == 0) {
            resetRounds();
        }
    });
});

const port = 8080 || process.env.port;

server.listen(port, () => console.log(`Server running on port: ${port}`));