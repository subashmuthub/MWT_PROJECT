// middleware/auth.js - Corrected version
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - should match your auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generic authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        console.log('🔐 Authentication middleware triggered');
        console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');

        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log('❌ No authorization header');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid authorization header format');
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token || token === 'null' || token === 'undefined') {
            console.log('❌ Empty or invalid token value');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
        }

        console.log('🎫 Token extracted successfully');

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.email);

        // Get user from database to ensure they still exist and are active
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            console.log('❌ User not found in database:', decoded.userId);
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        if (!user.is_active) {
            console.log('❌ User account is inactive:', user.email);
            return res.status(401).json({
                success: false,
                message: 'Access denied. Account is inactive.'
            });
        }

        // Add user info to request object - FIXED: use userId instead of id
        req.user = {
            userId: user.id, // This matches what your orders route expects
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        console.log('✅ Authentication successful for:', req.user.email);
        next();

    } catch (error) {
        console.error('💥 Auth middleware error:', error.message);

        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token expired.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Admin role middleware - FIXED: Proper middleware chaining
const requireAdmin = (req, res, next) => {
    // Check if user is authenticated and is admin
    if (!req.user) {
        console.log('❌ No authenticated user found');
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        console.log('❌ Admin access denied. User role:', req.user.role);
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    console.log('✅ Admin access granted for:', req.user.email);
    next();
};

// Teacher or Admin role middleware - FIXED: Proper middleware chaining
const requireTeacherOrAdmin = (req, res, next) => {
    // Check if user is authenticated and has proper role
    if (!req.user) {
        console.log('❌ No authenticated user found');
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        console.log('❌ Teacher/Admin access denied. User role:', req.user.role);
        return res.status(403).json({
            success: false,
            message: 'Access denied. Teacher or Admin privileges required.'
        });
    }

    console.log('✅ Teacher/Admin access granted for:', req.user.email);
    next();
};

// Student, Teacher, or Admin role middleware (authenticated users)
const requireAuthenticated = authenticateToken;

// Optional authentication middleware (doesn't block if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);

        if (!token || token === 'null' || token === 'undefined') {
            req.user = null;
            return next();
        }

        // Try to verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (user && user.is_active) {
            req.user = {
                userId: user.id,
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // If token is invalid, continue without authentication
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireTeacherOrAdmin,
    requireAuthenticated,
    optionalAuth
};