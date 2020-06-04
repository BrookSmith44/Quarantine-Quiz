// Get user Form by ID
const userForm = document.getElementById('userForm');
// Get chat form by ID
const chatForm = document.getElementById('chat-form');
// Get ready form by ID
const readyForm = document.getElementById('ready-form');
// Get create round form by ID
const createRoundForm = document.getElementById('create-form');
// Get chat main by ID
const chatMain = document.getElementById('chat-main');
// Get chat container by class
const chatContainer = document.querySelector('.chat-container');
// Get user container by class
const userContainer = document.querySelector('.user-container');
// Get users div by class
const usersDiv = document.querySelector('.users');
// Get messages by class 
const messagesDiv = document.querySelector('.messages');
// Get create round container by ID
const createRoundContainer = document.getElementById('create-container');
// get create round form by id
const addQDiv = document.getElementById('additional-question');
// Get add question button
const btnAdd = document.getElementById('btnAdd');
// Get username from URL
 //let params = new URLSearchParams(location.search);
 //const username = params.get('username');
let username= '';



// Get io from server.js
const socket = io();

// User submit
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = e.target.elements.userInput.value; 

    userLobby();
    displayUsers();
});

function CreateRound() {
    let num = 2;
    // hide user and chat containers and display create round container
    userContainer.style.display = 'none';
    chatContainer.style.display = 'none';
    // Show create round container
    createRoundContainer.style.display = 'flex';

    btnAdd.addEventListener('click', () => {
        addQuestion(num);
    });
}

// Function to set up lobby
function userLobby()
{
    // Join Lobby
    socket.emit('joinLobby', username);

    // get users
    socket.on('users', ({users}) => {
        outputUsers(users);
    });

    // Message from server
    socket.on('message', message => {
        outputMessage(message);

        // Scroll down to new message
        messages.scrollTop = chatMain.scrollHeight;
    });

    // Message submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get message text
        const message = e.target.elements.message.value;
        
        // Emit message to the server
        socket.emit('chatMessage', message);

        // Clear chat input after message
        e.target.elements.message.value = '';
        e.target.elements.message.focus();
    });

    // User submit ready
    readyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        socket.emit('ready');
    });

    socket.on('id', (user) => {
        userReady(user);
    });

    socket.on('readyAll', (users) => { 
        // If the users length is greater than 1
        if (users.users.length > 1) {
            // If users length is the same as readyAll length
            if (users.users.length === users.usersReady.length) {
                socket.emit('quizStart', 'Everyone is ready, time to start the quiz!' );
            }
        }
    });

    // Create round button
    createRoundForm.addEventListener('submit', (e) => {
        e.preventDefault();

        CreateRound();

    });

}

// Output message to frontend
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="msg">${message.username}</p>
    <p class="text">${message.text} <br> <span>${message.time}</span></p>
    `;

    messagesDiv.appendChild(div);
}

// Add users list to front end
function outputUsers(users) {
    usersDiv.innerHTML = `${users.map(user => 
        `<div id="${user.id}" class="user">${user.username}
        </div>`).join('')}`;
}

// Display userArea and chat
function displayUsers() {
    userForm.style.display = 'none';
    userContainer.style.display = 'flex';
    chatContainer.style.display = 'flex';
}

function userReady(user) {
    // Get user ready button by id
    btnReady = document.getElementById('btnReady');

    if (user.user.ready === true) {
        console.log(user.user.ready);
        // Get user div by id
        userDiv = document.getElementById(user.user.id);
        // Create header for ready users
        readyHeader = document.createElement('h3');
        // Set header text
        readyHeader.innerHTML = 'Ready!';
        // Insert h1 into user div
        userDiv.appendChild(readyHeader);
        // Set button text
        btnReady.innerHTML = 'Not Ready';
    } else {
        console.log(user.user.ready);
        // Hide ready header
        readyHeader.style.display = 'none';
        // Set button text
        btnReady.innerHTML = 'Ready';
    }
}

function addQuestion(num) {
    // Create new question div
    const questionDiv = document.createElement('Div');
    // Add class to div
    questionDiv.classList.add('question');
    questionDiv.innerHTML =`
    <div id="question-${num}" class="questions">
                <div class="question-input">
                    <label for="question"><h3>Question: ${num}</h3></label><input id="question" type="text" placeholder="Write Question"/>
                </div>
                <label for="imgUpload"><h3>Upload Image (If Needed)</h3></label><input id="imgUpload" type='file' />
                <div class="marks">
                    <label for="marks"><h3>Marks: </h3></label><input id="marks" type="number" min="1" />
                </div>
                <div class="asn-options">
                    <label><h3>Answer Options: </h3></label>
                    <div id="vote-div" class="option"><label for="vote">Vote</label><input id="vote" class="answer" type="radio" name="ans-option" value="vote" /></div>
                    <div id="answer-div" class="option"><label for="answer">Answer</label><input id="answer" class="answer" type="radio" name="ans-option" value="answer" /></div>
                    <div id="choice-div" class="option"><label for="choice">Multiple Choice</label><input id="choice" class="answer" type="radio" name="ans-option" value="choice" /></div>
                </div>  
            </div>
    `;
    // append div from form
    addQDiv.appendChild(questionDiv);

    // Increment num
    num++;
    console.log(num);
}