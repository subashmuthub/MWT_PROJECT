'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('equipment', 'processor', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'ram', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'storage', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'graphics_card', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'operating_system', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'resolution', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'brightness', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'contrast_ratio', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'lamp_hours', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'print_type', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'print_speed', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'paper_size', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'connectivity', {
            type: Sequelize.STRING(200),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'magnification', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'objective_lenses', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'illumination', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'capacity', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'power_rating', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'temperature_range', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'accuracy', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'ports', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'speed', {
            type: Sequelize.STRING(100),
            allowNull: true
        });
        await queryInterface.addColumn('equipment', 'protocol', {
            type: Sequelize.STRING(200),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        const columns = [
            'processor', 'ram', 'storage', 'graphics_card', 'operating_system',
            'resolution', 'brightness', 'contrast_ratio', 'lamp_hours',
            'print_type', 'print_speed', 'paper_size', 'connectivity',
            'magnification', 'objective_lenses', 'illumination',
            'capacity', 'power_rating', 'temperature_range', 'accuracy',
            'ports', 'speed', 'protocol'
        ];

        for (const column of columns) {
            await queryInterface.removeColumn('equipment', column);
        }
    }
};