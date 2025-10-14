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

// Send email notification endpoint
router.post('/send-email', async (req, res) => {
    try {
        const { type, recipient, data } = req.body;

        console.log('📧 Sending email notification:', { type, recipient, userId: req.user.userId });

        // Email templates
        const emailTemplates = {
            profile_updated: {
                subject: 'Profile Updated Successfully',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Profile Updated</h2>
                        <p>Hello ${data.name},</p>
                        <p>Your profile has been successfully updated on ${new Date(data.timestamp).toLocaleString()}.</p>
                        <p>If you didn't make this change, please contact support immediately.</p>
                        <hr style="margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            This is an automated message from Lab Management System.
                        </p>
                    </div>
                `
            },
            password_changed: {
                subject: '🔐 Password Changed Successfully',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc2626;">Security Alert: Password Changed</h2>
                        <p>Hello ${data.name},</p>
                        <p>Your password has been successfully changed on ${new Date(data.timestamp).toLocaleString()}.</p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #dc2626;">Important Security Notice:</p>
                            <p style="margin: 5px 0 0 0;">If you didn't make this change, your account may be compromised. Please contact support immediately.</p>
                        </div>
                        <hr style="margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            This is an automated security message from Lab Management System.
                        </p>
                    </div>
                `
            },
            notifications_updated: {
                subject: 'Notification Preferences Updated',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #059669;">Notification Settings Updated</h2>
                        <p>Hello ${data.name},</p>
                        <p>Your notification preferences have been updated on ${new Date(data.timestamp).toLocaleString()}.</p>
                        <p>You will now receive notifications according to your new preferences.</p>
                        <hr style="margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            This is an automated message from Lab Management System.
                        </p>
                    </div>
                `
            }
        };

        const template = emailTemplates[type];
        if (!template) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email template type'
            });
        }

        // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
        // For now, we'll just log the email and create a notification record
        console.log('📧 Email would be sent:', {
            to: recipient,
            subject: template.subject,
            html: template.html
        });

        // Create a notification record
        const notification = await Notification.create({
            user_id: req.user.userId,
            title: template.subject,
            message: `Email notification sent: ${type}`,
            type: 'email',
            is_read: false
        });

        res.json({
            success: true,
            message: 'Email notification sent successfully',
            data: { notification }
        });
    } catch (error) {
        console.error('💥 Error sending email notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email notification',
            error: error.message
        });
    }
});

module.exports = router;