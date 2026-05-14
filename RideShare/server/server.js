require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

// ==========================================
// Middleware Setup
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Routes
// ==========================================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const rideRoutes = require('./routes/ride');
const bookingRoutes = require('./routes/booking');
const messageRoutes = require('./routes/message');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const complaintRoutes = require('./routes/complaint');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the RideShare API' });
});

// ==========================================
// Socket.io Implementation
// ==========================================
const Message = require('./models/Message');

io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, message } = data;
        
        // Save to DB
        const savedMessage = await Message.create({ senderId, receiverId, message });
        
        // Emit to receiver and sender rooms
        io.to(receiverId).emit('receive_message', savedMessage);
        io.to(senderId).emit('receive_message', savedMessage);
    });
});

// ==========================================
// Error Handling Middleware
// ==========================================
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
