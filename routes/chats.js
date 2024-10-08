const express = require('express');
const jwt = require('jsonwebtoken');

//Require database connection
const db = require('../functions/dbConnection')

//Require Functions
const getFunction = require('../functions/getFunction');
const addFunction = require('../functions/addFunction');

// Middleware to verify JWT
const authenticateJwtToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    
     // Unauthorized - If no token available
    if (!token) return res.status(401).send('User is not authorized');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        // Forbidden - If jwt verification give error
        if (err) return res.status(403).send(`${err.message}`)
        
        req.user = user; // Attach user data to request object
        next(); // Proceed to the next middleware or route handler
    });
};


const router = express.Router();

//Get chat according to chatId
router.get('/', authenticateJwtToken, async (req, res) => {
    //Check for chatId in params
    if(!req.query.chatId) return res.send('Missing "chatId" in query params');

    try {
        //Restrict user to only access the chats which is associated to the request user.
        const userId = req.user?.id
        const queryForUserChatList = `SELECT DISTINCT chatId FROM chats WHERE \`from\`=${userId} OR \`to\`=${userId};`
        const chatList = await getFunction(queryForUserChatList)
        
        //Check chat is available in the users chat
        const isAvailable = chatList.find(chat => chat.chatId === req.query.chatId);
        if(!isAvailable) return res.status(403).send('Access Denied!') //Forbidden

        //If Chat available in user chats then send that chat to the user in response.
        const queryForParticularChat = `SELECT * FROM chats WHERE chatId='${req.query.chatId}';`
        const chat = await getFunction(queryForParticularChat)
        return res.json(chat)
    } catch (error) {
        res.send(error)
    }
})

router.get('/list', async (req, res) => {
    const query = 'SELECT DISTINCT chatId FROM chats;'

    try {
        const data = await getFunction(query)
        res.json(data)
    } catch (error) {
        res.send(error)
    }
})

router.post('/', async (req, res) => {
    const query = 'INSERT INTO chats (`from`, `to`, `message`, `chatId`) VALUES (?)'
    const {from, to, message, chatId} = req.body
    const values = [from, to, message, chatId]
    
    try {
        await addFunction(query, values)
        res.sendStatus(200)
    } catch (error) {
        res.send(error)
    }
});

module.exports = router;