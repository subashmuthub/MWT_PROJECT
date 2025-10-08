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
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
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
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 6
        },
        comment: '0=Sunday, 6=Saturday'
    },
    day_of_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 31
        }
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '09:00:00'
    },
    email_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of email addresses'
    },
    auto_export: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    export_format: {
        type: DataTypes.ENUM('pdf', 'excel', 'csv'),
        allowNull: false,
        defaultValue: 'pdf'
    },
    filters: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Report-specific filters'
    },
    last_run: {
        type: DataTypes.DATE,
        allowNull: true
    },
    next_run: {
        type: DataTypes.DATE,
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
    tableName: 'report_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['report_type'] },
        { fields: ['frequency'] },
        { fields: ['is_active'] },
        { fields: ['created_by'] },
        { fields: ['next_run'] },
        { fields: ['last_run'] }
    ]
});

module.exports = ReportSchedule;