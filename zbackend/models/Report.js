const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    report_type: {
        type: DataTypes.ENUM('usage', 'availability', 'maintenance', 'user', 'financial'),
        allowNull: false
    },
    date_range_start: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    date_range_end: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    report_data: {
        type: DataTypes.JSON,
        allowNull: false
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    file_type: {
        type: DataTypes.ENUM('pdf', 'excel', 'csv'),
        allowNull: true
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('generating', 'completed', 'failed'),
        defaultValue: 'generating'
    },
    generated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    is_scheduled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'report_schedules',
            key: 'id'
        }
    }
}, {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Report;