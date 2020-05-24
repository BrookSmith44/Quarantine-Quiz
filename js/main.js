// Get user form by ID
const userForm = document.getElementById('userForm');

// Get io from server.js
const socket = io();   

// User Enter Submit
userForm.addEventListener('submit', e => {
    // Prevent form submission
    e.preventDefault();

});