const http = require('http');
const express = require('express')
const { Server } = require('socket.io');
const cors = require('cors');
const users = require('./routes/users');
// const getUsers = require('./functions/chatFunctions');

const PORT = 9000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(express.json());
app.use(cors());

app.use('/users', users);

// io.on('connection', socket => {
//     // socket.emit('get_users', {id: 111, name: 'Azeem'})

//     socket.on('chat', (data) => {
//         console.log('data', data)

//         // socket.broadcast.emit('message', {id: socket.id, ...data})
//         // socket.emit('message', {id: socket.id, ...data})
//         io.emit('message', {id: socket.id, ...data})
//     })
    
// })


// Object to store userId: socket.id pairs
const registeredUsers = {};

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // user registration with their user ID
  socket.on('register', (userId) => {
    registeredUsers[userId] = socket.id;
    console.log(`users:,`,registeredUsers);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });


  // For chat messages
  socket.on('chat', (data) => {
    const { to, message } = data;
    console.log('data', data)
    const targetSocketId = registeredUsers[data.to];

    if (targetSocketId) {
      // Send the message only to the connected specific user socket
      io.to(targetSocketId).emit('message', {
        from: data.from, // Sender's user ID
        to: data.to,
        message: message // Message
      });
      socket.emit('message', {
        id: socket.id,
        from: data.from, // Sender's user ID
        to: data.to,
        message: message // Message
      });
      console.log(`Message from User ${data.from} to User ${to}: ${message}`);
    } else {
      console.log(`User ${to} not found`);
    }
  });


  // For disconnection from socket
  socket.on('disconnect', () => {
    // Remove the user from the users object
    for (const [userId, sockId] of Object.entries(registeredUsers)) {
      if (sockId === socket.id) {
        delete registeredUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.get('/', (req, res)=>{
    res.send('GET API')
})

server.listen(9000, ()=>console.log(`Server Running on PORT ${PORT}`))