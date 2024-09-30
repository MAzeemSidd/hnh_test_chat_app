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

io.on('connection', socket => {
    // socket.emit('get_users', {id: 111, name: 'Azeem'})

    socket.on('chat', (data) => {
        console.log('data', data)

        socket.broadcast.emit('message', {id: socket.id, ...data})
        socket.emit('message', {id: socket.id, ...data})
    })
    
})

app.get('/', (req, res)=>{
    res.send('GET API')
})

server.listen(9000, ()=>console.log(`Server Running on PORT ${PORT}`))