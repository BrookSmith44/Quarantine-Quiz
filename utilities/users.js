const users = [];

// Join user to chat
function userJoin(id, username, ready) {
    const user = {id, username, ready};

    users.push(user);

    return user;
}

// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
// Get all users
function getUsers() {
    return users;
}

// Get room users
function getReadyUsers() {
    return users.filter(user => user.ready === true);
}


module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getUsers,
    getReadyUsers
};
