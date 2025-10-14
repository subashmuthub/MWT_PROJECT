// Migration to add profile fields to users table
const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Add bio column if it doesn't exist
            const tableDescription = await queryInterface.describeTable('users');
            
            if (!tableDescription.bio) {
                await queryInterface.addColumn('users', 'bio', {
                    type: DataTypes.TEXT,
                    allowNull: true
                });
                console.log('✅ Added bio column to users table');
            }

            if (!tableDescription.position) {
                await queryInterface.addColumn('users', 'position', {
                    type: DataTypes.STRING(100),
                    allowNull: true
                });
                console.log('✅ Added position column to users table');
            }

            console.log('✅ Profile fields migration completed successfully');
        } catch (error) {
            console.error('💥 Error in profile fields migration:', error);
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('users', 'bio');
            await queryInterface.removeColumn('users', 'position');
            console.log('✅ Removed profile fields from users table');
        } catch (error) {
            console.error('💥 Error removing profile fields:', error);
            throw error;
        }
    }
};