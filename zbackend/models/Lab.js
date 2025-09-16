const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lab = sequelize.define('Lab', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lab_type: {
        type: DataTypes.ENUM('computer_lab', 'chemistry_lab', 'physics_lab', 'biology_lab', 'workshop', 'research_lab'),
        allowNull: false,
        defaultValue: 'computer_lab'
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'labs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Lab;