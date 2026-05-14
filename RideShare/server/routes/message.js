const express = require('express');
const { getMessages, getUnreadCounts, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/unread', protect, getUnreadCounts);
router.get('/:userId', protect, getMessages);
router.put('/read/:userId', protect, markAsRead);

module.exports = router;
