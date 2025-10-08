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
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    serial_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
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
            'glassware', 'safety_equipment', 'lab_equipment', 'network', 'other'
        ),
        allowNull: false
    },
    lab_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'labs',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    location_details: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'broken', 'retired'),
        allowNull: false,
        defaultValue: 'available'
    },
    condition_status: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
        allowNull: false,
        defaultValue: 'good'
    },
    purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    current_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
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
    },
    // ✅ ADDED: Category-specific fields
    processor: DataTypes.STRING(100),
    ram: DataTypes.STRING(50),
    storage: DataTypes.STRING(100),
    graphics_card: DataTypes.STRING(100),
    operating_system: DataTypes.STRING(100),
    resolution: DataTypes.STRING(50),
    brightness: DataTypes.STRING(50),
    contrast_ratio: DataTypes.STRING(50),
    lamp_hours: DataTypes.INTEGER,
    print_type: DataTypes.STRING(100),
    print_speed: DataTypes.STRING(100),
    paper_size: DataTypes.STRING(100),
    connectivity: DataTypes.STRING(200),
    magnification: DataTypes.STRING(50),
    objective_lenses: DataTypes.STRING(100),
    illumination: DataTypes.STRING(100),
    capacity: DataTypes.STRING(100),
    power_rating: DataTypes.STRING(100),
    temperature_range: DataTypes.STRING(100),
    accuracy: DataTypes.STRING(100),
    ports: DataTypes.STRING(100),
    speed: DataTypes.STRING(100),
    protocol: DataTypes.STRING(200)
}, {
    tableName: 'equipment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        warrantyAfterPurchase() {
            if (this.warranty_expiry && this.purchase_date) {
                if (new Date(this.warranty_expiry) < new Date(this.purchase_date)) {
                    throw new Error('Warranty expiry cannot be before purchase date');
                }
            }
        }
    },
    indexes: [
        { fields: ['lab_id'] },
        { fields: ['status'] },
        { fields: ['category'] },
        { fields: ['created_by'] },
        { unique: true, fields: ['serial_number'] },
        { fields: ['is_active'] },
        { fields: ['condition_status'] }
    ]
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