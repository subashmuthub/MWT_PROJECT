const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Lab = require('../models/Lab');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'serial_number', 'category'],
                    required: false // LEFT JOIN
                },
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false // LEFT JOIN
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['booking_date', 'ASC'], ['start_time', 'ASC']] // Fixed: use booking_date
        });

        res.json({
            success: true,
            data: { bookings }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// CREATE new booking
router.post('/', async (req, res) => {
    try {
        const {
            booking_type = 'equipment', // Default to equipment for backward compatibility
            lab_id,
            equipment_id,
            date, // Frontend sends 'date'
            start_time,
            end_time,
            purpose
        } = req.body;

        console.log('Received booking data:', {
            booking_type,
            lab_id,
            equipment_id,
            date,
            start_time,
            end_time,
            purpose
        });

        // Validation
        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Date, start time, and end time are required'
            });
        }

        if (booking_type === 'lab' && !lab_id) {
            return res.status(400).json({
                success: false,
                message: 'Lab ID is required for lab bookings'
            });
        }

        if (booking_type === 'equipment' && !equipment_id) {
            return res.status(400).json({
                success: false,
                message: 'Equipment ID is required for equipment bookings'
            });
        }

        // Check for time conflicts
        const conflictWhere = {
            booking_date: date, // Map frontend 'date' to 'booking_date'
            status: {
                [Op.in]: ['pending', 'confirmed']
            },
            [Op.or]: [
                {
                    start_time: {
                        [Op.between]: [start_time, end_time]
                    }
                },
                {
                    end_time: {
                        [Op.between]: [start_time, end_time]
                    }
                },
                {
                    [Op.and]: [
                        { start_time: { [Op.lte]: start_time } },
                        { end_time: { [Op.gte]: end_time } }
                    ]
                }
            ]
        };

        // Add specific conflict check based on booking type
        if (booking_type === 'lab') {
            conflictWhere.lab_id = lab_id;
        } else {
            conflictWhere.equipment_id = equipment_id;
        }

        const conflictingBooking = await Booking.findOne({
            where: conflictWhere
        });

        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: `Time slot is already booked for this ${booking_type}`
            });
        }

        // Create booking with correct field mapping
        const bookingData = {
            user_id: req.user.id,
            booking_type,
            lab_id: booking_type === 'lab' ? lab_id : (booking_type === 'equipment' && lab_id ? lab_id : null),
            equipment_id: booking_type === 'equipment' ? equipment_id : null,
            booking_date: date, // Map 'date' to 'booking_date'
            start_time,
            end_time,
            purpose,
            status: 'pending'
        };

        console.log('Creating booking with data:', bookingData);

        const newBooking = await Booking.create(bookingData);

        // Fetch the created booking with associations
        const bookingWithDetails = await Booking.findByPk(newBooking.id, {
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'serial_number', 'category'],
                    required: false
                },
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        console.log(`Booking created for user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { booking: bookingWithDetails }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// DELETE booking (cancel)
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns the booking or is admin
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Delete the booking instead of updating status
        await booking.destroy();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
});

// GET booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'serial_number', 'category'],
                    required: false
                },
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: { booking }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
});

module.exports = router;