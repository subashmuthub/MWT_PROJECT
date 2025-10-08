const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET system health
router.get('/health', authenticateToken, async (req, res) => {
    try {
        console.log('🏥 Checking system health');

        // Check database connection
        const { sequelize } = require('../config/database');
        await sequelize.authenticate();

        res.json({
            success: true,
            message: 'System health check completed',
            data: {
                server: 'online',
                database: 'connected',
                lastBackup: new Date().toISOString(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 System health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'System health check failed',
            data: {
                server: 'error',
                database: 'error',
                lastBackup: null,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// GET system metrics
router.get('/metrics', authenticateToken, async (req, res) => {
    try {
        console.log('📊 Fetching system metrics');

        // Calculate uptime (server start time - current time)
        const uptimeSeconds = process.uptime();
        const uptimePercentage = '99.9%'; // Mock data

        // Mock system load (in production, you'd use actual system metrics)
        const systemLoad = Math.floor(Math.random() * 30) + 10; // 10-40%

        // Count active users (users who have made requests in last hour)
        const { User } = require('../models');
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const activeUsers = await User.count({
            where: {
                last_login: {
                    [require('sequelize').Op.gte]: oneHourAgo
                }
            }
        });

        res.json({
            success: true,
            message: 'System metrics retrieved successfully',
            data: {
                uptime: uptimePercentage,
                systemLoad: systemLoad,
                activeUsers: activeUsers,
                uptimeSeconds: Math.floor(uptimeSeconds),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Error fetching system metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system metrics',
            error: error.message
        });
    }
});

// GET system alerts
router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        console.log('🚨 Fetching system alerts');
        
        const limit = parseInt(req.query.limit) || 10;

        // In a real system, these would come from a database or monitoring system
        // For now, we'll generate some mock alerts based on system conditions
        const alerts = [];

        // Check for equipment in maintenance
        const { Equipment } = require('../models');
        const maintenanceCount = await Equipment.count({
            where: { status: 'maintenance' }
        });

        if (maintenanceCount > 0) {
            alerts.push({
                id: 'alert_maintenance_' + Date.now(),
                type: 'warning',
                message: `${maintenanceCount} equipment item${maintenanceCount > 1 ? 's' : ''} currently under maintenance`,
                created_at: new Date().toISOString()
            });
        }

        // Check for overdue bookings
        const { Booking } = require('../models');
        const overdueBookings = await Booking.count({
            where: {
                end_time: {
                    [require('sequelize').Op.lt]: new Date()
                },
                status: 'Confirmed'
            }
        });

        if (overdueBookings > 0) {
            alerts.push({
                id: 'alert_overdue_' + Date.now(),
                type: 'error',
                message: `${overdueBookings} booking${overdueBookings > 1 ? 's' : ''} overdue`,
                created_at: new Date().toISOString()
            });
        }

        // Check for low equipment availability
        const totalEquipment = await Equipment.count();
        const availableEquipment = await Equipment.count({
            where: { status: 'available' }
        });

        const availabilityRate = totalEquipment > 0 ? (availableEquipment / totalEquipment) * 100 : 100;

        if (availabilityRate < 30) {
            alerts.push({
                id: 'alert_availability_' + Date.now(),
                type: 'warning',
                message: `Low equipment availability: only ${Math.round(availabilityRate)}% available`,
                created_at: new Date().toISOString()
            });
        }

        // Add success message if no issues
        if (alerts.length === 0) {
            alerts.push({
                id: 'alert_success_' + Date.now(),
                type: 'success',
                message: 'All systems operating normally',
                created_at: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: 'System alerts retrieved successfully',
            data: alerts.slice(0, limit)
        });

    } catch (error) {
        console.error('💥 Error fetching system alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system alerts',
            error: error.message
        });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'System routes are working!',
        timestamp: new Date().toISOString(),
        availableEndpoints: {
            health: 'GET /api/system/health',
            metrics: 'GET /api/system/metrics',
            alerts: 'GET /api/system/alerts',
            test: 'GET /api/system/test'
        }
    });
});

module.exports = router;