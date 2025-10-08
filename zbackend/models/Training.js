const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Training = sequelize.define('Training', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 2000]
        }
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
    required_for_equipment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    duration_hours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        validate: {
            min: 0.5,
            max: 40
        }
    },
    validity_months: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 60
        }
    },
    max_participants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 100
        }
    },
    instructor: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    materials: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    }
}, {
    tableName: 'training',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['equipment_id'] },
        { fields: ['created_by'] },
        { fields: ['is_active'] },
        { fields: ['required_for_equipment'] }
    ]
});

module.exports = Training;