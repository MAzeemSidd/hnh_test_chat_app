const express = require('express');
const bcrypt = require('bcrypt');

const db = require('../functions/dbConnection')

const router = express.Router();

//Get list of Users
router.get('/', async (req, res) => {
    const query = 'SELECT * FROM users'

    db.query(query, (err, data) => {
        if(err) return res.send(err);
        return res.json(data);
    })
})

router.post('/login', (req, res) => {
    const query = 'SELECT `id`, `firstname`, `lastname`, `email`, `password` FROM users WHERE `email` = ?';
    const email = req.body.email;
  
    db.query(query, [email], async (err, data) => {
        if (err) return res.send(err);
    
        if (data.length === 0) {
            return res.status(404).send('User not found');
        }
  
        // Check if the password matches
        const { password, ...restData } = data[0];
        const match = await bcrypt.compare(req.body.password, password);
    
        if (match) {
            return res.send(restData); // Password matches
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

            const searchQuery = 'SELECT `id`, `firstname`, `lastname`, `email` FROM users WHERE `email` = ?';
            db.query(searchQuery, [req.body.email], (error, data) => {
                if(error) return res.send(error);
                return res.json(data[0]);
            })
        })
    } catch (error) {
        return res.status(500).send('Error while signing up');
    }
})

module.exports = router;