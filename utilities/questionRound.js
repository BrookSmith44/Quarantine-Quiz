// Create array for round
const allRounds  = [];

function collectRounds(id, username, questions) {
    roundObj = {
        id: id,
        username: username,
        questions: questions
    }

    // Push Object into array
    allRounds.push(roundObj);

    return allRounds;
}

module.exports = {
    collectRounds
};