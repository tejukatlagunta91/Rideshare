const Message = require('../models/Message');

exports.getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort('createdAt');

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { senderId: userId, receiverId: myId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUnreadCounts = async (req, res, next) => {
    try {
        const myId = req.user._id;
        
        const unreadMessages = await Message.aggregate([
            { $match: { receiverId: myId, isRead: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const counts = {};
        unreadMessages.forEach(msg => {
            counts[msg._id.toString()] = msg.count;
        });

        res.status(200).json({ success: true, data: counts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
