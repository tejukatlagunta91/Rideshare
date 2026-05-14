const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: [true, 'Please provide a complaint message'] 
    },
    status: { 
        type: String, 
        enum: ['open', 'resolved'], 
        default: 'open' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
