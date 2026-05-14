const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    departure: {
        type: String,
        required: [true, 'Please provide a departure location']
    },
    destination: {
        type: String,
        required: [true, 'Please provide a destination']
    },
    date: {
        type: String,
        required: [true, 'Please provide a travel date']
    },
    time: {
        type: String,
        required: [true, 'Please provide a travel time']
    },
    price: {
        type: Number,
        required: [true, 'Please provide the seat price']
    },
    availableSeats: {
        type: Number,
        required: [true, 'Please provide the number of available seats'],
        min: 1
    },
    status: {
        type: String,
        enum: ['upcoming', 'started', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
