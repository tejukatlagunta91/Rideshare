const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { rideId, reviewedUserId, rating, comment } = req.body;
        
        const reviewExists = await Review.findOne({ rideId, reviewerId: req.user._id });
        if (reviewExists) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this ride' });
        }

        const review = await Review.create({
            rideId, reviewerId: req.user._id, reviewedUserId, rating, comment
        });

        // Compute and update driver's average rating securely
        const reviews = await Review.find({ reviewedUserId });
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        const avg = totalRating / reviews.length;

        await User.findByIdAndUpdate(reviewedUserId, {
            averageRating: avg.toFixed(1),
            reviewCount: reviews.length
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user reviews
// @route   GET /api/reviews/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ reviewedUserId: req.params.userId }).populate('reviewerId', 'name');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get reviews authored by logged in user
// @route   GET /api/reviews/authored
// @access  Private
exports.getAuthoredReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ reviewerId: req.user._id });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
