// routes/notifications.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const { createNotification, sendEmailOnly } = require('../utils/notificationService');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST create a test notification (for testing purposes)
router.post('/test', async (req, res) => {
    try {
        const { title = 'Test Notification', message = 'This is a test notification', type = 'info' } = req.body;
        
        const notification = await createNotification({
            user_id: req.user.id,
            type,
            title,
            message,
            priority: 'normal',
            created_by: req.user.id
        });

        res.json({
            success: true,
            message: 'Test notification created and email sent',
            data: notification
        });
    } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test notification',
            error: error.message
        });
    }
});

// POST send test email notification
router.post('/test-email', async (req, res) => {
    try {
        const { title = 'Test Email Notification', message = 'This is a test email notification from NEC LabMS', type = 'system' } = req.body;
        
        const emailSent = await sendEmailOnly(req.user.id, type, title, message);

        res.json({
            success: emailSent,
            message: emailSent ? 'Test email notification sent successfully' : 'Failed to send email notification'
        });
    } catch (error) {
        console.error('Error sending test email notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email notification',
            error: error.message
        });
    }
});

// GET all notifications for the logged-in user
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, unread_only = false, type = null } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = { user_id: req.user.id };
        
        if (unread_only === 'true') {
            whereCondition.read = false;
        }
        
        if (type && type !== 'all') {
            whereCondition.type = type;
        }

        const notifications = await Notification.findAll({
            where: whereCondition,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const total = await Notification.count({
            where: whereCondition
        });

        res.json({
            success: true,
            data: notifications,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// GET notification settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await NotificationSettings.findOne({
            where: { user_id: req.user.id }
        });

        if (!settings) {
            settings = await NotificationSettings.create({
                user_id: req.user.id,
                email_notifications: true,
                push_notifications: true,
                booking_reminders: true,
                system_alerts: true
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification settings',
            error: error.message
        });
    }
});

// PUT update notification settings
router.put('/settings', async (req, res) => {
    try {
        const settings = await NotificationSettings.findOne({
            where: { user_id: req.user.id }
        });

        if (settings) {
            await settings.update(req.body);
        } else {
            await NotificationSettings.create({
                user_id: req.user.id,
                ...req.body
            });
        }

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification settings',
            error: error.message
        });
    }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const [updated] = await Notification.update(
            { read: true },
            {
                where: {
                    id: req.params.id,
                    user_id: req.user.id
                }
            }
        );

        if (updated) {
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
});

// DELETE notification
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Notification.destroy({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (deleted) {
            res.json({
                success: true,
                message: 'Notification deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
});

module.exports = router;
