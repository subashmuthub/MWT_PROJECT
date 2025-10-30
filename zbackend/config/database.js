const { Sequelize } = require('sequelize');
require('dotenv').config();

// Auto-switch between local and production database connections
const isProduction = process.env.NODE_ENV === 'production';

// Determine which database host/port to use
const dbHost = isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_LOCAL;
const dbPort = isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_LOCAL;

// Log the connection mode on startup
console.log('═══════════════════════════════════════════════════════');
console.log('🗄️  DATABASE CONNECTION CONFIGURATION');
console.log('═══════════════════════════════════════════════════════');
console.log(`🌍 Mode: ${isProduction ? '🚀 PRODUCTION' : '💻 DEVELOPMENT (Local)'}`);
console.log(`📍 Host: ${dbHost}`);
console.log(`🔌 Port: ${dbPort}`);
console.log(`📦 Database: ${process.env.DB_NAME || 'lab_management'}`);
console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
console.log('═══════════════════════════════════════════════════════\n');

// Database configuration
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: dbHost,
    port: dbPort,
    database: process.env.DB_NAME || 'lab_management',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',

    // Connection pool settings
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,  // Increased to 60 seconds for Railway
        idle: 10000
    },

    // Dialect options for better Railway compatibility
    dialectOptions: {
        connectTimeout: 60000,  // 60 seconds connection timeout
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    },

    // Logging
    logging: process.env.NODE_ENV === 'production' ? false : console.log,

    // Other options
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
});

// Test the connection
const testConnection = async () => {
    try {
        const connectionMode = isProduction ? '🚀 PRODUCTION (Internal Railway)' : '💻 DEVELOPMENT (Public Railway)';
        console.log(`\n🔗 Testing database connection...`);
        console.log(`   Mode: ${connectionMode}`);
        console.log(`   Connecting to: ${sequelize.config.host}:${sequelize.config.port}\n`);
        
        await sequelize.authenticate();
        
        console.log('✅ SUCCESS! Database connection established.');
        console.log(`   Connected to: ${sequelize.config.database}`);
        console.log(`   Using host: ${sequelize.config.host}\n`);
        
        return true;
    } catch (error) {
        console.error('\n❌ FAILED! Unable to connect to the database.');
        console.error(`   Error: ${error.message}`);
        console.error(`   Host attempted: ${sequelize.config.host}:${sequelize.config.port}`);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if Railway MySQL public URL is correct in .env');
        console.error('   2. Verify DB_HOST_LOCAL and DB_PORT_LOCAL are set');
        console.error('   3. Make sure Railway MySQL service is running\n');
        return false;
    }
};

// Sync database (create tables)
const syncDatabase = async (force = false) => {
    try {
        if (force) {
            console.log('🔄 Force syncing database (this will drop existing tables)...');
        } else {
            console.log('🔄 Syncing database...');
        }

        await sequelize.sync({ force });
        console.log('✅ Database synced successfully.');
        return true;
    } catch (error) {
        console.error('❌ Error syncing database:', error.message);
        return false;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
};