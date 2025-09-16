const express = require('express');
const router = express.Router();
const { Equipment, Lab, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET all equipment
router.get('/', async (req, res) => {
    try {
        const {
            lab_id,
            status,
            category,
            search,
            page = 1,
            limit = 50
        } = req.query;

        const whereClause = { is_active: true };

        if (lab_id) whereClause.lab_id = lab_id;
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } },
                { serial_number: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { manufacturer: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const equipment = await Equipment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
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
                equipment: equipment.rows,
                pagination: {
                    total: equipment.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(equipment.count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch equipment',
            error: error.message
        });
    }
});

// POST create new equipment
router.post('/', async (req, res) => {
    try {
        console.log('📝 Creating equipment with data:', req.body);
        console.log('👤 User:', req.user);

        const {
            name,
            description,
            serial_number,
            model,
            manufacturer,
            category,
            lab_id,
            location_details,
            status = 'available',
            condition_status = 'good',
            purchase_price,
            current_value,
            purchase_date,
            warranty_expiry
        } = req.body;

        // Required field validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Equipment name is required'
            });
        }

        if (!serial_number) {
            return res.status(400).json({
                success: false,
                message: 'Serial number is required'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        if (!lab_id) {
            return res.status(400).json({
                success: false,
                message: 'Lab assignment is required'
            });
        }

        // Check if lab exists
        const lab = await Lab.findByPk(lab_id);
        if (!lab || !lab.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lab ID or lab is not active'
            });
        }

        // Check for duplicate serial number
        const existingEquipment = await Equipment.findOne({
            where: { serial_number, is_active: true }
        });
        if (existingEquipment) {
            return res.status(400).json({
                success: false,
                message: 'Equipment with this serial number already exists'
            });
        }

        // Prepare equipment data
        const equipmentData = {
            name: name.trim(),
            description: description ? description.trim() : null,
            serial_number: serial_number.trim(),
            model: model ? model.trim() : null,
            manufacturer: manufacturer ? manufacturer.trim() : null,
            category,
            lab_id: parseInt(lab_id),
            location_details: location_details ? location_details.trim() : null,
            status,
            condition_status,
            purchase_price: purchase_price ? parseFloat(purchase_price) : 0.00,
            current_value: current_value ? parseFloat(current_value) : 0.00,
            purchase_date: purchase_date || new Date().toISOString().split('T')[0],
            warranty_expiry: warranty_expiry || null,
            is_active: true,
            created_by: req.user.id
        };

        console.log('💾 Equipment data to save:', equipmentData);

        const equipment = await Equipment.create(equipmentData);
        console.log('✅ Equipment created successfully:', equipment.id);

        // Fetch with associations
        const equipmentWithAssociations = await Equipment.findByPk(equipment.id, {
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: { equipment: equipmentWithAssociations },
            message: 'Equipment created successfully'
        });

    } catch (error) {
        console.error('💥 Error creating equipment:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Serial number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create equipment',
            error: error.message
        });
    }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);

        if (!equipment || !equipment.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && equipment.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to edit this equipment'
            });
        }

        const updateData = { ...req.body };

        if (updateData.purchase_price !== undefined) {
            updateData.purchase_price = updateData.purchase_price ? parseFloat(updateData.purchase_price) : 0.00;
        }

        if (updateData.current_value !== undefined) {
            updateData.current_value = updateData.current_value ? parseFloat(updateData.current_value) : 0.00;
        }

        await equipment.update(updateData);

        const updatedEquipment = await Equipment.findByPk(req.params.id, {
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                }
            ]
        });

        res.json({
            success: true,
            data: { equipment: updatedEquipment },
            message: 'Equipment updated successfully'
        });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update equipment',
            error: error.message
        });
    }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);

        if (!equipment || !equipment.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found'
            });
        }

        if (req.user.role !== 'admin' && equipment.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this equipment'
            });
        }

        await equipment.update({ is_active: false });

        res.json({
            success: true,
            message: 'Equipment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete equipment',
            error: error.message
        });
    }
});

module.exports = router;