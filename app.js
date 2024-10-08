const http = require('http');
const express = require('express')
const { Server } = require('socket.io');
const cors = require('cors');
const chatSocket = require('./webSockets/chatSocket')

//Database connection variable
const db = require('./functions/dbConnection')

//Importing Routes
const usersRoute = require('./routes/users');
const chatsRoute = require('./routes/chats');

const PORT = 9000;
const app = express();

//Create http server for both api requests and web socket connection
const server = http.createServer(app);

//Initialize socket.io defined in a separate file
const io = chatSocket(server);

//Middlewares
app.use(express.json()); //For parsing incoming json data
app.use(cors()); //It enables cors
/* It enables the express server to respond to preflight requests
 A preflight request is basically an OPTION request sent to the server before the actual request is sent,
 in order to ask which origin and which request options the server accepts */

//Routes
app.use('/users', usersRoute);
app.use('/chats', chatsRoute);

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

server.listen(9000, ()=>console.log(`Server Running on PORT ${PORT}`))