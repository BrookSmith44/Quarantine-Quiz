// Create array for round
let allRounds  = [];

// Insert rounds into array
function collectRounds(id, username, questions) {
    roundObj = {
        id: id,
        username: username,
        questions:  questions
    }

    // Push Object into array
    allRounds.push(roundObj);
}

// Return array
function getRounds() {
    return allRounds;
}

// Reset array
function resetRounds() {
    allRounds = [];
}


module.exports = {
    collectRounds,
    getRounds,
    resetRounds
};