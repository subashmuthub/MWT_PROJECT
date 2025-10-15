// routes/users.js - CORRECTED VERSION
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { requireAdmin, requireTeacherOrAdmin, authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// ✅ FIXED: Add authenticateToken BEFORE role middleware

// Get all users - Teachers and Admins can view all users
router.get('/', authenticateToken, requireTeacherOrAdmin, async (req, res) => {
    try {
        console.log('👥 Fetching users for:', req.user.email, 'Role:', req.user.role);

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'student_id', 'department', 'phone', 'is_active', 'last_login', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        // Transform is_active to status for frontend
        const transformedUsers = users.map(user => ({
            ...user.dataValues,
            status: user.is_active ? 'Active' : 'Inactive',
            lastLogin: user.last_login
        }));

        console.log(`✅ Found ${users.length} users`);
        res.json(transformedUsers);
    } catch (error) {
        console.error('💥 Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user statistics - Teachers and Admins can view stats
router.get('/stats', authenticateToken, requireTeacherOrAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching user stats for:', req.user.email);

        const [totalUsers, activeUsers, students, teachers, admins, labTechnicians, labAssistants] = await Promise.all([
            User.count(),
            User.count({ where: { is_active: true } }),
            User.count({ where: { role: 'student' } }),
            User.count({ where: { role: 'teacher' } }),
            User.count({ where: { role: 'admin' } }),
            User.count({ where: { role: 'lab_technician' } }),
            User.count({ where: { role: 'lab_assistant' } })
        ]);

        console.log('✅ User stats calculated');
        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                students,
                teachers,
                admins,
                lab_technicians: labTechnicians,
                lab_assistants: labAssistants
            }
        });
    } catch (error) {
        console.error('💥 Error fetching user stats:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Create new user - Only Admins can create users
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('👤 Creating new user by admin:', req.user.email);

        const { name, email, role, password, student_id, department, phone } = req.body;

        // Validate required fields
        if (!name || !email || !role || !password) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, role, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            role: role.toLowerCase(), // Keep consistent with your ENUM values
            password: hashedPassword,
            student_id: student_id || null,
            department: department || null,
            phone: phone || null,
            is_active: true,
            is_email_verified: false
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        console.log('✅ User created successfully:', user.id);
        res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
            user: userResponse
        });
    } catch (error) {
        console.error('💥 Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user's profile - Any authenticated user (MOVED TO AVOID ROUTE CONFLICT)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('👤 Fetching profile for:', req.user.email);

        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'name', 'email', 'role', 'student_id', 'department', 'phone', 'bio', 'position', 'avatar_url', 'is_active', 'is_email_verified', 'last_login', 'created_at']
        });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('💥 Error fetching profile:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update current user's profile - Any authenticated user (MOVED TO AVOID ROUTE CONFLICT)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, department, bio, position, avatar, avatar_url } = req.body;

        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        console.log('📝 Updating profile for:', user.email, 'with data:', { name, phone, department, bio, position, avatar_url: avatar_url ? 'present' : 'none' });

        // Validate input
        if (name && name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long'
            });
        }

        if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number'
            });
        }

        // Validate avatar if provided
        if (avatar_url && avatar_url.startsWith('data:image/')) {
            // Check if base64 image size is reasonable (< 10MB)
            const base64Size = avatar_url.length * 0.75; // Approximate size
            if (base64Size > 10 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar image is too large. Please use an image smaller than 10MB.'
                });
            }
        }

        // Users can update their profile information
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone;
        if (department !== undefined) updateData.department = department;
        if (bio !== undefined) updateData.bio = bio;
        if (position !== undefined) updateData.position = position;
        // Handle both avatar and avatar_url for backward compatibility
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        else if (avatar !== undefined) updateData.avatar_url = avatar;

        await user.update(updateData);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('💥 Error updating profile:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update user - Only Admins can update users
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`✏️ Updating user ${id} by admin:`, req.user.email);

        const { name, email, role, student_id, department, phone } = req.body;

        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from modifying their own role
        if (req.user.userId === parseInt(id) && role && role !== user.role) {
            return res.status(403).json({ error: 'You cannot change your own role' });
        }

        // Check if email is being changed and if it's already in use
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                where: {
                    email,
                    id: { [Op.ne]: id }
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Update user
        await user.update({
            name: name || user.name,
            email: email || user.email,
            role: role ? role.toLowerCase() : user.role,
            student_id: student_id !== undefined ? student_id : user.student_id,
            department: department !== undefined ? department : user.department,
            phone: phone !== undefined ? phone : user.phone
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        console.log('✅ User updated successfully');
        res.json({
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('💥 Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user status (activate/deactivate) - Only Admins
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be "Active" or "Inactive"' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from deactivating themselves
        if (req.user.userId === parseInt(id) && status === 'Inactive') {
            return res.status(403).json({ error: 'You cannot deactivate your own account' });
        }

        await user.update({
            is_active: status === 'Active'
        });

        console.log('✅ User status updated successfully');
        res.json({
            message: 'User status updated successfully',
            status: status
        });
    } catch (error) {
        console.error('💥 Error updating user status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reset user password - Only Admins
router.post('/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await user.update({ password: hashedPassword });

        // In a real application, you would send this via email
        console.log(`🔐 Temporary password for ${user.email}: ${tempPassword}`);

        res.json({
            message: 'Password reset successfully. Temporary password sent to user email.',
            // Only include temp password in development mode
            ...(process.env.NODE_ENV === 'development' && { tempPassword })
        });
    } catch (error) {
        console.error('💥 Error resetting password:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user's profile - Any authenticated user
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('👤 Fetching profile for:', req.user.email);

        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'name', 'email', 'role', 'student_id', 'department', 'phone', 'is_active', 'is_email_verified', 'last_login', 'created_at']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('💥 Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update current user's profile - Any authenticated user
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, department, bio, position, avatar, avatar_url } = req.body;

        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        console.log('📝 Updating profile for:', user.email, 'with data:', { name, phone, department, bio, position, avatar_url: avatar_url ? 'present' : 'none' });

        // Validate input
        if (name && name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long'
            });
        }

        if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number'
            });
        }

        // Validate avatar if provided
        if (avatar_url && avatar_url.startsWith('data:image/')) {
            // Check if base64 image size is reasonable (< 10MB)
            const base64Size = avatar_url.length * 0.75; // Approximate size
            if (base64Size > 10 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar image is too large. Please use an image smaller than 10MB.'
                });
            }
        }

        // Users can update their profile information
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone;
        if (department !== undefined) updateData.department = department;
        if (bio !== undefined) updateData.bio = bio;
        if (position !== undefined) updateData.position = position;
        // Handle both avatar and avatar_url for backward compatibility
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        else if (avatar !== undefined) updateData.avatar_url = avatar;

        await user.update(updateData);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('💥 Error updating profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// Change password for current user - Any authenticated user
router.put('/profile/password', authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Both current password and new password are required'
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        const user = await User.unscoped().findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(current_password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await user.update({ password: hashedPassword });

        res.json({ 
            success: true,
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('💥 Error changing password:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to change password',
            error: error.message 
        });
    }
});

// Update notification preferences for current user
router.put('/profile/notifications', authenticateToken, async (req, res) => {
    try {
        const { email_notifications, booking_reminders, maintenance_alerts, system_updates } = req.body;

        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Create notification preferences object
        const notificationPreferences = {
            email_notifications: email_notifications !== undefined ? email_notifications : true,
            booking_reminders: booking_reminders !== undefined ? booking_reminders : true,
            maintenance_alerts: maintenance_alerts !== undefined ? maintenance_alerts : false,
            system_updates: system_updates !== undefined ? system_updates : true
        };

        await user.update({ 
            notification_preferences: JSON.stringify(notificationPreferences)
        });

        res.json({ 
            success: true,
            message: 'Notification preferences updated successfully',
            data: notificationPreferences
        });
    } catch (error) {
        console.error('💥 Error updating notification preferences:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update notification preferences',
            error: error.message 
        });
    }
});

// Change password for current user - Any authenticated user (legacy endpoint)
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Both current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.unscoped().findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('💥 Error changing password:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete user (soft delete) - Only Admins
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.user.userId === parseInt(id)) {
            return res.status(403).json({ error: 'You cannot delete your own account' });
        }

        // Soft delete - just deactivate
        await user.update({ is_active: false });

        console.log('✅ User deactivated successfully');
        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('💥 Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Settings Management Endpoints

// Get user settings
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user settings (use defaults for missing fields)
        const settings = {
            // General Settings
            language: user.language || 'en',
            timezone: user.timezone || 'UTC',
            theme: user.theme || 'light',
            
            // Privacy Settings
            profile_visibility: user.profile_visibility || 'public',
            show_email: user.show_email !== undefined ? user.show_email : false,
            show_phone: user.show_phone !== undefined ? user.show_phone : false,
            
            // Notification Settings
            email_notifications: user.email_notifications !== undefined ? user.email_notifications : true,
            push_notifications: user.push_notifications !== undefined ? user.push_notifications : true,
            sms_notifications: user.sms_notifications !== undefined ? user.sms_notifications : false,
            
            // Email Preferences
            booking_confirmations: user.booking_confirmations !== undefined ? user.booking_confirmations : true,
            booking_reminders: user.booking_reminders !== undefined ? user.booking_reminders : true,
            booking_cancellations: user.booking_cancellations !== undefined ? user.booking_cancellations : true,
            maintenance_alerts: user.maintenance_alerts !== undefined ? user.maintenance_alerts : true,
            equipment_updates: user.equipment_updates !== undefined ? user.equipment_updates : true,
            system_updates: user.system_updates !== undefined ? user.system_updates : true,
            security_alerts: true, // Always true for security
            marketing_emails: user.marketing_emails !== undefined ? user.marketing_emails : false,
            newsletter: user.newsletter !== undefined ? user.newsletter : true,
            
            // Advanced Settings
            auto_logout: user.auto_logout || 30,
            session_timeout: user.session_timeout || 60,
            two_factor_enabled: user.two_factor_enabled !== undefined ? user.two_factor_enabled : false,
            backup_codes_generated: user.backup_codes_generated !== undefined ? user.backup_codes_generated : false
        };

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('💥 Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const {
            language, timezone, theme,
            profile_visibility, show_email, show_phone,
            email_notifications, push_notifications, sms_notifications,
            booking_confirmations, booking_reminders, booking_cancellations,
            maintenance_alerts, equipment_updates, system_updates,
            marketing_emails, newsletter,
            auto_logout, session_timeout, two_factor_enabled
        } = req.body;

        // Update user settings
        await user.update({
            language,
            timezone,
            theme,
            profile_visibility,
            show_email,
            show_phone,
            email_notifications,
            push_notifications,
            sms_notifications,
            booking_confirmations,
            booking_reminders,
            booking_cancellations,
            maintenance_alerts,
            equipment_updates,
            system_updates,
            marketing_emails,
            newsletter,
            auto_logout,
            session_timeout,
            two_factor_enabled
        });

        console.log('✅ Settings updated successfully for user:', user.email);
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('💥 Error updating settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update specific settings section
router.put('/settings/:section', authenticateToken, async (req, res) => {
    try {
        const { section } = req.params;
        const user = await User.findByPk(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter settings based on section
        let updateData = {};
        
        switch (section) {
            case 'general':
                const { language, timezone, theme } = req.body;
                updateData = { language, timezone, theme };
                break;
            case 'notifications':
                const { email_notifications, push_notifications, sms_notifications } = req.body;
                updateData = { email_notifications, push_notifications, sms_notifications };
                break;
            case 'privacy':
                const { profile_visibility, show_email, show_phone } = req.body;
                updateData = { profile_visibility, show_email, show_phone };
                break;
            case 'email':
                const { 
                    booking_confirmations, booking_reminders, booking_cancellations,
                    maintenance_alerts, equipment_updates, system_updates,
                    marketing_emails, newsletter 
                } = req.body;
                updateData = { 
                    booking_confirmations, booking_reminders, booking_cancellations,
                    maintenance_alerts, equipment_updates, system_updates,
                    marketing_emails, newsletter 
                };
                break;
            case 'advanced':
                const { auto_logout, session_timeout, two_factor_enabled } = req.body;
                updateData = { auto_logout, session_timeout, two_factor_enabled };
                break;
            default:
                return res.status(400).json({ error: 'Invalid settings section' });
        }

        await user.update(updateData);
        
        console.log(`✅ ${section} settings updated for user:`, user.email);
        res.json({ success: true, message: `${section} settings updated successfully` });
    } catch (error) {
        console.error('💥 Error updating settings section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export user data
router.get('/export-data', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // TODO: Include related data like bookings, orders, etc.
        const exportData = {
            user: user.toJSON(),
            exported_at: new Date().toISOString(),
            version: '1.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="lab-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
    } catch (error) {
        console.error('💥 Error exporting data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate backup codes for 2FA
router.post('/generate-backup-codes', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate 10 backup codes
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }

        // Store hashed backup codes
        const hashedCodes = await Promise.all(codes.map(code => bcrypt.hash(code, 10)));
        
        await user.update({ 
            backup_codes: JSON.stringify(hashedCodes),
            backup_codes_generated: true 
        });

        console.log('✅ Backup codes generated for user:', user.email);
        res.json({ success: true, data: { codes }, message: 'Backup codes generated successfully' });
    } catch (error) {
        console.error('💥 Error generating backup codes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete account (soft delete)
router.delete('/delete-account', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Soft delete - deactivate account
        await user.update({ 
            is_active: false,
            deleted_at: new Date()
        });

        console.log('✅ Account deleted for user:', user.email);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('💥 Error deleting account:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test route to check if users routes are working
router.get('/test', (req, res) => {
    res.json({
        message: 'Users routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;