const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CRITICAL: Load models and associations BEFORE routes
console.log('📦 Loading models and associations...');
require('./models'); // This executes models/index.js and sets up all associations
console.log('✅ Models and associations loaded');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const { router: recentlyAccessedRoutes } = require('./routes/recentlyAccessed');
const usersRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const labsRoutes = require('./routes/labs');
const bookingsRoutes = require('./routes/bookings');
const maintenanceRoutes = require('./routes/maintenance');
const reportRoutes = require('./routes/reports');
const chatbotRoutes = require('./routes/chatbot');
const notificationRoutes = require('./routes/notification');
const ordersRoutes = require('./routes/orders');
const incidentsRoutes = require('./routes/incidents');
const trainingRoutes = require('./routes/training');
const activitiesRoutes = require('./routes/activities');

// Define routes configuration
const routes = [
    { name: 'Auth', path: '/api/auth', file: './routes/auth' },
    { name: 'OAuth', path: '/api/auth', file: './routes/oauth' },  
    { name: 'Recent', path: '/api/recent', file: './routes/recentlyAccessed', isModule: true },
    { name: 'Users', path: '/api/users', file: './routes/users' },
    { name: 'Equipment', path: '/api/equipment', file: './routes/equipment' },
    { name: 'Labs', path: '/api/labs', file: './routes/labs' },
    { name: 'Bookings', path: '/api/bookings', file: './routes/bookings' },
    { name: 'Maintenance', path: '/api/maintenance', file: './routes/maintenance' },
    { name: 'Reports', path: '/api/reports', file: './routes/reports' },
    { name: 'Chatbot', path: '/api/chatbot', file: './routes/chatbot' },
    { name: 'Notifications', path: '/api/notifications', file: './routes/notification' },
    { name: 'Orders', path: '/api/orders', file: './routes/orders' },
    { name: 'Incidents', path: '/api/incidents', file: './routes/incidents' },
    { name: 'Training', path: '/api/training', file: './routes/training' },
    { name: 'Activities', path: '/api/activities', file: './routes/activities' }
];

// Load routes
routes.forEach(route => {
    try {
        let router;
        if (route.isModule) {
            // Handle modules that export { router }
            const moduleExports = require(route.file);
            router = moduleExports.router;
        } else {
            // Handle modules that export router directly
            router = require(route.file);
        }
        
        app.use(route.path, router);
        console.log(`✅ ${route.name} routes loaded`);
    } catch (err) {
        console.log(`⚠️ ${route.name} routes not found:`, err.message);
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'Connected'
    });
});

// ✅ NEW: Test associations endpoint
app.get('/api/test/associations', (req, res) => {
    try {
        const { Equipment, Booking, Lab, User } = require('./models');
        
        res.json({
            success: true,
            message: 'Model associations are loaded',
            associations: {
                Equipment: Object.keys(Equipment.associations),
                Booking: Object.keys(Booking.associations),
                Lab: Object.keys(Lab.associations),
                User: Object.keys(User.associations)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading associations',
            error: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'Lab Management System API',
        version: '1.0.0',
        status: 'Active',
        endpoints: {
            health: '/api/health',
            test: '/api/test',
            testAssociations: '/api/test/associations', // ✅ NEW
            auth: '/api/auth',
            users: '/api/users',
            labs: '/api/labs',
            equipment: '/api/equipment',
            bookings: '/api/bookings',
            maintenance: '/api/maintenance',
            incidents: '/api/incidents',
            orders: '/api/orders',
            reports: '/api/reports',
            notifications: '/api/notifications',
            training: '/api/training',
            chatbot: '/api/chatbot',
            activities: '/api/activities',
            system: '/api/system'
        },
        documentation: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                verify: 'GET /api/auth/verify'
            },
            users: {
                getAll: 'GET /api/users',
                stats: 'GET /api/users/stats',
                profile: 'GET /api/users/profile'
            },
            equipment: {
                getAll: 'GET /api/equipment',
                stats: 'GET /api/equipment/stats',
                create: 'POST /api/equipment'
            },
            bookings: {
                getAll: 'GET /api/bookings',
                stats: 'GET /api/bookings/stats',
                upcoming: 'GET /api/bookings/upcoming'
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: routes.map(r => r.path)
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/`);

    console.log('\n📋 Available endpoints:');
    routes.forEach(route => {
        console.log(`   ${getRouteIcon(route.name)} ${route.name}: http://localhost:${PORT}${route.path}`);
    });

    // Test database connection
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // ✅ Optional: Sync models (use cautiously in production)
        // await sequelize.sync({ alter: false });
        // console.log('✅ Database models synchronized');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
});

// Helper function for route icons
function getRouteIcon(name) {
    const icons = {
        'Auth': '🔐',
        'Users': '👥',
        'Labs': '🏢',
        'Equipment': '🔧',
        'Bookings': '📅',
        'Maintenance': '🛠️',
        'Incidents': '⚠️',
        'Orders': '📦',
        'Reports': '📊',
        'Notifications': '🔔',
        'Training': '📚',
        'Chatbot': '🤖'
    };
    return icons[name] || '📌';
}

module.exports = app;