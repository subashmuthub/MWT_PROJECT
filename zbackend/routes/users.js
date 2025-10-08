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

        const [totalUsers, students, teachers, admins] = await Promise.all([
            User.count(),
            User.count({ where: { role: 'student' } }),
            User.count({ where: { role: 'teacher' } }),
            User.count({ where: { role: 'admin' } })
        ]);

        console.log('✅ User stats calculated');
        res.json({
            totalUsers,
            students,
            teachers,
            admins
        });
    } catch (error) {
        console.error('💥 Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
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
        const { name, phone, department } = req.body;

        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Users can only update their own name, phone, and department
        await user.update({
            name: name || user.name,
            phone: phone !== undefined ? phone : user.phone,
            department: department !== undefined ? department : user.department
        });

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

// Test route to check if users routes are working
router.get('/test', (req, res) => {
    res.json({
        message: 'Users routes are working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;