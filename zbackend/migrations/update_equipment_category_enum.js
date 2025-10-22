'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the category ENUM to include 'network_equipment'
    await queryInterface.sequelize.query(`
      ALTER TABLE equipment 
      MODIFY COLUMN category ENUM(
        'computer', 'printer', 'projector', 'scanner', 'microscope',
        'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
        'incubator', 'autoclave', 'pipette', 'thermometer',
        'glassware', 'safety_equipment', 'lab_equipment', 'network', 'network_equipment', 'other'
      ) NOT NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE equipment 
      MODIFY COLUMN category ENUM(
        'computer', 'printer', 'projector', 'scanner', 'microscope',
        'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
        'incubator', 'autoclave', 'pipette', 'thermometer',
        'glassware', 'safety_equipment', 'lab_equipment', 'network', 'other'
      ) NOT NULL
    `);
  }
};