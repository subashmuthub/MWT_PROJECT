// migrations/create-orders-table.js
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            supplier: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            equipment_name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Approved', 'Ordered', 'Delivered', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            priority: {
                type: Sequelize.ENUM('Low', 'Medium', 'High'),
                allowNull: false,
                defaultValue: 'Medium'
            },
            order_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            expected_delivery: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            actual_delivery: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orders');
    }
};