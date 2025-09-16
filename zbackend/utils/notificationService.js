// server/utils/notificationService.js
const Notification = require('../../../lab-management-backend/models/Notification');
const NotificationSettings = require('../../../lab-management-backend/models/NotificationSettings');

// Create a notification for a user
async function createNotification(userId, type, title, message, priority = 'normal') {
    try {
        // Check user notification settings
        const settings = await NotificationSettings.findOne({
            where: { user_id: userId }
        });

        // If settings don't exist or the notification type is enabled
        if (!settings ||
            (type === 'booking' && settings.booking_confirmations) ||
            (type === 'maintenance' && settings.maintenance_alerts) ||
            (type === 'equipment' && settings.equipment_availability) ||
            (type === 'system' && settings.system_updates)) {

            // Create the notification
            return await Notification.create({
                user_id: userId,
                type,
                title,
                message,
                priority,
                read: false
            });
        }

        // Return null if the notification type is disabled
        return null;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

// Send a notification to multiple users
async function notifyUsers(userIds, type, title, message, priority = 'normal') {
    try {
        const notifications = [];

        for (const userId of userIds) {
            const notification = await createNotification(userId, type, title, message, priority);
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

module.exports = {
    createNotification,
    notifyUsers
};