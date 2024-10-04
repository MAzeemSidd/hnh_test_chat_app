const mysql = require('mysql2');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'test_chat_app_db',
});

// Connect to the database
connection.connect((err) => {
  if(err) console.error('Error connecting to the database:', err.stack)
  else console.log('Connected to MySQL as id ' + connection.threadId)
});

// Export the connection variable
module.exports = connection;
