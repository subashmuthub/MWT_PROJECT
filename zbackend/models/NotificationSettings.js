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
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    email_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    push_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    booking_reminders: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    system_alerts: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'notification_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['user_id'] }
    ]
});

module.exports = NotificationSettings;