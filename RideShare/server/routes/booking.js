const express = require('express');
const { createBooking, getBookings, getDriverBookings, approveBooking, rejectBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/driver').get(protect, getDriverBookings);
router.route('/:id/approve').put(protect, approveBooking);
router.route('/:id/reject').put(protect, rejectBooking);
router.route('/:id/cancel').put(protect, cancelBooking);

router.route('/')
    .get(protect, getBookings)
    .post(protect, createBooking);

module.exports = router;
