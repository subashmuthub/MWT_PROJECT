const express = require('express');
const router = express.Router();
const { Lab, User, Equipment, Booking } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');

// GET lab statistics
router.get('/stats', async (req, res) => {
    try {
        const totalLabs = await Lab.count({ where: { is_active: true } });
        const computerLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'computer_lab' } 
        });
        const chemistryLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'chemistry_lab' } 
        });
        const biologyLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'biology_lab' } 
        });

        res.json({
            success: true,
            data: {
                total: totalLabs,
                computerLabs,
                chemistryLabs,
                biologyLabs
            }
        });
    } catch (error) {
        console.error('Error fetching lab stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab statistics',
            error: error.message
        });
    }
});

// GET all labs
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
                    as: 'labCreator', // ✅ FIXED: Updated alias
                    attributes: ['id', 'name', 'email'],
                    required: false
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

// POST create new lab
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            lab_type,
            location,
            capacity,
            description
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
            created_by: req.user.userId
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