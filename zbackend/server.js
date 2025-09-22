const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    console.log('✅ Health check endpoint hit');
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 5000
    });
});

// Load routes
// ADD THIS: Users routes
try {
    if (require.resolve('./routes/users')) {
        app.use('/api/users', require('./routes/users'));
        console.log('✅ Users routes loaded');
    }
} catch (e) {
    console.log('⚠️ Users routes not found');
}

try {
    if (require.resolve('./routes/maintenance')) {
        app.use('/api/maintenance', require('./routes/maintenance'));
        console.log('✅ Maintenance routes loaded');
    }
} catch (e) {
    console.log('⚠️ Maintenance routes not found');
}

try {
    if (require.resolve('./routes/auth')) {
        app.use('/api/auth', require('./routes/auth'));
        console.log('✅ Auth routes loaded');
    }
} catch (e) {
    console.log('⚠️ Auth routes not found');
}

try {
    if (require.resolve('./routes/labs')) {
        app.use('/api/labs', require('./routes/labs'));
        console.log('✅ Labs routes loaded');
    }
} catch (e) {
    console.log('⚠️ Labs routes not found');
}

try {
    if (require.resolve('./routes/equipment')) {
        app.use('/api/equipment', require('./routes/equipment'));
        console.log('✅ Equipment routes loaded');
    }
} catch (e) {
    console.log('⚠️ Equipment routes not found');
}

try {
    if (require.resolve('./routes/bookings')) {
        app.use('/api/bookings', require('./routes/bookings'));
        console.log('✅ Bookings routes loaded');
    }
} catch (e) {
    console.log('⚠️ Bookings routes not found');
}

try {
    if (require.resolve('./routes/reports')) {
        app.use('/api/reports', require('./routes/reports'));
        console.log('✅ Reports routes loaded');
    }
} catch (e) {
    console.log('⚠️ Reports routes not found');
}

try {
    if (require.resolve('./routes/orders')) {
        app.use('/api/orders', require('./routes/orders'));
        console.log('✅ Orders routes loaded');
    }
} catch (e) {
    console.log('⚠️ Orders routes not found');
}

// Database connection
try {
    const { sequelize } = require('./config/database');
    sequelize.authenticate()
        .then(() => console.log('✅ Database connected'))
        .catch(err => console.error('❌ Database connection failed:', err));
} catch (e) {
    console.log('⚠️ Database config not found');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
app.use('/api/chatbot', require('./routes/chatbot'));
// 404 handler
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   🔧 Health check: http://localhost:${PORT}/api/health`);
    console.log(`   👥 Users: http://localhost:${PORT}/api/users`); // ADD THIS LINE
    console.log(`   🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`   📊 Reports: http://localhost:${PORT}/api/reports`);
    console.log(`   📦 Orders: http://localhost:${PORT}/api/orders`);
});

module.exports = app;