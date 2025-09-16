const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    booking_type: {
        type: DataTypes.ENUM('lab', 'equipment'),
        allowNull: false,
        defaultValue: 'equipment'
    },
    lab_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for equipment-only bookings
        references: {
            model: 'labs',
            key: 'id'
        }
    },
    equipment_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Make nullable for lab-only bookings
        references: {
            model: 'Equipment',
            key: 'id'
        }
    },
    booking_date: {
        type: DataTypes.DATEONLY, // Changed from DATE to DATEONLY
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending'
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Booking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Booking;