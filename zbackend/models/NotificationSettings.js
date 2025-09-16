const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationSettings = sequelize.define('NotificationSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    emailNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    pushNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    bookingReminders: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    systemAlerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = NotificationSettings;