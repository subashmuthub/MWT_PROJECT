const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Incident, User, Equipment } = require('../models'); // ✅ FIXED: Import from models

// Validation middleware
const validateIncident = [
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    body('description').notEmpty().trim().isLength({ max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
    body('category').isIn(['malfunction', 'damage', 'safety', 'maintenance', 'other']).withMessage('Invalid category'),
    body('location').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('equipment_id').optional({ checkFalsy: true }).isInt().withMessage('Invalid equipment ID'),
    body('assigned_to').optional({ checkFalsy: true }).isInt().withMessage('Invalid assigned user ID')
];

// Test route (public)
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Incidents routes are working!',
        timestamp: new Date().toISOString()
    });
});

// Apply authentication to all routes below
router.use(authenticateToken);

// ✅ FIXED: Add simple stats route that frontend might expect
router.get('/stats', async (req, res) => {
    try {
        const stats = await Incident.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching incident stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incident statistics',
            error: error.message
        });
    }
});

// Get incident statistics (alternative endpoint)
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Incident.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching incident stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incident statistics',
            error: error.message
        });
    }
});

// Get all incidents
router.get('/', async (req, res) => {
    try {
        const {
            status,
            priority,
            category,
            assigned_to,
            reported_by,
            equipment_id,
            page = 1,
            limit = 100,
            search
        } = req.query;

        console.log('🔍 Fetching incidents for user:', req.user.email, 'Role:', req.user.role);

        // Build where clause
        let whereClause = {};

        if (status && status !== 'all') whereClause.status = status;
        if (priority && priority !== 'all') whereClause.priority = priority;
        if (category && category !== 'all') whereClause.category = category;
        if (assigned_to) whereClause.assigned_to = assigned_to;
        if (reported_by) whereClause.reported_by = reported_by;
        if (equipment_id) whereClause.equipment_id = equipment_id;

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        // ✅ FIXED: Role-based filtering with correct user ID
        const userId = req.user.userId || req.user.id; // Handle both possible field names
        
        if (req.user.role === 'student' || req.user.role === 'researcher') {
            const roleFilter = {
                [Op.or]: [
                    { reported_by: userId },
                    { assigned_to: userId }
                ]
            };
            
            if (whereClause[Op.or]) {
                whereClause[Op.and] = [
                    { [Op.or]: whereClause[Op.or] },
                    roleFilter
                ];
                delete whereClause[Op.or];
            } else {
                whereClause = { ...whereClause, ...roleFilter };
            }
        }

        const offset = (page - 1) * limit;

        // ✅ FIXED: Include associations for complete data
        let incidents;
        try {
            const { rows, count: total } = await Incident.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'incidentReporter', // ✅ FIXED: Use correct alias from models
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'incidentAssignee', // ✅ FIXED: Use correct alias from models
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'incidentResolver', // ✅ FIXED: Use correct alias from models
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: Equipment,
                        as: 'relatedEquipment', // ✅ FIXED: Use correct alias from models
                        attributes: ['id', 'name', 'category', 'status'],
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [['created_at', 'DESC']]
            });

            incidents = { rows, total };
        } catch (associationError) {
            console.log('⚠️ Association error, fetching without includes:', associationError.message);
            // Fallback without associations
            const { rows, count: total } = await Incident.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: offset,
                order: [['created_at', 'DESC']]
            });
            incidents = { rows, total };
        }

        console.log(`✅ Found ${incidents.total} incidents`);

        res.json({
            success: true,
            data: incidents.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: incidents.total,
                pages: Math.ceil(incidents.total / limit)
            }
        });
    } catch (error) {
        console.error('💥 Error fetching incidents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incidents',
            error: error.message
        });
    }
});

// Get single incident
router.get('/:id', async (req, res) => {
    try {
        let incident;
        
        try {
            incident = await Incident.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'incidentReporter',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'incidentAssignee',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: Equipment,
                        as: 'relatedEquipment',
                        attributes: ['id', 'name', 'category'],
                        required: false
                    }
                ]
            });
        } catch (associationError) {
            console.log('⚠️ Association error, fetching without includes');
            incident = await Incident.findByPk(req.params.id);
        }

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // ✅ FIXED: Check permissions with correct user ID
        const userId = req.user.userId || req.user.id;
        
        if ((req.user.role === 'student' || req.user.role === 'researcher') && 
            incident.reported_by !== userId && 
            incident.assigned_to !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: incident
        });
    } catch (error) {
        console.error('💥 Error fetching incident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incident',
            error: error.message
        });
    }
});

// Create new incident
router.post('/', validateIncident, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        console.log('📝 Creating incident with data:', req.body);
        console.log('👤 User creating incident:', req.user);

        // ✅ FIXED: Use correct user ID field
        const userId = req.user.userId || req.user.id;

        const incidentData = {
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            priority: req.body.priority || 'medium',
            category: req.body.category || 'malfunction',
            location: req.body.location?.trim() || null,
            equipment_id: req.body.equipment_id ? parseInt(req.body.equipment_id) : null,
            reported_by: userId,
            assigned_to: null
        };

        // Only admins and teachers can assign incidents
        if (req.body.assigned_to && ['admin', 'teacher'].includes(req.user.role)) {
            incidentData.assigned_to = parseInt(req.body.assigned_to);
        }

        console.log('💾 Final incident data:', incidentData);

        const incident = await Incident.create(incidentData);

        console.log('✅ Incident created successfully:', incident.id);

        res.status(201).json({
            success: true,
            data: incident,
            message: 'Incident reported successfully'
        });
    } catch (error) {
        console.error('💥 Error creating incident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create incident',
            error: error.message
        });
    }
});

// Update incident
router.put('/:id', validateIncident, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const incident = await Incident.findByPk(req.params.id);
        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // ✅ FIXED: Check permissions with correct user ID
        const userId = req.user.userId || req.user.id;
        const canEdit = req.user.role === 'admin' || 
                       req.user.role === 'teacher' || 
                       incident.reported_by === userId;

        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updateData = {
            title: req.body.title.trim(),
            description: req.body.description.trim(),
            priority: req.body.priority,
            category: req.body.category,
            location: req.body.location?.trim() || null,
            equipment_id: req.body.equipment_id ? parseInt(req.body.equipment_id) : null
        };

        // Only admins and teachers can change assignment
        if (req.body.assigned_to !== undefined && ['admin', 'teacher'].includes(req.user.role)) {
            updateData.assigned_to = req.body.assigned_to ? parseInt(req.body.assigned_to) : null;
        }

        await incident.update(updateData);

        res.json({
            success: true,
            data: incident,
            message: 'Incident updated successfully'
        });
    } catch (error) {
        console.error('💥 Error updating incident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update incident',
            error: error.message
        });
    }
});

// Update incident status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, resolution_notes } = req.body;
        
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const incident = await Incident.findByPk(req.params.id);
        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // ✅ FIXED: Check permissions with correct user ID
        const userId = req.user.userId || req.user.id;
        const canUpdateStatus = req.user.role === 'admin' || 
                               req.user.role === 'teacher' || 
                               incident.assigned_to === userId;

        if (!canUpdateStatus) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updateData = { status };

        // If marking as resolved or closed, add resolution info
        if (status === 'resolved' || status === 'closed') {
            updateData.resolved_at = new Date();
            updateData.resolved_by = userId;
            if (resolution_notes) {
                updateData.resolution_notes = resolution_notes;
            }
        }

        await incident.update(updateData);

        res.json({
            success: true,
            data: incident,
            message: 'Incident status updated successfully'
        });
    } catch (error) {
        console.error('💥 Error updating incident status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update incident status',
            error: error.message
        });
    }
});

// Delete incident
router.delete('/:id', async (req, res) => {
    try {
        const incident = await Incident.findByPk(req.params.id);
        if (!incident) {
            return res.status(404).json({
                success: false,
                message: 'Incident not found'
            });
        }

        // ✅ FIXED: Check permissions with correct user ID
        const userId = req.user.userId || req.user.id;
        const canDelete = req.user.role === 'admin' || 
                         incident.reported_by === userId;

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await incident.destroy();

        res.json({
            success: true,
            message: 'Incident deleted successfully'
        });
    } catch (error) {
        console.error('💥 Error deleting incident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete incident',
            error: error.message
        });
    }
});

module.exports = router;