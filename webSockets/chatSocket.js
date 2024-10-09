// socket.js
const { Server } = require('socket.io');

const registerHandler = require('./handlers/registerHandler');
const chatHandler = require('./handlers/chatHandler');
const getFunction = require('../functions/getFunction')
const jwt = require('jsonwebtoken');

const chatSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization", "userId"],
            credentials: true
        }
    });

    const registeredUsers = {};

    io.on('connection', async (socket) => {
        console.log(`New connection: ${socket.id}`);

        //Get JWT Token passed from client for authentication
        const token = socket.handshake.headers['authorization']?.split(' ')[1];
        console.log('token---', token)

        if(!token) {
            socket.disconnect(); // Disconnect the socket
            return; // Exit the connection handler 
        }
        
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) return err // Forbidden - If jwt verification give error
            return user // else return user
        });

        if(!user?.id) {
            socket.disconnect(); // Disconnect the socket
            return; // Exit the connection handler
        }

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
