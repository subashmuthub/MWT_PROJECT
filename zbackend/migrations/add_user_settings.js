// migrations/add_user_settings.js - Add settings fields to users table
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add general settings columns
      await queryInterface.addColumn('users', 'language', {
        type: Sequelize.STRING(10),
        defaultValue: 'en',
        allowNull: true
      });

      await queryInterface.addColumn('users', 'timezone', {
        type: Sequelize.STRING(50),
        defaultValue: 'UTC',
        allowNull: true
      });

      await queryInterface.addColumn('users', 'theme', {
        type: Sequelize.STRING(20),
        defaultValue: 'light',
        allowNull: true
      });

      // Add privacy settings columns
      await queryInterface.addColumn('users', 'profile_visibility', {
        type: Sequelize.STRING(20),
        defaultValue: 'public',
        allowNull: true
      });

      await queryInterface.addColumn('users', 'show_email', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'show_phone', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      // Add notification settings columns
      await queryInterface.addColumn('users', 'email_notifications', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'push_notifications', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'sms_notifications', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      // Add email preference columns
      await queryInterface.addColumn('users', 'booking_confirmations', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'booking_reminders', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'booking_cancellations', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'maintenance_alerts', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'equipment_updates', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'system_updates', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'marketing_emails', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'newsletter', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });

      // Add advanced settings columns
      await queryInterface.addColumn('users', 'auto_logout', {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'session_timeout', {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'two_factor_enabled', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'backup_codes_generated', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'backup_codes', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.addColumn('users', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });

      console.log('✅ User settings columns added successfully');
    } catch (error) {
      console.error('💥 Error adding user settings columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const columns = [
        'language', 'timezone', 'theme',
        'profile_visibility', 'show_email', 'show_phone',
        'email_notifications', 'push_notifications', 'sms_notifications',
        'booking_confirmations', 'booking_reminders', 'booking_cancellations',
        'maintenance_alerts', 'equipment_updates', 'system_updates',
        'marketing_emails', 'newsletter',
        'auto_logout', 'session_timeout', 'two_factor_enabled',
        'backup_codes_generated', 'backup_codes', 'deleted_at'
      ];

      for (const column of columns) {
        await queryInterface.removeColumn('users', column);
      }

      console.log('✅ User settings columns removed successfully');
    } catch (error) {
      console.error('💥 Error removing user settings columns:', error);
      throw error;
    }
  }
};