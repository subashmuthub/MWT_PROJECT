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
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    booking_type: {
        type: DataTypes.ENUM('lab', 'equipment'),
        allowNull: false,
        defaultValue: 'equipment'
    },
    lab_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'labs',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    equipment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'equipment',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Full datetime for booking start'
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Full datetime for booking end'
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        // ✅ FIXED: Better validation
        bookingTypeRequirements() {
            if (this.booking_type === 'lab' && !this.lab_id) {
                throw new Error('Lab booking requires lab_id');
            }
            if (this.booking_type === 'equipment') {
                if (!this.equipment_id) {
                    throw new Error('Equipment booking requires equipment_id');
                }
                if (!this.lab_id) {
                    throw new Error('Equipment booking requires lab_id');
                }
            }
        },
        endTimeAfterStartTime() {
            if (this.end_time && this.start_time && this.end_time <= this.start_time) {
                throw new Error('End time must be after start time');
            }
        }
    },
    indexes: [
        { fields: ['user_id'] },
        { fields: ['lab_id'] },
        { fields: ['equipment_id'] },
        { fields: ['start_time'] },
        { fields: ['end_time'] },
        { fields: ['status'] },
        { fields: ['booking_type'] }
    ]
});

module.exports = Booking;