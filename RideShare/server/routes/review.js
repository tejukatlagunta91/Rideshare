const express = require('express');
const { addReview, getUserReviews, getAuthoredReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, addReview);
router.route('/authored').get(protect, getAuthoredReviews);
router.route('/:userId').get(getUserReviews);

module.exports = router;
