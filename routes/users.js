const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'test_chat_app_db',
})

const router = express.Router();

// router.post('/login', (req, res) => {
//     const query = 'SELECT * FROM users WHERE `email` = ? AND `password` = ?';
//     const values = [req.body.email, req.body.password]

//     db.query(query, values, (err,data) => {
//         if(err) return res.send(err);
//         console.log(data)
//         if(data.length !== 0) return res.sendStatus(200);
//         return res.sendStatus(404);
//     })
// })

router.post('/login', (req, res) => {
    const query = 'SELECT * FROM users WHERE `email` = ?';
    const email = req.body.email;
  
    db.query(query, [email], async (err, data) => {
        if (err) return res.send(err);
    
        if (data.length === 0) {
            return res.status(404).send('User not found');
        }
  
        // Check if the password matches
        const user = data[0];
        const match = await bcrypt.compare(req.body.password, user.password);
    
        if (match) {
            return res.sendStatus(200); // Password matches
        } else {
            return res.status(401).send('Invalid credentials'); // Password doesn't match
        }
    });
});
  

router.post('/signup', async (req, res) => {
    try {
        // Hash the password with a salt
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is a salt value
        const query = 'INSERT INTO users (`firstname`, `lastname`, `email`, `password`) VALUES (?)';
        const values = [req.body.firstname, req.body.lastname, req.body.email, hashedPassword]
    
        db.query(query, [values], (err) => {
            if(err) return res.send(err);
            return res.sendStatus(200);
        })
    } catch (error) {
        return res.status(500).send('Error while signing up');
    }
})

module.exports = router;