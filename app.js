const http = require('http');
const express = require('express')
const { Server } = require('socket.io');
const cors = require('cors');

//Database connection variable
const db = require('./functions/dbConnection')

//Require Function
const addFunction = require('./functions/addFunction')

//Importing Routes
const usersRoute = require('./routes/users');
const chatsRoute = require('./routes/chats');

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

app.use('/users', usersRoute);
app.use('/chats', chatsRoute);

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
  socket.on('chat', async (data) => {
    const { from, to, message, chatId } = data;
    console.log('data', data)

    try {
      const query = 'INSERT INTO chats (`from`, `to`, `message`, `chatId`) VALUES (?)'
      await addFunction(query, [from, to, message, chatId])

      //Checking if the receiver is online
      const targetSocketId = registeredUsers[data.to];
  
      if (targetSocketId) {
        /*** Note:  "If user is available then store the message in the database send it to reciever and emit it to sender" ***/
  
        // Send the message only to the connected specific user socket
        io.to(targetSocketId).emit('message', data);
        socket.emit('message', data);
        console.log(`Message from User ${data.from} to User ${to}: ${message}`);
      } else {
        console.log(`User ${to} not found`);
        /*** Note:  "If user is not available then only store the message in the database and emit it to sender" ***/
        socket.emit('message', data);
      }

    } catch (error) {
      socket.emit('message', error);
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

//Closing database connection on app close
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.stack);
    } else {
      console.log('MySQL connection closed.');
    }
    process.exit();
  });
});

app.get('/', (req, res)=>{
    res.send('GET API')
})

server.listen(9000, ()=>console.log(`Server Running on PORT ${PORT}`))