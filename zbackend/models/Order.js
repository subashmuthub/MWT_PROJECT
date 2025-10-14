const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    supplier: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    equipment_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10000
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Ordered', 'Delivered', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium'
    },
    order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expected_delivery: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    actual_delivery: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        expectedDeliveryAfterOrder() {
            if (this.expected_delivery && this.order_date) {
                if (new Date(this.expected_delivery) < new Date(this.order_date)) {
                    throw new Error('Expected delivery cannot be before order date');
                }
            }
        },
        actualDeliveryAfterOrder() {
            if (this.actual_delivery && this.order_date) {
                if (new Date(this.actual_delivery) < new Date(this.order_date)) {
                    throw new Error('Actual delivery cannot be before order date');
                }
            }
        },
        totalAmountMatches() {
            const calculatedTotal = this.quantity * parseFloat(this.unit_price);
            const totalAmount = parseFloat(this.total_amount);
            if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
                throw new Error('Total amount must equal quantity × unit price');
            }
        }
    },
    indexes: [
        { fields: ['created_by'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['order_date'] },
        { fields: ['expected_delivery'] },
        { fields: ['supplier'] }
    ]
});

module.exports = Order;