const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET recent activities
router.get('/recent', authenticateToken, async (req, res) => {
    try {
        console.log('📋 Fetching recent activities');
        
        const limit = parseInt(req.query.limit) || 10;
        const { User, Booking, Equipment, Lab, Incident, Maintenance } = require('../models');
        const { Op } = require('sequelize');

        // Get recent activities from the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const activities = [];

        // Recent bookings
        const recentBookings = await Booking.findAll({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                },
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['name']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: limit
        });

        recentBookings.forEach(booking => {
            activities.push({
                id: `booking_${booking.id}`,
                type: 'booking',
                description: `New booking created for ${booking.lab?.name || booking.equipment?.name || 'resource'}`,
                user_name: booking.user?.name || 'Unknown User',
                user_email: booking.user?.email,
                created_at: booking.created_at,
                details: {
                    booking_id: booking.id,
                    resource: booking.lab?.name || booking.equipment?.name,
                    purpose: booking.purpose,
                    status: booking.status
                }
            });
        });

        // Recent incidents
        const recentIncidents = await Incident.findAll({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        recentIncidents.forEach(incident => {
            activities.push({
                id: `incident_${incident.id}`,
                type: 'incident',
                description: `Incident reported: ${incident.title}`,
                user_name: incident.reporter?.name || 'Unknown User',
                user_email: incident.reporter?.email,
                created_at: incident.created_at,
                details: {
                    incident_id: incident.id,
                    title: incident.title,
                    severity: incident.severity,
                    status: incident.status,
                    equipment: incident.equipment?.name
                }
            });
        });

        // Recent maintenance
        const recentMaintenance = await Maintenance.findAll({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name', 'email']
                },
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['name']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        recentMaintenance.forEach(maintenance => {
            activities.push({
                id: `maintenance_${maintenance.id}`,
                type: 'maintenance',
                description: `Maintenance scheduled for ${maintenance.equipment?.name || 'equipment'}`,
                user_name: maintenance.creator?.name || 'System',
                user_email: maintenance.creator?.email,
                created_at: maintenance.created_at,
                details: {
                    maintenance_id: maintenance.id,
                    equipment: maintenance.equipment?.name,
                    maintenance_type: maintenance.maintenance_type,
                    status: maintenance.status,
                    scheduled_date: maintenance.scheduled_date
                }
            });
        });

        // Recent equipment additions
        const recentEquipment = await Equipment.findAll({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 3
        });

        recentEquipment.forEach(equipment => {
            activities.push({
                id: `equipment_${equipment.id}`,
                type: 'equipment',
                description: `New equipment added: ${equipment.name}`,
                user_name: equipment.creator?.name || 'System',
                user_email: equipment.creator?.email,
                created_at: equipment.created_at,
                details: {
                    equipment_id: equipment.id,
                    name: equipment.name,
                    model: equipment.model,
                    status: equipment.status
                }
            });
        });

        // Sort all activities by created_at descending
        activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            message: 'Recent activities retrieved successfully',
            data: activities.slice(0, limit)
        });

    } catch (error) {
        console.error('💥 Error fetching recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activities',
            error: error.message
        });
    }
});

// Test endpoint - MUST be before the /:id route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Activities routes are working!',
        timestamp: new Date().toISOString(),
        availableEndpoints: {
            recent: 'GET /api/activities/recent?limit=10',
            byId: 'GET /api/activities/:id',
            test: 'GET /api/activities/test'
        }
    });
});

// GET activity by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const activityId = req.params.id;
        console.log(`📋 Fetching activity: ${activityId}`);

        // Parse activity ID to determine type and ID
        const [type, id] = activityId.split('_');
        
        let activity = null;
        const { User, Booking, Equipment, Lab, Incident, Maintenance } = require('../models');

        switch (type) {
            case 'booking':
                const booking = await Booking.findByPk(id, {
                    include: [
                        { model: User, as: 'user', attributes: ['name', 'email'] },
                        { model: Lab, as: 'lab', attributes: ['name'] },
                        { model: Equipment, as: 'equipment', attributes: ['name'] }
                    ]
                });
                if (booking) {
                    activity = {
                        id: activityId,
                        type: 'booking',
                        description: `Booking for ${booking.lab?.name || booking.equipment?.name || 'resource'}`,
                        user_name: booking.user?.name || 'Unknown User',
                        created_at: booking.created_at,
                        details: booking
                    };
                }
                break;

            case 'incident':
                const incident = await Incident.findByPk(id, {
                    include: [
                        { model: User, as: 'reporter', attributes: ['name', 'email'] },
                        { model: Equipment, as: 'equipment', attributes: ['name'] }
                    ]
                });
                if (incident) {
                    activity = {
                        id: activityId,
                        type: 'incident',
                        description: `Incident: ${incident.title}`,
                        user_name: incident.reporter?.name || 'Unknown User',
                        created_at: incident.created_at,
                        details: incident
                    };
                }
                break;

            case 'maintenance':
                const maintenance = await Maintenance.findByPk(id, {
                    include: [
                        { model: User, as: 'creator', attributes: ['name', 'email'] },
                        { model: Equipment, as: 'equipment', attributes: ['name'] }
                    ]
                });
                if (maintenance) {
                    activity = {
                        id: activityId,
                        type: 'maintenance',
                        description: `Maintenance for ${maintenance.equipment?.name || 'equipment'}`,
                        user_name: maintenance.creator?.name || 'System',
                        created_at: maintenance.created_at,
                        details: maintenance
                    };
                }
                break;

            case 'equipment':
                const equipment = await Equipment.findByPk(id, {
                    include: [
                        { model: User, as: 'creator', attributes: ['name', 'email'] }
                    ]
                });
                if (equipment) {
                    activity = {
                        id: activityId,
                        type: 'equipment',
                        description: `Equipment: ${equipment.name}`,
                        user_name: equipment.creator?.name || 'System',
                        created_at: equipment.created_at,
                        details: equipment
                    };
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid activity type'
                });
        }

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found'
            });
        }

        res.json({
            success: true,
            message: 'Activity retrieved successfully',
            data: activity
        });

    } catch (error) {
        console.error('💥 Error fetching activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity',
            error: error.message
        });
    }
});

module.exports = router;