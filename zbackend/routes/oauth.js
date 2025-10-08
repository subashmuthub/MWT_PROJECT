// OAuth Configuration with Passport.js
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ 
            where: { 
                $or: [
                    { google_id: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (user) {
            // Update Google ID if not set
            if (!user.google_id) {
                await user.update({ google_id: profile.id });
            }
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            google_id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'student', // Default role for OAuth users
            is_active: true,
            is_email_verified: true,
            avatar_url: profile.photos[0]?.value
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            where: { 
                $or: [
                    { facebook_id: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (user) {
            if (!user.facebook_id) {
                await user.update({ facebook_id: profile.id });
            }
            return done(null, user);
        }

        user = await User.create({
            facebook_id: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'student',
            is_active: true,
            is_email_verified: true,
            avatar_url: profile.photos[0]?.value
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            where: { 
                $or: [
                    { github_id: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (user) {
            if (!user.github_id) {
                await user.update({ github_id: profile.id });
            }
            return done(null, user);
        }

        user = await User.create({
            github_id: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails[0].value,
            role: 'student',
            is_active: true,
            is_email_verified: true,
            avatar_url: profile.photos[0]?.value
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Helper function to generate JWT
const generateToken = (user) => {
    return jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });
};

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=token_generation_failed');
        }
    }
);

// Facebook OAuth routes
router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=token_generation_failed');
        }
    }
);

// GitHub OAuth routes
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
        } catch (error) {
            res.redirect('/login?error=token_generation_failed');
        }
    }
);

// OAuth status endpoint
router.get('/oauth/status', (req, res) => {
    res.json({
        success: true,
        providers: {
            google: !!process.env.GOOGLE_CLIENT_ID,
            facebook: !!process.env.FACEBOOK_APP_ID,
            github: !!process.env.GITHUB_CLIENT_ID
        },
        message: 'OAuth providers configured'
    });
});

module.exports = router;