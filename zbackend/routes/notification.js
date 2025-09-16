// routes/notifications.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all notifications for the logged-in user
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: { notifications }
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

// GET notification settings for the logged-in user
router.get('/settings', async (req, res) => {
    try {
        let settings = await NotificationSettings.findOne({
            where: { user_id: req.user.id }
        });

        // If settings don't exist, create default settings
        if (!settings) {
            settings = await NotificationSettings.create({
                user_id: req.user.id
            });
        }

        res.json({
            success: true,
            data: { settings }
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

// UPDATE notification settings for the logged-in user
router.put('/settings', async (req, res) => {
    try {
        const {
            booking_confirmations,
            maintenance_alerts,
            equipment_availability,
            system_updates,
            notification_method
        } = req.body;

        let settings = await NotificationSettings.findOne({
            where: { user_id: req.user.id }
        });

        // If settings don't exist, create them
        if (!settings) {
            settings = await NotificationSettings.create({
                user_id: req.user.id,
                booking_confirmations,
                maintenance_alerts,
                equipment_availability,
                system_updates,
                notification_method
            });
        } else {
            // Update existing settings
            await settings.update({
                booking_confirmations,
                maintenance_alerts,
                equipment_availability,
                system_updates,
                notification_method
            });
        }

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: { settings }
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

// MARK notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.update({ read: true });

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
});

// MARK all notifications as read
router.put('/mark-all-read', async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { user_id: req.user.id, read: false } }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
});

// DELETE notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.destroy();

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
});

// DELETE all notifications
router.delete('/', async (req, res) => {
    try {
        await Notification.destroy({
            where: { user_id: req.user.id }
        });

        res.json({
            success: true,
            message: 'All notifications deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete all notifications',
            error: error.message
        });
    }
});

module.exports = router;