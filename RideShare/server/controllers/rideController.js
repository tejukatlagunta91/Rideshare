const Ride = require('../models/Ride');

exports.createRide = async (req, res, next) => {
    try {
        const { departure, destination, date, time, price, availableSeats } = req.body;

        const todayDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        if (date < todayDate) {
            return res.status(400).json({ success: false, message: 'Cannot post ride in the past' });
        }
        if (date === todayDate && time < currentTime) {
            return res.status(400).json({ success: false, message: 'Cannot post ride in the past' });
        }

        const ride = await Ride.create({
            driverId: req.user._id, // Set correctly using JWT protected auth middleware
            departure,
            destination,
            date,
            time,
            price,
            availableSeats
        });

        res.status(201).json({
            success: true,
            data: ride
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRides = async (req, res, next) => {
    try {
        const { departure, destination, date, minPrice, maxPrice, seats, sort } = req.query;
        
        const todayDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        // Automatically complete past rides
        await Ride.updateMany(
            {
                status: 'upcoming',
                $or: [
                    { date: { $lt: todayDate } },
                    { date: todayDate, time: { $lt: currentTime } }
                ]
            },
            { $set: { status: 'completed' } }
        );

        // Base filters to only show valid future rides
        let query = {
            status: { $ne: 'cancelled' },
            availableSeats: { $gt: 0 },
            date: { $gte: todayDate }
        };
        
        const today = todayDate; // keeping today variable for later reference
        // Flexible regex match for locations (case-insensitive)
        if (departure) query.departure = { $regex: departure, $options: 'i' };
        if (destination) query.destination = { $regex: destination, $options: 'i' };
        // Exact match for the date, but only if it's not in the past
        if (date) {
            if (date < today) {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
            query.date = date;
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (seats) query.availableSeats = { $gte: Number(seats) };

        // Handle sorting
        let sortParam = '-createdAt';
        if (sort === 'priceAsc') sortParam = 'price';
        if (sort === 'priceDesc') sortParam = '-price';
        if (sort === 'dateAsc') sortParam = 'date';
        if (sort === 'dateDesc') sortParam = '-date';

        const rides = await Ride.find(query).populate('driverId', 'name email averageRating reviewCount').sort(sortParam);

        res.status(200).json({
            success: true,
            count: rides.length,
            data: rides
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchRides = async (req, res, next) => {
    try {
        const { departure, destination, date, minPrice, maxPrice, seats, sort } = req.query;
        
        const todayDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        // Automatically complete past rides
        await Ride.updateMany(
            {
                status: 'upcoming',
                $or: [
                    { date: { $lt: todayDate } },
                    { date: todayDate, time: { $lt: currentTime } }
                ]
            },
            { $set: { status: 'completed' } }
        );

        // Base filters to only show valid future rides
        let query = {
            status: { $ne: 'cancelled' },
            availableSeats: { $gt: 0 },
            date: { $gte: todayDate }
        };
        
        const today = todayDate; // keeping today variable for later reference
        if (departure) query.departure = { $regex: departure, $options: 'i' };
        if (destination) query.destination = { $regex: destination, $options: 'i' };
        if (date) {
            if (date < today) {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
            query.date = date;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (seats) query.availableSeats = { $gte: Number(seats) };

        // Handle sorting
        let sortParam = '-createdAt';
        if (sort === 'priceAsc') sortParam = 'price';
        if (sort === 'priceDesc') sortParam = '-price';
        if (sort === 'dateAsc') sortParam = 'date';
        if (sort === 'dateDesc') sortParam = '-date';

        const rides = await Ride.find(query).populate('driverId', 'name email averageRating reviewCount').sort(sortParam);

        res.status(200).json({
            success: true,
            count: rides.length,
            data: rides
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.startRide = async (req, res, next) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }
        if (ride.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the driver can start this ride' });
        }
        if (ride.status !== 'upcoming') {
            return res.status(400).json({ success: false, message: `Cannot start ride with status: ${ride.status}` });
        }

        ride.status = 'started';
        await ride.save();

        res.status(200).json({ success: true, data: ride });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.endRide = async (req, res, next) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found' });
        }
        if (ride.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the driver can end this ride' });
        }
        if (ride.status !== 'started') {
            return res.status(400).json({ success: false, message: `Cannot end ride with status: ${ride.status}` });
        }

        ride.status = 'completed';
        await ride.save();

        res.status(200).json({ success: true, data: ride });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
