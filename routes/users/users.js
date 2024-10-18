const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

//Require database connection
const db = require('../../functions/dbConnection')

//Require Custom Middleware
const authenticateUser = require('../../middlewares/authenticateUser')

//For Form Validation
const { loginValidationRules, signupValidationRules, formValidation } = require('./formValidation');


const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//Get list of Users
router.get('/', authenticateUser, async (req, res) => {
    const query = 'SELECT `id`, `firstname`, `lastname`, `email` FROM users'

    db.query(query, (err, data) => {
        if(err) return res.send(err);
        return res.json(data);
    })
})

//Login
router.post('/login', loginValidationRules, formValidation, (req, res) => {
    const query = 'SELECT `id`, `firstname`, `lastname`, `email`, `password` FROM users WHERE `email` = ?';
    const email = req.body.email;
  
    db.query(query, [email], async (err, data) => {
        if (err) return res.send(err);
    
        if (data.length === 0) {
            return res.status(404).send('User not found');
        }
  
        // Check if the password matches
        const { password, ...restOfTheData } = data[0];
        const match = await bcrypt.compare(req.body.password, password);
    
        if (match) { // Password matches
            try {
                const token = jwt.sign({ id: restOfTheData.id, name: `${restOfTheData.firstname} ${restOfTheData.lastname}` }, JWT_SECRET_KEY, { expiresIn: '1h' });
                return res.send({...restOfTheData, token});
            }
            catch { //If error occur during token creation
                return res.status(500).send('Error occured during "Token" creation');
            }
        }
        else { // Password doesn't match
            return res.status(401).send('Invalid credentials');
        }
    });
});
  
//Signup
router.post('/signup', signupValidationRules, formValidation, async (req, res) => {
    try {
        // Hash the password with a salt
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Second argument is a salt value
        const query = 'INSERT INTO users (`firstname`, `lastname`, `email`, `password`) VALUES (?)';
        const values = [req.body.firstname, req.body.lastname, req.body.email, hashedPassword]
    
        db.query(query, [values], (err, data) => {
            if(err) return res.send(err);

            const searchQuery = 'SELECT `id`, `firstname`, `lastname`, `email` FROM users WHERE `id` = ?';
            db.query(searchQuery, [data.insertId], (error, data) => {
                if(error) return res.send(error);

                try {
                    //Generating Token
                    const token = jwt.sign({ id: data[0].id, name: `${data[0].firstname} ${data[0].lastname}` }, JWT_SECRET_KEY, { expiresIn: '1h' });
                    return res.json({...data[0], token});
                }
                catch { //If error occur during creation
                    return res.status(500).send('Error occured during "Token" creation');
                }
            })
        })
    } catch (error) {
        return res.status(500).send('Error while signing up');
    }
})

module.exports = router;