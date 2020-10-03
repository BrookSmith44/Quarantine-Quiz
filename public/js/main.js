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

// Function to run the quiz
function quizStart() {
    // Get elements by ID
    const quizContainer = document.getElementById('quiz-container');
    // Hide the user and chat containers and display the quiz container
    // Hide
    userContainer.style.display = 'none';
    chatContainer.style.display = 'none';
    // Display
    quizContainer.style.display = 'flex';

    // Get round
    socket.emit('getRound');

    // Recieve round array from server
    socket.on('sendRound', (rounds) => {
        // Set variables 
        // Set number of rounds
        roundNum = Object.keys(rounds).length;
        // Set current round number to 0
        i = 0;

        console.log(roundNum, i);
        // Call function to get questions
        getQuestions(rounds, roundNum, i);
    });
}

// Function to create a round
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

         // empty varirable for type
         let type = '';
         // empty varirable for answer
         let answer = '';
         // empty array for multiple answers
         let answers = [];
         // empty array for choice
         let choices = [];
         // Empty quesion object
         let questionObj = {};

        roundArr = [];
        // Loop through all questions
        for (q = 1; q <= QNum; q++) {
            // Loop through question input
            const questionInput = document.getElementById(`questionInput-${q}`);
            // Loop through marks input
            const marksInput = document.getElementById(`marks-${q}`);
            // Loop through answer options
            const voteRadio = document.getElementById(`vote-${q}`);
            const answerRadio = document.getElementById(`answer-${q}`);
            const choiceRadio = document.getElementById(`choice-${q}`);

            
            // Get question text
            const question = questionInput.value;
            // get mark number
            const mark = marksInput.value;

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
                // Get parent node
                const ansOptionParent = document.getElementById(`ans-options-${q}`);
                // Get array of answer inputs
                const answerInput = ansOptionParent.getElementsByClassName('answer-input');
                // Set answer number to number of inputs
                const ansNum = answerInput.length;
                // set type to answer
                 type = answerRadio.value;

                 // For loop runs through all answers
                 for(i = 1; i <= ansNum; i++) {
                    // Loop through all answer inputs
                    const multAnsInput = document.getElementById(`Q${q}-Answer-input-${i}`);
                    // Push input value into answers array
                    answers.push(multAnsInput.value);
                 }
                 // Set answer to answer input value
                 answer = answers;

                 // Set object for each question
                questionObj = {
                    question: question,
                    mark: mark,
                    type: type,
                    answerObj: {
                        answers: answers,
                    }
                }
            } 
            // Else if choice is checked
            else if(choiceRadio.checked) {
                // Get parent node
                const ansOptionParent = document.getElementById(`ans-options-${q}`);
                // Get array of answer inputs
                const answerInput = ansOptionParent.getElementsByClassName('answer-input');
                // Set answer number to number of inputs
                const ansNum = answerInput.length;
                 // set type to choice
                 type = choiceRadio.value;
                 // for loop to get all the choices
                 for(i = 1; i <= ansNum; i++) {
                     // Get choice input with ID
                     const choicesInput = document.getElementById(`Q${q}-Choice-input-${i}`);
                     // Get choice checkebox by ID
                    const choiceCheckbox = document.getElementById(`Q${q}-Choice-checkbox-${i}`);
                     // Push choice input value into choices array
                     choices.push(choicesInput.value);
                     // If checkbox is checked
                    if (choiceCheckbox.checked) {
                        answer = choicesInput.value;
                    }

                     // Set object for each question
                     questionObj = {
                        question: question,
                        mark: mark,
                        type: type,
                         answerObj: {
                             answer: answer,
                             choices: choices
                            }
                     }
                 }
            }

            // Push object into array
            roundArr.push(questionObj);
        }

        socket.emit('roundSubmit', roundArr);

        // display user and chat containers and hide create round container
        userContainer.style.display = 'flex';
        chatContainer.style.display = 'flex';
        // Show create round container
        createRoundContainer.style.display = 'none';

        socket.on('numOfRounds', ({numOfRounds}) => {

            outputRoundNum(numOfRounds);
        });
    });

}

// Function to set up lobby
function userLobby()
{
    // Join Lobby
    socket.emit('joinLobby', username);

    // get users
    socket.on('users', ({users, readyUsers}) => {
        outputUsers(users, readyUsers);
        //outputReadyUsers(readyUsers);
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

    socket.on('btnReady', (user) => {
        if (user.user.ready == true) {
            btnReady.innerHTML = 'Not Ready';
        } else {
            btnReady.innerHTML = 'Ready';
        }
    })

    socket.on('readyAll', (users) => { 
        // If the users length is greater than 1
        if (users.users.length > 1) {
            // If users length is the same as readyAll length
            if (users.users.length === users.usersReady.length) {
                socket.emit('quizStart', 'Everyone is ready, time to start the quiz!' );
            }
        }
    });

    socket.on('startCountdown', () => {
        outputQuizStart(1000);
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
function outputUsers(users, readyUsers) {
    
    usersDiv.innerHTML = `${users.map(user => 
        `<div id="${user.id}" class="user">${user.username}
        </div>`).join('')}`;

    // If the array contains users
    if(readyUsers.length > 0) {
        // Loop through array
        for(i = 0; i < readyUsers.length; i++) {
            const userDiv = document.getElementById(readyUsers[i].id);
            // Create header for ready users
            readyHeader = document.createElement('h3');
            // Set header text
             readyHeader.innerHTML = '<i class="fas fa-check-circle"></i>';
            // Insert h1 into user div
            userDiv.appendChild(readyHeader);
        }
    }
}

// Display userArea and chat
function displayUsers() {
    userForm.style.display = 'none';
    userContainer.style.display = 'flex';
    chatContainer.style.display = 'flex';
}

function outputReadyUsers(user) {
    // Get user div by id
    userDiv = document.getElementById(user.user.id);
    // Create header for ready users
    readyHeader = document.createElement('h3');
    // Set header text
    readyHeader.innerHTML = '<i class="fas fa-check-circle"></i>';
    // Insert h1 into user div
    userDiv.appendChild(readyHeader);
}

function userReady(user) {
    // If the current user is ready
    if (user.user.ready === true) {
        // Call output function
        outputReadyUsers(user);
    } else {
        // Hide ready header
        readyHeader.style.display = 'none';
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
                <div id="ans-options-${num}" class="ans-options">
                    <label><h3>Answer Options: </h3></label>
                    <div id="vote-div" class="option"><label for="vote">Vote</label><input id="vote-${num}" class="answer" type="radio" name="ans-option-${num}" value="vote" /></div>
                    <div id="answer-div" class="option"><label for="answer">Answer</label><input id="answer-${num}" class="answer" type="radio" name="ans-option-${num}" value="answer" onchange="createNumOfChoices(this, 'Answer');" /></div>
                    <div id="choice-div" class="option"><label for="choice">Multiple Choice</label><input id="choice-${num}" class="answer" type="radio" name="ans-option-${num}" value="choice" onchange="createNumOfChoices(this, 'Choice');" /></div>
                </div>  
            </div>
    `;
    // append div from form
    addQDiv.appendChild(questionDiv);

    // Scroll down to new question
    addQDiv.scrollTop = addQDiv.scrollHeight;

    // Increment QNum
    QNum++;
}

// choice input
function createNumOfChoices(element, type) {
    // Get parent element by ID
     const ansOptionParent = document.getElementById(element.parentNode.parentNode.id);
    // Get container by class name
    const choiceDiv = ansOptionParent.querySelector(`.Choices-div`);
    // Get container by clas name
    const answerDiv = ansOptionParent.querySelector(`.Answers-div`);
    // Get answer input by class name
    const choiceInput = ansOptionParent.querySelector(`.numOf${type}`);
 
    // If the answer input exists
    if (type == 'Answer' && choiceDiv) {
        // remove choice div
        choiceDiv.remove();
    } else if(type == 'Choice' && answerDiv) {
        // remove answer div
        answerDiv.remove();
    }
    // If number of choice input does not exist
    if(!choiceInput) {
        // Create new div
        const div = document.createElement('Div');
        // Add class to div
        div.classList.add(`${type}s-div-${QNum}`);
        // Set content of div
        div.innerHTML = `
        <input class="numOf${type}" type="number" value="0" min="1" onchange="numOfAnswers(this,  '${type}');" />
        `;
        // Append div from ans-options div
        ansOptionParent.appendChild(div); 
    } 
}
    
    function numOfAnswers(element, type) {
        // Get parent element by ID
        const ansOptionParent = document.getElementById(element.parentNode.parentNode.id);
        // Get answer input by class name
        const choiceInput = ansOptionParent.querySelector(`.numOf${type}`);
        // Get div for choices 
        const choicesDiv = ansOptionParent.querySelector(`.${type}s-div-${QNum}`);
        // Get anwer input
        const answerInput = ansOptionParent.getElementsByClassName('answer-input');
        let choiceValue = choiceInput.value;
        choiceValue++;
        let ansNum;
        if(answerInput.length == 0) {
            ansNum = 1;
        } else {
            ansNum = answerInput.length + 1;

        }

        if (choiceValue > ansNum) {
            // for loop to create answer inpu
            for (ansNum; ansNum < choiceValue; ansNum++) {
            // Create new div
            const div = document.createElement('Div');
            // Create class for div
            div.classList.add(type+'s');
            // Create is for div
            div.setAttribute('id', `Q${QNum}-${type}s-${ansNum}`);
            // Set different content for different asnwer type
            let content = '';
            if(type == 'Answer') {
                content = `
                <label for="Q${QNum}-${type}-input"><h3>${type} ${ansNum}: </h3></label><input id="Q${QNum}-${type}-input-${ansNum}" class="answer-input" type="text" placeholder="Write Answer" />
                ` ;
            } else if (type == 'Choice') {
                content = `
                <label for="Q${QNum}-${type}-input"><h3>${type} ${ansNum}: </h3></label><input id="Q${QNum}-${type}-input-${ansNum}" class="answer-input" type="text" placeholder="Write Answer" />
                <input id="Q${QNum}-${type}-checkbox-${ansNum}" type="checkbox" />` ;
            }
            // Set content of div
            div.innerHTML = content;
            // Append div from ans-option
            // Append div from ans-options div
            choicesDiv.appendChild(div); 
            }
            for (ansNum; ansNum > choiceValue; ansNum--) {
                // Get div by ID
                const div = document.getElementById(`${type}s-${ansNum-1}`);
                // remove div
                div.remove();
            }
        }
    }

    // Display number of rounds created by all users
    function outputRoundNum(RNum) {
        // Get element by ID
        const div = document.getElementById('round-header');
        // Set innerHTML
        div.innerHTML = `
        <h2>Rounds: ${RNum}</h2>
        `;
    }

    // Function to display a countdown to start the quiz
    function outputQuizStart(sec) {
       // Get element by ID
       const div = document.getElementById('round-header');
       // Create new div for countdown
       const countdownDiv = document.createElement('Div');
       // Set class for countdown div
       countdownDiv.classList.add('countdown-div');
       // Append countdown div of round header div
       div.appendChild(countdownDiv);

        // Countdown
        // Get current date/time + countdown time
        const countdownDate = new Date().getTime();

        // Update count every second
        let interval = setInterval(function() {
            // Get current date/time
            const now = new Date().getTime() - sec;

            // Get the difference between now and countdown date
            const difference = countdownDate - now;

            // Time calculations for seconds
            const seconds = Math.floor((difference % (1000 * 60 )) / 1000);

            // Display the countdown
            // Set innerHTML of countdown div
            countdownDiv.innerHTML = `<h2>The quiz will start in: ${seconds}</h2>`;

            // If the countdown is finished
            if (difference < 0) {
                countdownDiv.innerHTML = '<h2>Start Quiz</h2>';
                // Stop interval from running
                clearInterval(interval);
                // Start the quiz
                quizStart();
            }
        }, 500);
    }

    // Function to get questions
    function getQuestions(rounds, roundNum, i) {
        // Set variables for questions 
        questionNum = Object.keys(rounds[i].questions).length;
        // Check if variable already exists
        if (typeof currentQ == 'undefined') {
            // Set current question variable to 0
            currentQ = 0;
        }
        console.log(questionNum, currentQ);
        // Empty array for questions
        const questions = [];
        // Set empty type value
        let type = '';
        // Set empty question value
        let question = '';
        // Set empty mark value
        let mark = '';
        // Get the question type
        type = rounds[i].questions[currentQ].type;
            
        // Switch case for each type - switch case runs through questions array
        switch (type) {
            case 'vote' :
                // Get question and mark for currnt question
                question = rounds[i].questions[currentQ].question;
                marks = rounds[i].questions[currentQ].mark;
                const questionsObj = {
                    question: question,
                    marks: marks
                }
                // Push object into array
                questions.push(questionsObj);
                // Display question function
                displayVoteQuestion(question, marks, currentQ);
                break;
            case 'answer' :
                question = rounds[i].questions[currentQ].question;
                marks = rounds[i].questions[currentQ].mark;
                const multAnsNum = rounds[i].questions[currentQ].answerObj.answers.length;
                console.log(multAnsNum);
                DisplayAnswerQuestion(question, marks, currentQ, multAnsNum);
                break;
            case 'choice' :
                console.log(rounds[i]);
                question = rounds[i].questions[currentQ].question;
                marks = rounds[i].questions[currentQ].mark;
                const multChoiceNum = rounds[i].questions[currentQ].answerObj.choices.length;
                const choices = rounds[i].questions[currentQ].answerObj.choices;
                DisplayMultipleChoiceQuestion(question, marks, currentQ, multChoiceNum, choices);
                break;
        }
    }

    // DISPLAY QUESTIONS

    // Function to display vote question
    function displayVoteQuestion(question, mark, currentQ) {
        // Create div container for question
        const questionDiv = document.createElement('Div');
        // Set width attribute of div to 100%
        questionDiv.setAttribute('style', 'width:100%; display:flex; justify-content:center; align-items:center;');
        // Get quiz containter by id 
        const quizContainer = document.getElementById('quiz-container');
        // Create a array for user answers
        let userAnswers = [];

        const countdownDiv = document.createElement('Div');

        // Set innerHTML of new div
        questionDiv.innerHTML = `
            <form class="vote-question-form" id="vote-question-${currentQ}">
                <h2>${question}</h2>
                <input class="answer-input" id="user-answer-${currentQ}" type="text" placeholder="Enter your answer here..."/>
                <div id="quizbtns">
                    <input class="btn" id="btnQuizSubmit" type="submit"></input>
                </div>
            </form>
        `;
        // Append new div of quiz container
        quizContainer.appendChild(questionDiv);

        // Get quiz button element
        const quizSubmit = document.getElementById(`vote-question-${currentQ}`);
        
        // Get answer input element
        const answerInput = document.getElementById(`user-answer-${currentQ}`);

        // Listen for when user clicks question submit button
        quizSubmit.addEventListener('submit', (e) => {
            // Prevent page from refreshing
            e.preventDefault();

            const answer = answerInput.value;

            console.log('Submit answer', answer);

            // push user answer into array
            userAnswers.push(answer);
        });
    }

    // Function To Display Answer Question
    function DisplayAnswerQuestion(question, mark, currentQ, multAnsNum) {
        // Create div container for question
        const questionDiv = document.createElement('Div');
        // Set width attribute of div to 100%
        questionDiv.setAttribute('style', 'width:100%; display:flex; justify-content:center; align-items:center;');
        // Get quiz containter by id 
        const quizContainer = document.getElementById('quiz-container');
        // Create empty array for user answers
        let userAnswers = [];

        const countdownDiv = document.createElement('Div');

        console.log(question);

        // Set innerHTML of new div
        questionDiv.innerHTML = `
            <form class="vote-question-form" id="vote-question-${currentQ}">
                <h2>${question}</h2>
                <div id="ansArea"></div>
                <div id="quizbtns">
                    <input class="btn" id="btnQuizSubmit" type="submit"></input>
                </div>
            </form>
        `;
        // Append new div of quiz container
        quizContainer.appendChild(questionDiv);

        // Add answer input for multiple answers
        // get answer area div
        const ansArea = document.getElementById('ansArea');
        
        // Loop to create correct amount of answer inputs
        for (i = 0; i < multAnsNum; i++) {
            const div = document.createElement('Div');
            div.setAttribute('style', 'width: 100%; display: flex; flex-direction: row');
            const divNum = i + 1;
            // Set inner HTML for answer area
            div.innerHTML = `
            <h3 style="color:pink;">${divNum}: </h3><input class="answer-input" id="user-answer-${i}" type="text" placeholder="Enter your answer here..."/>
            `;

            // Apend new div in the answer area
            ansArea.appendChild(div);

        }

        // Get quiz button element
        const quizSubmit = document.getElementById(`vote-question-${currentQ}`);

        // Listen for when user clicks question submit button
        quizSubmit.addEventListener('submit', (e) => {
            // Prevent page from refreshing
            e.preventDefault();

            // Loop through answers given by user
            for (i = 0; i < multAnsNum; i++) {
                // Get the answer input
                const answerInput = document.getElementById(`user-answer-${i}`);

                const answer = answerInput.value;

                console.log('Submit answer', answer);

                userAnswers.push(answer);
            }

            alert(userAnswers);
            
        });
        
    }

    // Function To Display Multiple Choice Question
    function DisplayMultipleChoiceQuestion(question, mark, currentQ, multChoiceNum, choices) {
        // Create div container for question
        const questionDiv = document.createElement('Div');
        // Set width attribute of div to 100%
        questionDiv.setAttribute('style', 'width:100%; display:flex; justify-content:center; align-items:center;');
        // Get quiz containter by id 
        const quizContainer = document.getElementById('quiz-container');

        const countdownDiv = document.createElement('Div');

        console.log(question);

        // Set innerHTML of new div
        questionDiv.innerHTML = `
            <form class="vote-question-form" id="vote-question-${currentQ}">
                <h2>${question}</h2>
                <div id="ansArea"></div>
                <div id="quizbtns">
                    <input class="btn" id="btnQuizSubmit" type="submit"></input>
                </div>
            </form>
        `;
        // Append new div of quiz container
        quizContainer.appendChild(questionDiv);

        // Add answer input for multiple answers
        // get answer area div
        const ansArea = document.getElementById('ansArea');

        // create div 
        const div = document.createElement('Div');
        // Set inner HTML for the div
        div.innerHTML = `
        <label for="choice-options">Answer Options</label><select id="choice-options" class="choice-options" name="options"></select>
        `;

        // append div of answer area
        ansArea.appendChild(div);
        // Get select element by ID
        const select = document.getElementById('choice-options');
        console.log(select);
        
        // Loop to create correct amount of answer inputs
        for (i = 0; i < multChoiceNum; i++) {
            // Create select element
            const opt = document.createElement('Option');
            // Set the option value to the current index
            opt.value = choices[i];
            // Set innerHTML to the current value of the array
            opt.innerHTML = choices[i];

            // Apend new div in the answer area
            ansArea.appendChild(select);
            // Append option of the select element
            select.appendChild(opt);
        }


        // Get quiz button element
        const quizSubmit = document.getElementById(`vote-question-${currentQ}`);

        // Listen for when user clicks question submit button
        quizSubmit.addEventListener('submit', (e) => {
            // Prevent page from refreshing
            e.preventDefault();

            alert(select.options[select.selectedIndex].text);

            const answer = select.options[select.selectedIndex].text;

            console.log('Submit answer', answer);


        });   
    }