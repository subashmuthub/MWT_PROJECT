const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    serial_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    manufacturer: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM(
            'computer', 'printer', 'projector', 'scanner', 'microscope',
            'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
            'incubator', 'autoclave', 'pipette', 'thermometer',
            'glassware', 'safety_equipment', 'other'
        ),
        allowNull: false
    },
    lab_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'labs',
            key: 'id'
        }
    },
    location_details: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'broken', 'retired'),
        allowNull: true,
        defaultValue: 'available'
    },
    condition_status: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
        allowNull: true,
        defaultValue: 'good'
    },
    purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    current_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    warranty_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'equipment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance methods
Equipment.prototype.markAsInUse = async function () {
    this.status = 'in_use';
    return await this.save();
};

Equipment.prototype.markAsAvailable = async function () {
    this.status = 'available';
    return await this.save();
};

Equipment.prototype.markForMaintenance = async function () {
    this.status = 'maintenance';
    return await this.save();
};

module.exports = Equipment;