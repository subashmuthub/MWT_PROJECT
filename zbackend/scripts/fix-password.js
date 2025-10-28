const { User } = require('../models');

(async () => {
  try {
    console.log('🔄 Updating admin user password with proper hash...');
    
    // Find the admin user
    const adminUser = await User.findOne({ 
      where: { email: '2312401@nec.edu.in' } 
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    // Update the password (this will trigger the beforeUpdate hook to hash it)
    await adminUser.update({ password: 'adminsm' });
    
    console.log('✅ Admin user password updated and hashed successfully');
    console.log('🎯 You can now login with:');
    console.log('   Email: 2312401@nec.edu.in');
    console.log('   Password: adminsm');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating password:', err.message);
    process.exit(1);
  }
})();