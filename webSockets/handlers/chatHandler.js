const addFunction = require('../../functions/addFunction');

const chatHandler = (socket, io, registeredUsers) => {
    socket.on('chat', async (data) => {
        const { from, to, message, chatId } = data;
        console.log('Received chat data:', data);

        try {
            const targetSocketId = registeredUsers[to];

            if (targetSocketId) {
                io.to(targetSocketId).emit('message', data);
                socket.emit('message', data);
                console.log(`Message from User ${from} to User ${to}: ${message}`);
            } else {
                console.log(`User ${to} not found`);
                socket.emit('message', data);
            }

            const query = 'INSERT INTO chats (`from`, `to`, `message`, `chatId`) VALUES (?)';
            await addFunction(query, [from, to, message, chatId]);

        } catch (error) {
            console.error('Error handling chat:', error);
            socket.emit('message', { error: 'An error occurred while sending the message.' });
        }
    });
};

module.exports = chatHandler;
