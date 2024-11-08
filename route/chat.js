const express = require('express');
const chat = require('../controller/chat.js')

const router = express.Router();

router.get('/chat',chat.getChatPage);

router.post('/postmessage',chat.redirectToChatPage);

router.get('/postmessage',chat.redirectToChatPage);



module.exports = router;