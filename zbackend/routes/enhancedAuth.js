const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Gmail OTP Storage (In production, use Redis or database)
const otpStore = new Map();

// DEV DEBUG ENDPOINT: expose OTP for an email (only in non-production)
// WARNING: This endpoint is for local testing only. Do NOT enable in production.
router.get('/debug-get-otp', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored) return res.status(404).json({ success: false, message: 'OTP not found' });

    return res.json({ success: true, data: stored });
});

// Gmail transporter configuration
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Helper function to validate ANY Gmail address (any domain with Gmail)
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate registration emails (ANY valid email address)
const isValidRegistrationEmail = (email) => {
    return isValidEmail(email);
};

// Helper function to validate login emails (ANY valid email address)
const isValidLoginEmail = (email) => {
    return isValidEmail(email);
};

// Helper function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send OTP email via Gmail SMTP
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'NEC LabMS - Email Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #3B82F6; margin: 0;">NEC LabMS</h1>
                    <p style="color: #6B7280; margin: 5px 0;">Laboratory Management System</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">Email Verification</h2>
                    <p style="margin: 0; opacity: 0.9;">Your verification code is ready</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                        Enter this verification code to complete your account setup:
                    </p>
                    <div style="background: #F3F4F6; border: 2px dashed #9CA3AF; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1F2937; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #6B7280; margin-top: 15px;">
                        This code expires in 10 minutes
                    </p>
                </div>
                
                <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400E;">
                        🔒 <strong>Security Note:</strong> Never share this code with anyone. NEC LabMS will never ask for your verification code via phone or email.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
                        This email was sent from NEC Laboratory Management System
                    </p>
                    <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
                        National Engineering College, K.R.Nagar, Kovilpatti - 628503
                    </p>
                </div>
            </div>
        `
    };

    await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
};

// Enhanced validation
const gmailValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
];

const loginEmailValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .isIn(['student', 'teacher', 'lab_assistant', 'lab_technician', 'admin'])
        .withMessage('Invalid role')
];

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to Gmail for verification
router.post('/send-otp', gmailValidation, async (req, res) => {
    try {
        console.log('📧 OTP request for:', req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const otp = generateOTP();
        console.log('🔢 Generated OTP for', email, ':', otp);
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP (In production, use Redis or database)
        otpStore.set(email.toLowerCase(), {
            otp,
            expiresAt,
            attempts: 0
        });

        // Send OTP email
        await sendOTPEmail(email, otp);
        console.log('✅ OTP sent successfully to:', email);

        res.json({
            success: true,
            message: 'OTP sent successfully to your email. Please check your inbox.',
            expiresIn: 600 // 10 minutes in seconds
        });

    } catch (error) {
        console.error('💥 OTP send error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for email verification
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const emailLower = email.toLowerCase();
        const storedData = otpStore.get(emailLower);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found or expired'
            });
        }

        // Check expiration
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(emailLower);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check attempts
        if (storedData.attempts >= 3) {
            otpStore.delete(emailLower);
            return res.status(400).json({
                success: false,
                message: 'Too many failed attempts'
            });
        }

        // Verify OTP
        if (storedData.otp !== otp.toString()) {
            storedData.attempts++;
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // OTP verified successfully
        // Mark the OTP as verified so the subsequent registration call can consume it.
        // Do NOT delete from the store here — consume (delete) only when the user completes registration.
        storedData.verified = true;
        storedData.attempts = 0; // reset attempts on successful verification
        otpStore.set(emailLower, storedData);

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('💥 OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed'
        });
    }
});

// @route   POST /api/auth/register-with-otp
// @desc    Register user after OTP verification
router.post('/register-with-otp', registerValidation, async (req, res) => {
    try {
        console.log('📝 Registration with OTP attempt:', {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            otpProvided: req.body.otp ? '***' + req.body.otp.slice(-2) : 'No OTP'
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            console.log('📋 Received data:', {
                name: req.body.name,
                email: req.body.email,
                passwordLength: req.body.password ? req.body.password.length : 0,
                role: req.body.role,
                otp: req.body.otp
            });
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role, otp } = req.body;

        // Verify OTP first
        const emailLower = email.toLowerCase();
        const storedData = otpStore.get(emailLower);

        if (!storedData) {
            console.log('❌ No OTP data found for:', emailLower);
            console.log('📋 Available OTPs in store:', Array.from(otpStore.keys()));
            return res.status(400).json({
                success: false,
                message: 'OTP not found or expired. Please request a new OTP.'
            });
        }

        console.log('🔍 OTP validation for:', emailLower, {
            hasOTP: !!storedData.otp,
            isVerified: !!storedData.verified,
            expired: Date.now() > storedData.expiresAt,
            otpMatch: storedData.otp === otp?.toString()
        });

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(emailLower);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        if (storedData.otp !== otp.toString()) {
            storedData.attempts = (storedData.attempts || 0) + 1;
            otpStore.set(emailLower, storedData);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Require that the OTP was verified previously via /verify-otp endpoint
        if (!storedData.verified) {
            return res.status(400).json({
                success: false,
                message: 'OTP must be verified before registration'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email: emailLower }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await User.create({
            name: name.trim(),
            email: emailLower,
            password: hashedPassword,
            role: role || 'student',
            is_active: true,
            is_email_verified: true // Email verified via OTP
        });

        // OTP already removed after verification above

        // Generate token
        const token = generateToken(newUser);

        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            is_active: newUser.is_active,
            is_email_verified: newUser.is_email_verified,
            created_at: newUser.created_at
        };

        console.log('✅ User registered successfully with OTP verification:', newUser.id);

        // Clean up the verified OTP
        otpStore.delete(emailLower);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userData,
                token: token
            }
        });

    } catch (error) {
        console.error('💥 Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// @route   POST /api/auth/login-with-otp
// @desc    Login user with OTP verification
router.post('/login-with-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        if (!isValidLoginEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please use a valid Gmail or NEC email address'
            });
        }

        const emailLower = email.toLowerCase();

        // Verify OTP
        const storedData = otpStore.get(emailLower);
        if (!storedData || storedData.otp !== otp.toString() || Date.now() > storedData.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email: emailLower }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Remove OTP from store
        otpStore.delete(emailLower);

        // Generate token
        const token = generateToken(user);

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            is_email_verified: user.is_email_verified
        };

        console.log('✅ OTP login successful for:', email);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token: token
            }
        });

    } catch (error) {
        console.error('💥 OTP login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// @route   GET /api/auth/oauth/google
// @desc    Initiate Google OAuth
router.get('/oauth/google', (req, res) => {
    // Check if OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'disabled') {
        return res.status(501).json({
            success: false,
            message: 'Google OAuth is not configured. Please set up Google Cloud Console credentials.'
        });
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${crypto.randomBytes(32).toString('hex')}`;

    res.json({
        success: true,
        authUrl: googleAuthUrl
    });
});

// @route   GET /api/auth/oauth/github
// @desc    Initiate GitHub OAuth
router.get('/oauth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${process.env.GITHUB_CLIENT_ID}&` +
        `redirect_uri=${process.env.GITHUB_REDIRECT_URI}&` +
        `scope=user:email&` +
        `state=${crypto.randomBytes(32).toString('hex')}`;

    res.json({
        success: true,
        authUrl: githubAuthUrl
    });
});

// Import OAuth service
const OAuthService = require('../services/oauthService');

// @route   GET /api/auth/oauth/google/callback
// @desc    Handle Google OAuth callback
router.get('/oauth/google/callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }

        console.log('🔗 Processing Google OAuth callback');

        // Process Google OAuth
        const result = await OAuthService.processGoogleOAuth(code);

        if (result.success) {
            // Redirect to frontend with token
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/success?token=${result.data.token}`;
            res.redirect(redirectUrl);
        } else {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(result.message)}`);
        }

    } catch (error) {
        console.error('💥 Google OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_server_error`);
    }
});

// @route   GET /api/auth/oauth/github/callback
// @desc    Handle GitHub OAuth callback
router.get('/oauth/github/callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
        }

        console.log('🔗 Processing GitHub OAuth callback');

        // Process GitHub OAuth
        const result = await OAuthService.processGitHubOAuth(code);

        if (result.success) {
            // Redirect to frontend with token
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/success?token=${result.data.token}`;
            res.redirect(redirectUrl);
        } else {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(result.message)}`);
        }

    } catch (error) {
        console.error('💥 GitHub OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_server_error`);
    }
});

// Enhanced login route supporting both Gmail and NEC emails
router.post('/login', loginEmailValidation, async (req, res) => {
    try {
        console.log('🔐 Login attempt:', { email: req.body.email });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        const emailLower = email.toLowerCase();

        // Find user with password included
        const user = await User.findByEmailWithPassword(emailLower);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Generate token
        const token = generateToken(user);

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            is_email_verified: user.is_email_verified || false
        };

        console.log('✅ Login successful for:', email);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token: token
            }
        });

    } catch (error) {
        console.error('💥 Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token validity
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                    is_email_verified: user.is_email_verified || false
                }
            }
        });

    } catch (error) {
        console.error('💥 Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;