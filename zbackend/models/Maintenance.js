const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Maintenance = sequelize.define('Maintenance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    equipment_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    maintenance_type: {
        type: DataTypes.ENUM('routine', 'repair', 'emergency', 'preventive'),
        allowNull: false,
        defaultValue: 'routine'
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    actual_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'),
        allowNull: false,
        defaultValue: 'scheduled'
    },
    technician_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Unassigned'
    },
    technician_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    estimated_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    actual_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    work_performed: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimated_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duration in minutes'
    },
    actual_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duration in minutes'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium'
    },
    parts_used: {
        type: DataTypes.JSON,
        allowNull: true
    },
    tools_required: {
        type: DataTypes.JSON,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    next_maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    maintenance_category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    warranty_applicable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    vendor_contact: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    approval_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    tableName: 'maintenance_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        actualDateNotTooEarly() {
            if (this.actual_date && this.scheduled_date) {
                const scheduledTime = new Date(this.scheduled_date).getTime();
                const actualTime = new Date(this.actual_date).getTime();
                const daysBefore = (scheduledTime - actualTime) / (1000 * 60 * 60 * 24);
                
                if (daysBefore > 7) {
                    throw new Error('Actual date cannot be more than 7 days before scheduled date');
                }
            }
        }
    },
    indexes: [
        { fields: ['equipment_id'] },
        { fields: ['status'] },
        { fields: ['scheduled_date'] },
        { fields: ['technician_id'] },
        { fields: ['priority'] },
        { fields: ['maintenance_type'] },
        { fields: ['approval_status'] },
        { fields: ['created_by'] }
    ]
});

// Instance methods
Maintenance.prototype.markAsStarted = async function () {
    this.status = 'in_progress';
    this.started_at = new Date();
    return await this.save();
};

Maintenance.prototype.markAsCompleted = async function (workPerformed, actualCost, actualDuration) {
    this.status = 'completed';
    this.completed_at = new Date();
    this.actual_date = new Date();
    if (workPerformed) this.work_performed = workPerformed;
    if (actualCost) this.actual_cost = actualCost;
    if (actualDuration) this.actual_duration = actualDuration;
    return await this.save();
};

Maintenance.prototype.calculateDuration = function () {
    if (this.started_at && this.completed_at) {
        return Math.round((this.completed_at - this.started_at) / (1000 * 60));
    }
    return null;
};

// Static methods
Maintenance.getUpcoming = async function (days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.findAll({
        where: {
            scheduled_date: {
                [Op.between]: [new Date(), endDate]
            },
            status: ['scheduled', 'in_progress']
        },
        order: [['scheduled_date', 'ASC']]
    });
};

Maintenance.getOverdue = async function () {
    return await this.findAll({
        where: {
            scheduled_date: {
                [Op.lt]: new Date()
            },
            status: ['scheduled', 'in_progress']
        }
    });
};

Maintenance.getStats = async function () {
    const stats = await this.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
            [sequelize.fn('SUM', sequelize.col('estimated_cost')), 'total_estimated_cost'],
            [sequelize.fn('SUM', sequelize.col('actual_cost')), 'total_actual_cost']
        ],
        group: ['status']
    });

    const totalCost = await this.sum('estimated_cost') || 0;
    const completedCost = await this.sum('actual_cost', {
        where: { status: 'completed' }
    }) || 0;

    return {
        byStatus: stats.reduce((acc, stat) => {
            acc[stat.status] = {
                count: parseInt(stat.dataValues.count),
                estimated_cost: parseFloat(stat.dataValues.total_estimated_cost || 0),
                actual_cost: parseFloat(stat.dataValues.total_actual_cost || 0)
            };
            return acc;
        }, {}),
        totalEstimatedCost: parseFloat(totalCost).toFixed(2),
        totalActualCost: parseFloat(completedCost).toFixed(2)
    };
};

module.exports = Maintenance;