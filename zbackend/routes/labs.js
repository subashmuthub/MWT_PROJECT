// routes/labs.js - Add ALL these imports at the top
const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const User = require('../models/User');        // ← Add this
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query;

        const whereClause = { is_active: true };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const labs = await Lab.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            data: {
                labs: labs.rows,
                pagination: {
                    total: labs.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(labs.count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching labs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Add this route in routes/labs.js
router.get('/stats/dashboard', async (req, res) => {
    try {
        const totalLabs = await Lab.count({ where: { is_active: true } });
        const totalEquipment = await Equipment.count();
        const totalBookings = await Booking.count();

        res.json({
            success: true,
            data: {
                totalLabs,
                totalEquipment,
                totalBookings,
                // Add more stats as needed
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});
// POST create new lab
router.post('/', async (req, res) => {
    try {
        const {
            name,
            lab_type,
            location,
            capacity,
            description,
            created_by
        } = req.body;

        if (!name || !lab_type) {
            return res.status(400).json({
                success: false,
                message: 'Name and lab type are required'
            });
        }

        const lab = await Lab.create({
            name,
            lab_type,
            location,
            capacity: capacity ? parseInt(capacity) : null,
            description,
            created_by
        });

        res.status(201).json({
            success: true,
            data: lab,
            message: 'Lab created successfully'
        });
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;