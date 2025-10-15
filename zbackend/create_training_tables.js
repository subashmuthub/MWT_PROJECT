const { sequelize } = require('./config/database');

async function createTrainingTables() {
    try {
        console.log('🔄 Creating training tables...');

        // Create training table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS training (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                equipment_id INT NULL,
                required_for_equipment BOOLEAN DEFAULT TRUE,
                duration_hours DECIMAL(4,2) NOT NULL,
                validity_months INT NOT NULL,
                max_participants INT NOT NULL,
                instructor VARCHAR(200) NULL,
                materials TEXT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON UPDATE CASCADE ON DELETE SET NULL,
                FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
            )
        `);
        console.log('✅ Training table created');

        // Create training_certifications table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS training_certifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                training_id INT NOT NULL,
                user_id INT NOT NULL,
                certification_date TIMESTAMP NULL,
                expiry_date TIMESTAMP NULL,
                status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
                score DECIMAL(5,2) NULL,
                notes TEXT NULL,
                is_valid BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (training_id) REFERENCES training(id) ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
                UNIQUE KEY unique_user_training (user_id, training_id)
            )
        `);
        console.log('✅ Training certifications table created');

        console.log('🎉 All training tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating training tables:', error.message);
        process.exit(1);
    }
}

createTrainingTables();