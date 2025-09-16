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
        allowNull: false, // Changed to false - reports should have a generator
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
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['report_type']
        },
        {
            fields: ['generated_by']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['status']
        }
    ]
});

// Instance methods
Report.prototype.markAsCompleted = async function (reportData, filePath = null, fileType = null, fileSize = null) {
    this.status = 'completed';
    this.report_data = reportData;
    if (filePath) this.file_path = filePath;
    if (fileType) this.file_type = fileType;
    if (fileSize) this.file_size = fileSize;
    return await this.save();
};

Report.prototype.markAsFailed = async function (error) {
    this.status = 'failed';
    this.summary = typeof error === 'string' ? error : error.message;
    return await this.save();
};

// Static methods
Report.getByType = async function (reportType, limit = 10) {
    return await this.findAll({
        where: { report_type: reportType },
        order: [['created_at', 'DESC']],
        limit
    });
};

Report.getRecentReports = async function (userId = null, limit = 10) {
    const whereClause = {};
    if (userId) whereClause.generated_by = userId;

    return await this.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit
    });
};

module.exports = Report;