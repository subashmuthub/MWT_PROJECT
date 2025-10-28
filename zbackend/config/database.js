const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'lab_management',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',

    // Connection pool settings
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
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
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
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