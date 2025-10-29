// server/utils/notificationService.js
const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');

// Create a notification for a user
async function createNotification(notificationData) {
    try {
        // Support both object and individual parameter formats
        let userId, type, title, message, priority, createdBy, metadata;
        
        if (typeof notificationData === 'object' && notificationData.user_id) {
            // New object format
            ({ user_id: userId, type, title, message, priority = 'normal', created_by: createdBy, metadata } = notificationData);
        } else {
            // Legacy individual parameters format
            [userId, type, title, message, priority = 'normal', createdBy] = arguments;
        }

        // Check user notification settings
        const settings = await NotificationSettings.findOne({
            where: { user_id: userId }
        });

        // If settings don't exist, create default settings
        if (!settings) {
            await NotificationSettings.create({
                user_id: userId,
                email_notifications: true,
                push_notifications: true,
                booking_reminders: true,
                system_alerts: true
            });
        }

        // Create the notification
        const notification = await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            read: false,
            created_by: createdBy,
            metadata: metadata ? JSON.stringify(metadata) : null
        });

        console.log(`✅ Notification created: ${title} for user ${userId}`);
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
}

// Send a notification to multiple users
async function notifyUsers(userIds, type, title, message, priority = 'normal', createdBy = null) {
    try {
        const notifications = [];

        for (const userId of userIds) {
            const notification = await createNotification(userId, type, title, message, priority, createdBy);
            if (notification) {
                notifications.push(notification);
            }
        }

        return notifications;
    } catch (error) {
        console.error('Error notifying users:', error);
        throw error;
    }
}

// Get unread notifications count for a user
async function getUnreadCount(userId) {
    try {
        const count = await Notification.count({
            where: {
                user_id: userId,
                read: false
            }
        });
        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

// Mark notification as read
async function markAsRead(notificationId, userId) {
    try {
        const [updated] = await Notification.update(
            { read: true },
            {
                where: {
                    id: notificationId,
                    user_id: userId
                }
            }
        );
        return updated > 0;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

// Mark all notifications as read for a user
async function markAllAsRead(userId) {
    try {
        const [updated] = await Notification.update(
            { read: true },
            {
                where: {
                    user_id: userId,
                    read: false
                }
            }
        );
        return updated;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
    }
}

module.exports = {
    createNotification,
    notifyUsers,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};