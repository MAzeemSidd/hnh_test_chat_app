const http = require('http');
const express = require('express')
const { Server } = require('socket.io');
const cors = require('cors');
const users = require('./routes/users')

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

io.on('connection', socket => {
    // console.log(`A new user has connected, ${socket}`)
    // const data = JSON.stringify({id: socket.id}, null, 2)
    // fs.writeFile('data.json', data, 'utf8', (err) => {
    //     if(err) console.log(err)
    // })

    // socket.on('clientMessage', (message) => {
    //     console.log(`Message from client ${socket.id}: ${message}`);

    //     // // Send a response back to this specific client
    //     // socket.emit('serverMessage', `Server received your message: "${message}"`);
    // });
    // console.log(`User connected, socket ID: ${socket.id}`);

    // // Listen for a joinRoom event
    // socket.on('joinRoom', (room) => {
    //     socket.join(room);
    //     console.log(`${socket.id} joined room: ${room}`);
        
    //     // Notify the room that a user has joined
    //     socket.to(room).emit('userJoined', `${socket.id} has joined the room.`);
    // });

    // // Listen for private messages sent to the room
    // socket.on('roomMessage', ({ room, message }) => {
    //     console.log(`Message from ${socket.id} to room ${room}: ${message}`);
    //     io.to(room).emit('receiveMessage', {
    //         sender: socket.id,
    //         message,
    //     });
    // });

    // // Clean up when the user disconnects
    // socket.on('disconnect', () => {
    //     console.log(`User with socket ID ${socket.id} disconnected`);
    // });

    // console.log('user connected', socket.id)
    socket.on('chat', (data) => {
        socket.broadcast.emit('message', {id: socket.id, ...data})
        socket.emit('message', {id: socket.id, ...data})
    })
    
})

app.get('/', (req, res)=>{
    res.send('GET API')
})

server.listen(9000, ()=>console.log(`Server Running on PORT ${PORT}`))