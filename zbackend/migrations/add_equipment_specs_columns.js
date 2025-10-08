const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            console.log('🔧 Adding equipment specification columns...');

            // Computer specific fields
            await queryInterface.addColumn('equipment', 'processor', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'ram', {
                type: DataTypes.STRING(50),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'storage', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'graphics_card', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'operating_system', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            // Projector specific fields
            await queryInterface.addColumn('equipment', 'resolution', {
                type: DataTypes.STRING(50),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'brightness', {
                type: DataTypes.STRING(50),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'contrast_ratio', {
                type: DataTypes.STRING(50),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'lamp_hours', {
                type: DataTypes.INTEGER,
                allowNull: true
            });

            // Printer specific fields
            await queryInterface.addColumn('equipment', 'print_type', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'print_speed', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'paper_size', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'connectivity', {
                type: DataTypes.STRING(200),
                allowNull: true
            });

            // Microscope specific fields
            await queryInterface.addColumn('equipment', 'magnification', {
                type: DataTypes.STRING(50),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'objective_lenses', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'illumination', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            // Lab equipment specific fields
            await queryInterface.addColumn('equipment', 'capacity', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'power_rating', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'temperature_range', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'accuracy', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            // Network equipment specific fields
            await queryInterface.addColumn('equipment', 'ports', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'speed', {
                type: DataTypes.STRING(100),
                allowNull: true
            });

            await queryInterface.addColumn('equipment', 'protocol', {
                type: DataTypes.STRING(200),
                allowNull: true
            });

            console.log('✅ Equipment specification columns added successfully');

        } catch (error) {
            console.error('❌ Error adding equipment columns:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            console.log('🗑️ Removing equipment specification columns...');

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

            console.log('✅ Equipment specification columns removed successfully');

        } catch (error) {
            console.error('❌ Error removing equipment columns:', error);
            throw error;
        }
    }
};