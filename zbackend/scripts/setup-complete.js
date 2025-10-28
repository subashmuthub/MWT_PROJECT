const { sequelize, User } = require('../models');

(async () => {
  try {
    console.log('🔄 Force syncing database and creating admin user...');
    
    // Force sync all models to create tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: '2312401@nec.edu.in',
      password: 'adminsm', // This will be hashed by the User model
      role: 'admin',
      student_id: '2312401',
      department: 'Computer Science',
      phone: '9876543210',
      bio: 'System Administrator',
      position: 'Admin',
      is_active: true,
      is_email_verified: true
    });
    
    console.log('✅ Admin user created successfully:', adminUser.email);
    console.log('🎯 You can now login with:');
    console.log('   Email: 2312401@nec.edu.in');
    console.log('   Password: adminsm');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();