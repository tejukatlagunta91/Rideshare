const express = require('express');
const { createRide, getRides, searchRides, cancelRide, startRide, endRide } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchRides);

router.route('/')
    .get(getRides)
    .post(protect, createRide);

router.put('/:id/start', protect, startRide);
router.put('/:id/end', protect, endRide);

module.exports = router;
