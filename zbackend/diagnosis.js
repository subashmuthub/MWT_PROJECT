// ========================================
// DIAGNOSIS SCRIPT - Save as: diagnosis.js in lab-management-backend
// Run with: node diagnosis.js
// COPY THIS ENTIRE CODE TO A NEW FILE CALLED diagnosis.js
// ========================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSIS REPORT');
console.log('==================');

// Check 1: .env file exists
console.log('\n1. 📁 Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file found at:', envPath);

    // Read .env file content
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env file content preview:');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && key.includes('PASSWORD')) {
            console.log(`   ${key}=***HIDDEN***`);
        } else {
            console.log(`   ${line}`);
        }
    });
} else {
    console.log('❌ .env file NOT FOUND!');
    console.log('📝 Please create .env file in:', __dirname);
}

// Check 2: Environment variables
console.log('\n2. 🌍 Environment Variables:');
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'PORT'];
let allVarsSet = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        if (varName.includes('PASSWORD')) {
            console.log(`✅ ${varName}: ***SET***`);
        } else {
            console.log(`✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`❌ ${varName}: UNDEFINED`);
        allVarsSet = false;
    }
});

// Check 3: Package.json dependencies
console.log('\n3. 📦 Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['mysql2', 'sequelize', 'dotenv', 'express'];

    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep}: NOT INSTALLED`);
        }
    });
} catch (error) {
    console.log('❌ Could not read package.json');
}

// Check 4: Database connection test
console.log('\n4. 🗄️  Testing database connection...');
if (allVarsSet) {
    const mysql = require('mysql2/promise');

    (async () => {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            });

            console.log('✅ MySQL connection successful!');

            // Check if database exists
            const [databases] = await connection.execute('SHOW DATABASES');
            const dbExists = databases.some(db => db.Database === process.env.DB_NAME);

            if (dbExists) {
                console.log(`✅ Database '${process.env.DB_NAME}' exists`);
            } else {
                console.log(`⚠️  Database '${process.env.DB_NAME}' does not exist`);
                console.log('   Creating database...');
                await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
                console.log('✅ Database created successfully!');
            }

            await connection.end();

        } catch (error) {
            console.log('❌ Database connection failed:');
            console.log('   Error:', error.message);
            console.log('   Code:', error.code);

            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                console.log('💡 Fix: Check your MySQL username and password');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('💡 Fix: Make sure MySQL server is running');
            }
        }
    })();
} else {
    console.log('⏭️  Skipping database test - environment variables missing');
}

console.log('\n==================');
console.log('🎯 NEXT STEPS:');
console.log('1. Fix any issues shown above');
console.log('2. Run: npm run dev');
console.log('3. If still having issues, share this diagnosis report');
console.log('==================');