'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('equipment', 'stock_register_page', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Stock register page number for tracking purposes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('equipment', 'stock_register_page');
  }
};