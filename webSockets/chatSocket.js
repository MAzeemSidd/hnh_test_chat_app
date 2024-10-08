// socket.js
const { Server } = require('socket.io');

const registerHandler = require('./handlers/registerHandler');
const chatHandler = require('./handlers/chatHandler');

const chatSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
            credentials: true
        }
    });

    const registeredUsers = {};

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // Register user
        registerHandler(socket, registeredUsers);

        // Handle chat
        chatHandler(socket, io, registeredUsers);

        // Handle disconnection
        socket.on('disconnect', () => {
            for (const [userId, sockId] of Object.entries(registeredUsers)) {
                if (sockId === socket.id) {
                    delete registeredUsers[userId];
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

module.exports = chatSocket;
