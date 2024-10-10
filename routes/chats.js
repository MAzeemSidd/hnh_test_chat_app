const express = require('express');

//Require database connection
const db = require('../functions/dbConnection')

//Require Functions
const getFunction = require('../functions/getFunction');
const addFunction = require('../functions/addFunction');

//Require Custom Middleware
const authenticateUser = require('../middlewares/authenticateUser')


const router = express.Router();

//Get chat messages according to chatId
router.get('/', authenticateUser, async (req, res) => {
    //Check for chatId in params
    if(!req.query.chatId) return res.send('Missing "chatId" in query params');

    try {
        //Restrict user to only access the chats which is associated to the request user.
        const userId = req.user?.id
        const queryForUserChatList = `SELECT DISTINCT chatId FROM chats WHERE \`from\`=${userId} OR \`to\`=${userId};`
        const chatList = await getFunction(queryForUserChatList)
        
        //Check chat is available in the users chat
        const isAvailable = chatList.find(chat => chat.chatId === req.query.chatId);
        if(!isAvailable) return res.status(404).json({ message: 'There are no messages' }) //No Chat Found

        //If Chat available in user chats then send that chat to the user in response.
        const queryForParticularChat = `SELECT * FROM chats WHERE chatId='${req.query.chatId}';`
        const chat = await getFunction(queryForParticularChat)
        return res.json(chat)
    } catch (error) {
        res.send(error)
    }
})

//Save message in a chat a/c to id -- Only for Testing
router.post('/', authenticateUser, async (req, res) => {
    const {from, to, message, chatId} = req.body

    if(from !== req.user?.id || to !== req.user?.id) return res.status(401).send('Unauthorized User')

    const query = 'INSERT INTO chats (`from`, `to`, `message`, `chatId`) VALUES (?)'
    const values = [from, to, message, chatId]
    
    try {
        await addFunction(query, values)
        res.sendStatus(200)
    } catch (error) {
        res.send(error)
    }
});

module.exports = router;