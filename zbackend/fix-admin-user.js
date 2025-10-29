// Fix admin user credentials
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixAdminUser() {
    try {
        console.log('🔍 Checking admin user...');
        
        // Find existing user
        let adminUser = await User.findOne({
            where: { email: '2312401@nec.edu.in' }
        });

        if (adminUser) {
            console.log('📝 Admin user found, updating password...');
            
            // Hash the password properly
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('adminsm', saltRounds);
            
            // Update user with correct password
            await adminUser.update({
                password: hashedPassword,
                is_active: true,
                is_email_verified: true,
                role: 'admin'
            });
            
            console.log('✅ Admin user updated successfully');
        } else {
            console.log('👤 Creating new admin user...');
            
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('adminsm', saltRounds);
            
            // Create new admin user
            adminUser = await User.create({
                name: 'Admin User',
                email: '2312401@nec.edu.in',
                password: hashedPassword,
                role: 'admin',
                is_active: true,
                is_email_verified: true
            });
            
            console.log('✅ Admin user created successfully');
        }

        // Test password verification
        const isPasswordValid = await bcrypt.compare('adminsm', adminUser.password);
        console.log('🔐 Password verification test:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
        
        console.log('📋 Admin user details:');
        console.log('   Email:', adminUser.email);
        console.log('   Role:', adminUser.role);
        console.log('   Active:', adminUser.is_active);
        console.log('   Email Verified:', adminUser.is_email_verified);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAdminUser();