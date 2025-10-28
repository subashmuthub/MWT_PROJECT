const mysql = require('mysql2/promise');

const localConfig = {
  host: 'localhost',
  user: 'root',
  password: 'MS@muthu130405',
  database: 'lab_management'
};

const dockerConfig = {
  host: 'localhost',
  port: 3307,
  user: 'labms_user',
  password: 'labms_password_secure_2024',
  database: 'labms_db'
};

const transferTable = async (localConn, dockerConn, tableName, skipConflicts = false) => {
  try {
    console.log(`🔄 Transferring ${tableName} data...`);
    const [rows] = await localConn.execute(`SELECT * FROM ${tableName}`);
    
    if (rows.length > 0) {
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(',');
      let insertQuery = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
      
      if (skipConflicts) {
        insertQuery = `INSERT IGNORE INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
      }
      
      let transferred = 0;
      for (const row of rows) {
        try {
          const values = columns.map(col => row[col]);
          await dockerConn.execute(insertQuery, values);
          transferred++;
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY' && skipConflicts) {
            console.log(`⚠️ Skipping duplicate entry in ${tableName}`);
            continue;
          }
          throw error;
        }
      }
      console.log(`✅ Transferred ${transferred}/${rows.length} ${tableName} records`);
    } else {
      console.log(`ℹ️ No data found in ${tableName}`);
    }
  } catch (error) {
    console.error(`❌ Error transferring ${tableName}:`, error.message);
  }
};

(async () => {
  let localConn, dockerConn;
  
  try {
    console.log('🔄 Connecting to local MySQL...');
    localConn = await mysql.createConnection(localConfig);
    
    console.log('🔄 Connecting to Docker MySQL...');
    dockerConn = await mysql.createConnection(dockerConfig);
    
    // Disable foreign key checks temporarily
    await dockerConn.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Define transfer order (dependencies first)
    const tables = [
      'labs',
      'equipment', 
      'bookings',
      'maintenance_records',
      'incidents',
      'orders',
      'notifications',
      'notification_settings',
      'reports',
      'report_schedules',
      'training',
      'training_certifications',
      'recently_accessed'
    ];
    
    // Transfer each table
    for (const table of tables) {
      await transferTable(localConn, dockerConn, table, true);
    }
    
    // Re-enable foreign key checks
    await dockerConn.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 Complete data transfer finished!');
    console.log('📊 Checking final counts...');
    
    // Show final counts
    for (const table of tables) {
      try {
        const [result] = await dockerConn.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`   ${table}: table not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (localConn) await localConn.end();
    if (dockerConn) await dockerConn.end();
  }
})();