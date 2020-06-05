// Get user Form by ID
const userForm = document.getElementById('userForm');
// Get chat form by ID
const chatForm = document.getElementById('chat-form');
// Get ready form by ID
const readyForm = document.getElementById('ready-form');
// Get create round form by ID
const btnCreateRound = document.getElementById('create-form');
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
// get create form by id
const createRoundForm = document.getElementById('create-round');
// Get answer options div by class
const ansOptions = document.querySelector('.ans-options');
// get answer radio by ID
const ansRadio  = document.getElementById('answer');
// const get form
// Get username from URL
 //let params = new URLSearchParams(location.search);
 //const username = params.get('username');
 // Set empty username variable
let username= '';
// Set num to 2
let num = 2;
// Set answer number to 0
let ansNum = 1;
// Number of questions
let QNum = 1;



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
    // hide user and chat containers and display create round container
    userContainer.style.display = 'none';
    chatContainer.style.display = 'none';
    // Show create round container
    createRoundContainer.style.display = 'flex';

    btnAdd.addEventListener('click', () => {
        // Function to add question inputs into form
        addQuestion(num);
        // Increment num
        num++;
    });

    createRoundForm.addEventListener('submit', (e) => {
        e.preventDefault();
        roundArr = [];
        // Loop through all questions
        for (i = 1; i <= QNum; i++) {
            // Loop through question input
            const questionInput = document.getElementById(`questionInput-${i}`);
            // Loop through marks input
            const marksInput = document.getElementById(`marks-${i}`);
            // Loop through answer options
            const voteRadio = document.getElementById(`vote-${i}`);
            const answerRadio = document.getElementById(`answer-${i}`);
            const choiceRadio = document.getElementById(`choice-${i}`);
            
            // Get question text
            const question = questionInput.value;
            // get mark number
            const mark = marksInput.value;
            // empty varirable for type
            let type = '';
            // empty varirable for answer
            let answer = '';
            // empty array for choice
            let choices = [];
            // Empty quesion object
            let questionObj = {};

            // If vote is checked
            if (voteRadio.checked) {
                // set type to vote
                 type = voteRadio.value;

                 // Set object for each question
                questionObj = {
                    question: question,
                    mark: mark,
                    type: type
                }
            } 
            // Else if answer is checked
            else if(answerRadio.checked) {
                // set type to answer
                 type = answerRadio.value;
                 const answerInput = document.getElementById(`answer-input-${i}`);
                 answer = answerInput.value;

                 // Set object for each question
                questionObj = {
                    question: question,
                    mark: mark,
                    answerObj: {
                        answer: answer,
                        type: type
                    }
                }
            } 
            // Else if choice is checked
            else if(choiceRadio.checked) {
                // set type to choice
                 type = choiceRadio.value;
                 console.log(ansNum);
                 // for loop to get all the choices
                 for(i = 1; i <= ansNum-1; i++) {
                     console.log(i, ansNum)
                     const choicesInput = document.getElementById(`choice-input-${i}`);
                     choices.push(choicesInput.value);

                     // Set object for each question
                     questionObj = {
                        question: question,
                        mark: mark,
                         answerObj: {
                             answer: answer,
                             type: type,
                             choices: choices
                            }
                     }
                 }
            }

            // Push object into array
            roundArr.push(questionObj);
        }
        console.log(roundArr);

        socket.emit('roundSubmit', roundArr);
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
    btnCreateRound.addEventListener('submit', (e) => {
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
                    <label for="question"><h3>Question: ${num}</h3></label><input class="questionInput" id="questionInput-${num}" type="text" placeholder="Write Question"/>
                </div>
                <label for="imgUpload"><h3>Upload Image (If Needed)</h3></label><input id="imgUpload" type='file' />
                <div class="marksContainer">
                    <label for="marks"><h3>Marks: </h3></label><input class="marks" id="marks-${num}" type="number" min="1" />
                </div>
                <div id="options-${num}" class="ans-options">
                    <label><h3>Answer Options: </h3></label>
                    <div id="vote-div" class="option"><label for="vote">Vote</label><input id="vote-${num}" class="answer" type="radio" name="ans-option-${num}" value="vote" /></div>
                    <div id="answer-div" class="option"><label for="answer">Answer</label><input id="answer-${num}" class="answer" type="radio" name="ans-option-${num}" value="answer" onchange="createAnswerInput(this);" /></div>
                    <div id="choice-div" class="option"><label for="choice">Multiple Choice</label><input id="choice-${num}" class="answer" type="radio" name="ans-option-${num}" value="choice" onchange="createNumOfChoices(this);" /></div>
                </div>  
            </div>
    `;
    // append div from form
    addQDiv.appendChild(questionDiv);

    // Increment QNum
    QNum++;
}

// Answer input 
function createAnswerInput(element) {
    // Get parent element by ID
    const ansOptionParent = document.getElementById(element.parentNode.parentNode.id);
    // Get answer input by class name
    const choiceInput = ansOptionParent.querySelector('.numOfChoice');
    // Get answer input by class name
    const ansInput = ansOptionParent.querySelector('.answer-input');
    // Get choices div
    const choicesDiv = ansOptionParent.querySelector('.choices-div');
    console.log(ansOptionParent.childNodes);
    // If choice input exists
    if(choiceInput) {
        choicesDiv.remove();
    }
    if(!ansInput) {
        // Create new div
        const div = document.createElement('Div');
        // Add class to div
        div.classList.add('answer-container');
        // Set id for div
        div.setAttribute('id', `answer-${QNum}`);
        // Set content of div
        div.innerHTML = `
        <input id="answer-input-${QNum}" class="answer-input" type="text" placeholder="Write Answer" />
        `;
        // Append div from ans-options div
        ansOptionParent.appendChild(div);   
    }
}

// choice input
function createNumOfChoices(element) {
    // Get parent element by ID
     const ansOptionParent = document.getElementById(element.parentNode.parentNode.id);
    // Get answer input by class name
    const ansInput = ansOptionParent.querySelector('.answer-input');
    // Get answer input by class name
    const choiceInput = ansOptionParent.querySelector('.numOfChoice');
    // If the answer input exists
    if(ansInput) {
        // Hide answer input
        ansInput.remove();
    }
    // If number of choice input does not exist
    if(!choiceInput) {
        // Create new div
        const div = document.createElement('Div');
        // Add class to div
        div.classList.add('choices-div');
        // Set content of div
        div.innerHTML = `
        <input class="numOfChoice" type="number" value="0" min="1" onchange="numOfAnswers(this);" />
        `;
        // Append div from ans-options div
        ansOptionParent.appendChild(div); 
    } 
}
    
    function numOfAnswers(element) {
        // Get parent element by ID
        const ansOptionParent = document.getElementById(element.parentNode.parentNode.id);
        console.log(ansOptionParent);
        // Get answer input by class name
        const choiceInput = ansOptionParent.querySelector('.numOfChoice');
        // Get div for choices 
        const choicesDiv = ansOptionParent.querySelector('.choices-div');
        let choiceValue = choiceInput.value;
        choiceValue++;
        if (choiceValue > ansNum) {
            // for loop to create answer inpu
            for (ansNum; ansNum < choiceValue; ansNum++) {
            // Create new div
            const div = document.createElement('Div');
            // Create class for div
            div.classList.add('choices');
            // Create is for div
            div.setAttribute('id', `choices-${ansNum}`)
            // Set content of div
            div.innerHTML = `
            <label for="choice-input"><h3>Choice ${ansNum}: </h3></label><input id="choice-input-${ansNum}" class="answer-input" type="text" placeholder="Write Answer" />
            `;
            // Append div from ans-option
            // Append div from ans-options div
            choicesDiv.appendChild(div); 
            console.log(ansNum);
            }
        } else if (choiceValue < ansNum) {
            console.log(`answer-${ansNum-1}`);
            for (ansNum; ansNum > choiceValue; ansNum--) {
                // Get div by ID
                const div = document.getElementById(`answer-${ansNum-1}`);
                console.log(div);
                // remove div
                div.remove();
            }
        }
    }