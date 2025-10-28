// Email Notification Service
const nodemailer = require('nodemailer');
const User = require('../models/User');
const NotificationSettings = require('../models/NotificationSettings');

// Gmail transporter configuration
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Send notification email
async function sendNotificationEmail(userId, type, title, message, metadata = null) {
    try {
        // Get user details
        const user = await User.findByPk(userId);
        if (!user) {
            console.log(`❌ User not found: ${userId}`);
            return false;
        }

        // Check user notification settings
        const settings = await NotificationSettings.findOne({
            where: { user_id: userId }
        });

        // If no settings or email notifications disabled, skip
        if (settings && !settings.email_notifications) {
            console.log(`📧 Email notifications disabled for user: ${user.email}`);
            return false;
        }

        // Generate email content based on notification type
        const emailContent = generateEmailContent(type, title, message, user, metadata);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html
        };

        await gmailTransporter.sendMail(mailOptions);
        console.log(`✅ Notification email sent to ${user.email}: ${title}`);
        return true;

    } catch (error) {
        console.error('❌ Error sending notification email:', error);
        return false;
    }
}

// Generate email content based on notification type
function generateEmailContent(type, title, message, user, metadata) {
    const baseStyle = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6; margin: 0;">NEC LabMS</h1>
                <p style="color: #6B7280; margin: 5px 0;">Laboratory Management System</p>
            </div>
    `;

    const footer = `
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
                    This email was sent from NEC Laboratory Management System
                </p>
                <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
                    National Engineering College, K.R.Nagar, Kovilpatti - 628503
                </p>
                <p style="font-size: 10px; color: #9CA3AF; margin: 15px 0 5px 0;">
                    To manage your notification preferences, log in to your account and visit Settings.
                </p>
            </div>
        </div>
    `;

    let subject, headerColor, icon, content;

    switch (type) {
        case 'booking':
            subject = '🔬 Lab Booking Notification - NEC LabMS';
            headerColor = '#10B981'; // Green
            icon = '🔬';
            content = `
                <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Lab Booking Update</h2>
                    <p style="margin: 0; opacity: 0.9;">Your lab booking status has changed</p>
                </div>
                <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #065F46;">${title}</h3>
                    <p style="margin: 0; color: #047857; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        case 'maintenance':
            subject = '🔧 Equipment Maintenance Alert - NEC LabMS';
            headerColor = '#F59E0B'; // Yellow
            icon = '🔧';
            content = `
                <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Maintenance Alert</h2>
                    <p style="margin: 0; opacity: 0.9;">Equipment maintenance notification</p>
                </div>
                <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #92400E;">${title}</h3>
                    <p style="margin: 0; color: #B45309; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        case 'system':
            subject = '⚙️ System Notification - NEC LabMS';
            headerColor = '#3B82F6'; // Blue
            icon = '⚙️';
            content = `
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} System Update</h2>
                    <p style="margin: 0; opacity: 0.9;">Important system information</p>
                </div>
                <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #1E40AF;">${title}</h3>
                    <p style="margin: 0; color: #2563EB; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        case 'equipment':
            subject = '📱 Equipment Notification - NEC LabMS';
            headerColor = '#8B5CF6'; // Purple
            icon = '📱';
            content = `
                <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Equipment Update</h2>
                    <p style="margin: 0; opacity: 0.9;">Equipment status notification</p>
                </div>
                <div style="background: #FAF5FF; border-left: 4px solid #8B5CF6; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #6B21A8;">${title}</h3>
                    <p style="margin: 0; color: #7C2D92; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        case 'incident':
            subject = '⚠️ Incident Alert - NEC LabMS';
            headerColor = '#EF4444'; // Red
            icon = '⚠️';
            content = `
                <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Incident Alert</h2>
                    <p style="margin: 0; opacity: 0.9;">Incident reported - immediate attention required</p>
                </div>
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #991B1B;">${title}</h3>
                    <p style="margin: 0; color: #B91C1C; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        case 'training':
            subject = '🎓 Training Notification - NEC LabMS';
            headerColor = '#06B6D4'; // Cyan
            icon = '🎓';
            content = `
                <div style="background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Training Update</h2>
                    <p style="margin: 0; opacity: 0.9;">Training session information</p>
                </div>
                <div style="background: #ECFEFF; border-left: 4px solid #06B6D4; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #155E75;">${title}</h3>
                    <p style="margin: 0; color: #0E7490; line-height: 1.6;">${message}</p>
                </div>
            `;
            break;

        default:
            subject = '📢 Notification - NEC LabMS';
            headerColor = '#6B7280'; // Gray
            icon = '📢';
            content = `
                <div style="background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${icon} Notification</h2>
                    <p style="margin: 0; opacity: 0.9;">You have a new notification</p>
                </div>
                <div style="background: #F9FAFB; border-left: 4px solid #6B7280; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #374151;">${title}</h3>
                    <p style="margin: 0; color: #4B5563; line-height: 1.6;">${message}</p>
                </div>
            `;
    }

    // Add user greeting
    const greeting = `
        <div style="margin: 20px 0;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
                Hello ${user.name || 'User'},
            </p>
        </div>
    `;

    // Add metadata if available
    let metadataSection = '';
    if (metadata) {
        try {
            const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            if (meta && Object.keys(meta).length > 0) {
                metadataSection = `
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #475569; font-size: 14px;">Additional Details:</h4>
                        <div style="font-size: 13px; color: #64748B;">
                            ${Object.entries(meta).map(([key, value]) => 
                                `<p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            // If metadata parsing fails, ignore it
        }
    }

    return {
        subject,
        html: baseStyle + greeting + content + metadataSection + footer
    };
}

// Send bulk notification emails to multiple users
async function sendBulkNotificationEmails(userIds, type, title, message, metadata = null) {
    const results = [];
    
    for (const userId of userIds) {
        const result = await sendNotificationEmail(userId, type, title, message, metadata);
        results.push({ userId, success: result });
    }
    
    return results;
}

module.exports = {
    sendNotificationEmail,
    sendBulkNotificationEmails,
    generateEmailContent
};