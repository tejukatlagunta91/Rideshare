const express = require('express');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');

const router = express.Router();

// Apply protect and authorizeAdmin middleware to all routes in this file
router.use(protect);
router.use(authorizeAdmin);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
        }

        await User.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ success: true, message: 'User removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all rides
// @route   GET /api/admin/rides
// @access  Private/Admin
router.get('/rides', async (req, res) => {
    try {
        const rides = await Ride.find({}).populate('driverId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: rides });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete ride
// @route   DELETE /api/admin/rides/:id
// @access  Private/Admin
router.delete('/rides/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        
        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }
        
        await Ride.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ success: true, message: 'Ride removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('passengerId', 'name email')
            .populate({
                path: 'rideId',
                select: 'departure destination date time driverId',
                populate: { path: 'driverId', select: 'name email' }
            })
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('reviewerId', 'name email')
            .populate('reviewedUserId', 'name email')
            .populate('rideId', 'departure destination date')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
router.delete('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        
        await Review.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ success: true, message: 'Review removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private/Admin
router.get('/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .populate('userId', 'name email')
            .sort({ status: -1, createdAt: -1 });
            
        res.status(200).json({ success: true, data: complaints });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Resolve a complaint
// @route   PUT /api/admin/complaints/:id
// @access  Private/Admin
router.put('/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        complaint.status = 'resolved';
        await complaint.save();
        
        res.status(200).json({ success: true, message: 'Complaint marked as resolved', data: complaint });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get system reports/stats
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRides = await Ride.countDocuments();
        const totalBookings = await Booking.countDocuments();
        
        // Calculate total revenue (approved bookings only)
        const bookings = await Booking.find({ status: 'approved' }).populate('rideId', 'price');
        let totalRevenue = 0;
        
        bookings.forEach(booking => {
            if (booking.rideId && booking.rideId.price) {
                totalRevenue += (booking.rideId.price * booking.seatsBooked);
            }
        });
        
        res.status(200).json({ 
            success: true, 
            data: {
                totalUsers,
                totalRides,
                totalBookings,
                totalRevenue
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
