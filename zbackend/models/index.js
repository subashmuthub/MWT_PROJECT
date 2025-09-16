// models/index.js - Define all model relationships
const { sequelize } = require('../config/database');
const Lab = require('./Lab');
const Equipment = require('./Equipment');
const User = require('./User');
const Booking = require('./Booking');
const Notification = require('./Notification');
const NotificationSettings = require('./NotificationSettings');
const Maintenance = require('./Maintenance');
const Report = require('./Report');
const ReportSchedule = require('./ReportSchedule');
const Order = require('./Order');

// ============= USER ASSOCIATIONS =============
// User - Notification associations
User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications'
});
Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User - NotificationSettings associations
User.hasOne(NotificationSettings, {
    foreignKey: 'user_id',
    as: 'notificationSettings'
});
NotificationSettings.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User - Lab associations
User.hasMany(Lab, {
    foreignKey: 'created_by',
    as: 'labs'
});
Lab.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// User - Equipment associations
User.hasMany(Equipment, {
    foreignKey: 'created_by',
    as: 'equipment'
});
Equipment.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ============= LAB ASSOCIATIONS =============
// Lab - Equipment associations
Lab.hasMany(Equipment, {
    foreignKey: 'lab_id',
    as: 'equipment'
});
Equipment.belongsTo(Lab, {
    foreignKey: 'lab_id',
    as: 'lab'
});

// Lab - Booking associations (NEW)
Lab.hasMany(Booking, {
    foreignKey: 'lab_id',
    as: 'bookings'
});
Booking.belongsTo(Lab, {
    foreignKey: 'lab_id',
    as: 'lab'
});

// ============= BOOKING ASSOCIATIONS =============
// User - Booking associations
User.hasMany(Booking, {
    foreignKey: 'user_id',
    as: 'bookings'
});
Booking.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Equipment - Booking associations
Equipment.hasMany(Booking, {
    foreignKey: 'equipment_id',
    as: 'bookings'
});
Booking.belongsTo(Equipment, {
    foreignKey: 'equipment_id',
    as: 'equipment'
});

// ============= EQUIPMENT ASSOCIATIONS =============
// Equipment - Maintenance associations
Equipment.hasMany(Maintenance, {
    foreignKey: 'equipment_id',
    as: 'maintenanceRecords'
});
Maintenance.belongsTo(Equipment, {
    foreignKey: 'equipment_id',
    as: 'equipment'
});

// ============= MAINTENANCE ASSOCIATIONS =============
// User - Maintenance associations (technician)
User.hasMany(Maintenance, {
    foreignKey: 'technician_id',
    as: 'assignedMaintenances'
});
Maintenance.belongsTo(User, {
    foreignKey: 'technician_id',
    as: 'technician'
});

// User - Maintenance associations (creator)
User.hasMany(Maintenance, {
    foreignKey: 'created_by',
    as: 'createdMaintenances'
});
Maintenance.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// User - Maintenance associations (approver)
User.hasMany(Maintenance, {
    foreignKey: 'approved_by',
    as: 'approvedMaintenances'
});
Maintenance.belongsTo(User, {
    foreignKey: 'approved_by',
    as: 'approver'
});

// ============= REPORT ASSOCIATIONS =============
// User - Report associations
User.hasMany(Report, {
    foreignKey: 'generated_by',
    as: 'generatedReports'
});

Report.belongsTo(User, {
    foreignKey: 'generated_by',
    as: 'generator'
});

// User - ReportSchedule associations
User.hasMany(ReportSchedule, {
    foreignKey: 'created_by',
    as: 'reportSchedules'
});

ReportSchedule.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ReportSchedule - Report associations
ReportSchedule.hasMany(Report, {
    foreignKey: 'schedule_id',
    as: 'reports'
});

Report.belongsTo(ReportSchedule, {
    foreignKey: 'schedule_id',
    as: 'schedule',
    required: false
});
Order.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ============= EXPORT ALL MODELS =============
module.exports = {
    sequelize,
    User,
    Lab,
    Equipment,
    Booking,
    Notification,
    NotificationSettings,
    Maintenance,
    Report,
    ReportSchedule,
    Order,
};