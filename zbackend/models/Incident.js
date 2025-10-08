const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
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
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open'
    },
    category: {
        type: DataTypes.ENUM('malfunction', 'damage', 'safety', 'maintenance', 'other'),
        allowNull: false,
        defaultValue: 'malfunction'
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    reported_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    resolution_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolved_by: {
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
    tableName: 'incidents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['equipment_id'] },
        { fields: ['reported_by'] },
        { fields: ['assigned_to'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['category'] },
        { fields: ['resolved_by'] },
        { fields: ['created_at'] }
    ]
});

// Static methods
Incident.getStats = async function () {
    try {
        const stats = await this.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'open' THEN 1 ELSE 0 END")), 'open'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END")), 'in_progress'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'resolved' THEN 1 ELSE 0 END")), 'resolved'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'closed' THEN 1 ELSE 0 END")), 'closed'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN priority = 'low' THEN 1 ELSE 0 END")), 'low_priority'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN priority = 'medium' THEN 1 ELSE 0 END")), 'medium_priority'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN priority = 'high' THEN 1 ELSE 0 END")), 'high_priority'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN priority = 'critical' THEN 1 ELSE 0 END")), 'critical_priority']
            ],
            raw: true
        });

        return stats[0] || {
            total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0,
            low_priority: 0, medium_priority: 0, high_priority: 0, critical_priority: 0
        };
    } catch (error) {
        console.error('Error getting incident stats:', error);
        return {
            total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0,
            low_priority: 0, medium_priority: 0, high_priority: 0, critical_priority: 0
        };
    }
};

module.exports = Incident;