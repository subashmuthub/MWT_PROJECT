const express = require('express');
const router = express.Router();
const { Maintenance, Equipment, User } = require('../models');
const { Op } = require('sequelize');

// GET all maintenance records with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            status,
            maintenance_type,
            equipment_name,
            priority,
            start_date,
            end_date,
            technician_id,
            page = 1,
            limit = 50
        } = req.query;

        // Build where clause
        const whereClause = {};

        if (status) whereClause.status = status;
        if (maintenance_type) whereClause.maintenance_type = maintenance_type;
        if (priority) whereClause.priority = priority;
        if (technician_id) whereClause.technician_id = technician_id;
        if (equipment_name) {
            whereClause.equipment_name = { [Op.like]: `%${equipment_name}%` };
        }
        if (start_date && end_date) {
            whereClause.scheduled_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const maintenance = await Maintenance.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'technician',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'model', 'status']
                }
            ],
            order: [['scheduled_date', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            data: maintenance.rows,
            pagination: {
                total: maintenance.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(maintenance.count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET maintenance by ID
router.get('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'technician',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'model', 'status', 'serial_number']
                }
            ]
        });

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        res.json({ success: true, data: maintenance });
    } catch (error) {
        console.error('Error fetching maintenance by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// POST new maintenance record
router.post('/', async (req, res) => {
    try {
        const {
            equipment,
            type,
            date,
            technician,
            description,
            estimatedCost,
            priority = 'medium',
            estimated_duration,
            equipment_id,
            technician_id,
            created_by
        } = req.body;

        // Validation
        if (!equipment && !equipment_id) {
            return res.status(400).json({
                success: false,
                message: 'Equipment name or equipment ID is required'
            });
        }

        if (!type || !date) {
            return res.status(400).json({
                success: false,
                message: 'Maintenance type and scheduled date are required'
            });
        }

        const maintenanceData = {
            equipment_name: equipment || 'Unknown Equipment',
            maintenance_type: type.toLowerCase(),
            scheduled_date: date,
            technician_name: technician || 'Unassigned',
            description: description || '',
            estimated_cost: parseFloat(estimatedCost) || 0,
            priority: priority.toLowerCase(),
            estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
            status: 'scheduled'
        };

        // Add optional foreign keys
        if (equipment_id) maintenanceData.equipment_id = equipment_id;
        if (technician_id) maintenanceData.technician_id = technician_id;
        if (created_by) maintenanceData.created_by = created_by;

        const newMaintenance = await Maintenance.create(maintenanceData);

        // Fetch the created record with associations
        const maintenanceWithAssociations = await Maintenance.findByPk(newMaintenance.id, {
            include: [
                {
                    model: User,
                    as: 'technician',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'model']
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: maintenanceWithAssociations,
            message: 'Maintenance record created successfully'
        });
    } catch (error) {
        console.error('Error creating maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// PUT update maintenance record
router.put('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        // Handle status changes
        if (req.body.status) {
            if (req.body.status === 'completed' && maintenance.status !== 'completed') {
                req.body.completed_at = new Date();
                req.body.actual_date = new Date();
            }
            if (req.body.status === 'in_progress' && maintenance.status === 'scheduled') {
                req.body.started_at = new Date();
            }
        }

        await maintenance.update(req.body);

        // Fetch updated record with associations
        const updatedMaintenance = await Maintenance.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'technician',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'model']
                }
            ]
        });

        res.json({
            success: true,
            data: updatedMaintenance,
            message: 'Maintenance record updated successfully'
        });
    } catch (error) {
        console.error('Error updating maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE maintenance record
router.delete('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        await maintenance.destroy();

        res.json({
            success: true,
            message: 'Maintenance record deleted successfully',
            data: { id: req.params.id }
        });
    } catch (error) {
        console.error('Error deleting maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET maintenance statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Maintenance.getStats();

        // Get simple counts
        const [scheduled, in_progress, completed, cancelled, overdue] = await Promise.all([
            Maintenance.count({ where: { status: 'scheduled' } }),
            Maintenance.count({ where: { status: 'in_progress' } }),
            Maintenance.count({ where: { status: 'completed' } }),
            Maintenance.count({ where: { status: 'cancelled' } }),
            Maintenance.count({ where: { status: 'overdue' } })
        ]);

        res.json({
            success: true,
            data: {
                scheduled,
                inProgress: in_progress,
                completed,
                cancelled,
                overdue,
                total: scheduled + in_progress + completed + cancelled + overdue,
                ...stats
            }
        });
    } catch (error) {
        console.error('Error fetching maintenance stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET upcoming maintenance
router.get('/upcoming/week', async (req, res) => {
    try {
        const days = req.query.days || 7;
        const upcomingMaintenance = await Maintenance.getUpcoming(parseInt(days));

        res.json({ success: true, data: upcomingMaintenance });
    } catch (error) {
        console.error('Error fetching upcoming maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET overdue maintenance
router.get('/overdue/list', async (req, res) => {
    try {
        const overdueMaintenance = await Maintenance.getOverdue();

        res.json({ success: true, data: overdueMaintenance });
    } catch (error) {
        console.error('Error fetching overdue maintenance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;