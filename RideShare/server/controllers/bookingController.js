const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// @desc    Book a ride
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { rideId, seatsBooked } = req.body;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }

        if (ride.driverId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot book your own ride.' });
        }

        if (ride.status === 'started' || ride.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot book a ride that has already started or completed' });
        }

        if (ride.availableSeats < seatsBooked) {
            return res.status(400).json({ success: false, message: 'Not enough available seats left on this ride.' });
        }

        // Create booking linked to the user
        const booking = await Booking.create({
            rideId,
            passengerId: req.user._id,
            seatsBooked
        });

        // Decrease seats only upon driver approval
        // Check new approveBooking PUT mechanic

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ passengerId: req.user._id })
            .populate('rideId')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get bookings for rides posted by driver
// @route   GET /api/bookings/driver
// @access  Private
exports.getDriverBookings = async (req, res, next) => {
    try {
        const rides = await Ride.find({ driverId: req.user._id });
        const rideIds = rides.map(r => r._id);

        const bookings = await Booking.find({ rideId: { $in: rideIds } })
            .populate('rideId')
            .populate('passengerId', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve a booking
// @route   PUT /api/bookings/:id/approve
// @access  Private
exports.approveBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const ride = await Ride.findById(booking.rideId);
        if (ride.status === 'started' || ride.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot approve booking after ride has started or completed' });
        }
        if (ride.availableSeats < booking.seatsBooked) {
            return res.status(400).json({ success: false, message: 'Not enough available seats left on this ride.' });
        }

        booking.status = 'approved';
        await booking.save();

        ride.availableSeats -= booking.seatsBooked;
        await ride.save();

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject a booking
// @route   PUT /api/bookings/:id/reject
// @access  Private
exports.rejectBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        const ride = await Ride.findById(booking.rideId);
        if (ride && (ride.status === 'started' || ride.status === 'completed')) {
            return res.status(400).json({ success: false, message: 'Cannot reject booking after ride has started or completed' });
        }

        booking.status = 'rejected';
        await booking.save();

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.passengerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel' });
        }

        if (booking.status === 'cancelled') {
             return res.status(400).json({ success: false, message: 'Already cancelled' });
        }

        const ride = await Ride.findById(booking.rideId);
        if (ride && (ride.status === 'started' || ride.status === 'completed')) {
             return res.status(400).json({ success: false, message: 'Cannot cancel booking after ride has started or completed' });
        }

        if (booking.status === 'approved') {
            if (ride) {
                ride.availableSeats += booking.seatsBooked;
                await ride.save();
            }
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
