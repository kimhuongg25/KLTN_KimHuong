const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Khách vãng lai cũng có thể chat nên không cần middleware protect
router.post('/', chatbotController.chatWithAI);
router.post('/admin', chatbotController.adminChatWithAI);
module.exports = router;