// server.js - Completely corrected version
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');
const models = require('./models/index');
const Lab = require('./models/Lab');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const authRoutes = require('./routes/auth');
const labRoutes = require('./routes/labs');
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const bookingRoutes = require('./routes/bookings');
const maintenanceRoutes = require('./routes/maintenance');
const reportsRoutes = require('./routes/reports');
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware FIRST - in correct order
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// IMPORTANT: Body parsing middleware MUST come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register routes AFTER middleware
app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/orders', require('./routes/orders'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Lab Management System API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                verify: 'GET /api/auth/verify',
                test: 'GET /api/auth/test'
            },
            labs: {
                getAll: 'GET /api/labs',
                getById: 'GET /api/labs/:id',
                create: 'POST /api/labs',
                update: 'PUT /api/labs/:id',
                delete: 'DELETE /api/labs/:id',
                stats: 'GET /api/labs/stats/dashboard',
                test: 'GET /api/labs/test/connection'
            },
            equipment: {
                getAll: 'GET /api/equipment',
                getById: 'GET /api/equipment/:id',
                create: 'POST /api/equipment',
                update: 'PUT /api/equipment/:id',
                delete: 'DELETE /api/equipment/:id',
                test: 'GET /api/equipment/test'
            },
            bookings: {
                getAll: 'GET /api/bookings',
                create: 'POST /api/bookings',
                cancel: 'DELETE /api/bookings/:id',
                test: 'GET /api/bookings/test'
            },
            maintenance: {
                getAll: 'GET /api/maintenance',
                create: 'POST /api/maintenance',
                update: 'PUT /api/maintenance/:id',
                delete: 'DELETE /api/maintenance/:id'
            },
            reports: {
                getAll: 'GET /api/reports',
                create: 'POST /api/reports',
                getById: 'GET /api/reports/:id'
            },
            users: {
                getAll: 'GET /api/users',
                getById: 'GET /api/users/:id',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id'
            },
            health: 'GET /api/health'
        }
    });
});


// Global error handler
app.use((error, req, res, next) => {
    console.error('💥 Global Error Handler:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: {
            auth: '/api/auth/*',
            labs: '/api/labs/*',
            equipment: '/api/equipment/*',
            bookings: '/api/bookings/*',
            maintenance: '/api/maintenance/*',
            reports: '/api/reports/*',
            users: '/api/users/*',
            health: '/api/health'
        }
    });
});

// Database connection and server startup
async function startServer() {
    try {
        console.log('🔌 Connecting to database...');

        // Test the database connection
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');

        // Sync database models (create tables if they don't exist)
        await sequelize.sync({
            force: false,
            alter: false
        });
        console.log('✅ Database models synchronized successfully.');

        // Check if tables exist and get counts
        try {
            const labCount = await Lab.count();
            console.log(`📊 Found ${labCount} labs in database`);
        } catch (err) {
            console.log('⚠️ Lab table may not exist yet');
        }

        try {
            const userCount = await User.count();
            console.log(`📊 Found ${userCount} users in database`);
        } catch (err) {
            console.log('⚠️ User table may not exist yet');
        }

        try {
            const equipmentCount = await Equipment.count();
            console.log(`📊 Found ${equipmentCount} equipment items in database`);
        } catch (err) {
            console.log('⚠️ Equipment table may not exist yet');
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
            console.log(`\n📋 Available endpoints:`);
            console.log(`   🔧 Health check: http://localhost:${PORT}/api/health`);
            console.log(`   🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
            console.log(`   🧪 Labs test: http://localhost:${PORT}/api/labs/test/connection`);
            console.log(`   🔧 Equipment test: http://localhost:${PORT}/api/equipment/test`);
            console.log(`   📅 Bookings test: http://localhost:${PORT}/api/bookings/test`);
        });

    } catch (error) {
        console.error('💥 Unable to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Graceful shutdown...');
    try {
        await sequelize.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('💥 Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
    try {
        await sequelize.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('💥 Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the server
startServer();