const express = require('express');

//Require database connection
const db = require('../functions/dbConnection')

//Require Functions
const getFunction = require('../functions/getFunction');
const addFunction = require('../functions/addFunction');


const router = express.Router();

//Get chat according to chatId
router.get('/', async (req, res) => {
    if(!req.query.chatId) return res.send('Missing "chatId" in query params');

    const query = `SELECT * FROM chats WHERE chatId='${req.query.chatId}';`

    try {
        const data = await getFunction(query)
        res.json(data)
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