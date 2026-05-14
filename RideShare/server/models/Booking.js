const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    rideId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ride', 
        required: true 
    },
    passengerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    seatsBooked: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'cancelled'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
