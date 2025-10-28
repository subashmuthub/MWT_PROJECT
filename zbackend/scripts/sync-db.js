const { sequelize } = require('../config/database');

(async () => {
  try {
    console.log('🔄 Running sequelize.sync({ alter: true }) to update database schema...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing database:', err);
    process.exit(1);
  }
})();