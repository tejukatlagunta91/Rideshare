const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get current logged-in user
// @route   GET /api/users/me
// @access  Private (Protected by auth middleware)
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
});

module.exports = router;
