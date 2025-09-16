const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportSchedule = sequelize.define('ReportSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    report_type: {
        type: DataTypes.ENUM('usage', 'availability', 'maintenance', 'user', 'financial'),
        allowNull: false
    },
    frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.INTEGER, // 0-6, Sunday to Saturday
        allowNull: true,
        validate: {
            min: 0,
            max: 6
        }
    },
    day_of_month: {
        type: DataTypes.INTEGER, // 1-31
        allowNull: true,
        validate: {
            min: 1,
            max: 31
        }
    },
    time: {
        type: DataTypes.TIME,
        defaultValue: '09:00:00'
    },
    email_recipients: {
        type: DataTypes.JSON,
        allowNull: true
    },
    auto_export: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    export_format: {
        type: DataTypes.ENUM('pdf', 'excel', 'csv'),
        defaultValue: 'pdf'
    },
    filters: {
        type: DataTypes.JSON,
        allowNull: true // Store report filters/parameters
    },
    last_run: {
        type: DataTypes.DATE,
        allowNull: true
    },
    next_run: {
        type: DataTypes.DATE,
        allowNull: true // Allow null initially, will be calculated
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false, // Changed to false - schedules should have a creator
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'report_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (schedule) => {
            if (!schedule.next_run) {
                schedule.next_run = schedule.calculateNextRun();
            }
        },
        beforeUpdate: async (schedule) => {
            if (schedule.changed('frequency') || schedule.changed('time') ||
                schedule.changed('day_of_week') || schedule.changed('day_of_month')) {
                schedule.next_run = schedule.calculateNextRun();
            }
        }
    }
});

// Instance methods
ReportSchedule.prototype.calculateNextRun = function () {
    const now = new Date();
    const nextRun = new Date();

    switch (this.frequency) {
        case 'daily':
            nextRun.setDate(now.getDate() + 1);
            break;
        case 'weekly':
            const daysUntilNext = (7 - now.getDay() + (this.day_of_week || 0)) % 7;
            nextRun.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
            break;
        case 'monthly':
            nextRun.setMonth(now.getMonth() + 1);
            nextRun.setDate(this.day_of_month || 1);
            break;
        case 'quarterly':
            nextRun.setMonth(now.getMonth() + 3);
            nextRun.setDate(this.day_of_month || 1);
            break;
        case 'yearly':
            nextRun.setFullYear(now.getFullYear() + 1);
            nextRun.setMonth(0);
            nextRun.setDate(this.day_of_month || 1);
            break;
    }

    // Set time
    if (this.time) {
        const [hours, minutes, seconds] = this.time.split(':');
        nextRun.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0), 0);
    }

    return nextRun;
};

ReportSchedule.prototype.updateNextRun = async function () {
    this.last_run = new Date();
    this.next_run = this.calculateNextRun();
    return await this.save();
};

ReportSchedule.prototype.activate = async function () {
    this.is_active = true;
    this.next_run = this.calculateNextRun();
    return await this.save();
};

ReportSchedule.prototype.deactivate = async function () {
    this.is_active = false;
    return await this.save();
};

// Static methods
ReportSchedule.getDueSchedules = async function () {
    const now = new Date();
    return await this.findAll({
        where: {
            is_active: true,
            next_run: {
                [sequelize.Sequelize.Op.lte]: now
            }
        }
    });
};

ReportSchedule.getActiveSchedules = async function () {
    return await this.findAll({
        where: { is_active: true },
        order: [['next_run', 'ASC']]
    });
};

module.exports = ReportSchedule;