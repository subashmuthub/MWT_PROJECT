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
            notEmpty: true,
            len: [2, 255]
        }
    },
    lab_type: {
        type: DataTypes.ENUM('cse', 'eee', 'ece', 'mech', 'aids', 'sh'),
        allowNull: false,
        defaultValue: 'cse'
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 500
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    square_feet: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    },
    lab_seats: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 500
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}, {
    tableName: 'labs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['lab_type'] },
        { fields: ['is_active'] },
        { fields: ['created_by'] },
        { fields: ['location'] }
    ]
});

module.exports = Lab;