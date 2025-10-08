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
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
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
        allowNull: true,
        comment: 'File size in bytes'
    },
    status: {
        type: DataTypes.ENUM('generating', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'generating'
    },
    generated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    is_scheduled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'report_schedules',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}, {
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        dateRangeValid() {
            if (new Date(this.date_range_end) < new Date(this.date_range_start)) {
                throw new Error('End date must be after or equal to start date');
            }
        }
    },
    indexes: [
        { fields: ['report_type'] },
        { fields: ['status'] },
        { fields: ['generated_by'] },
        { fields: ['schedule_id'] },
        { fields: ['is_scheduled'] },
        { fields: ['date_range_start', 'date_range_end'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Report;