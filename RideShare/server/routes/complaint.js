const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Complaint = require('../models/Complaint');

const router = express.Router();

router.use(protect);

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const complaint = await Complaint.create({
            userId: req.user._id,
            message
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
