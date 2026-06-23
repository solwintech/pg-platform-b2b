const express = require('express');
const { submitChatbotInquiry } = require('../controllers/support');

const router = express.Router();

router.post('/chatbot', submitChatbotInquiry);

module.exports = router;
