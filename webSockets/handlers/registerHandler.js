const registerHandler = (socket, registeredUsers) => {
    socket.on('register', (userId) => {
        registeredUsers[userId] = socket.id;
        console.log(`Registered Users:`, registeredUsers);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });
};

module.exports = registerHandler;
