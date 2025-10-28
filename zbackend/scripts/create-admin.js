const { User } = require('../models');

(async () => {
  try {
    console.log('🔄 Creating admin user...');
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ 
      where: { email: '2312401@nec.edu.in' } 
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user with plain password (will be hashed by User model)
    const adminUser = await User.create({
      name: 'Admin User',
      email: '2312401@nec.edu.in',
      password: 'adminsm', // This will be hashed by the User model's beforeCreate hook
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
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
})();