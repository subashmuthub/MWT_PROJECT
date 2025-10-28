-- MySQL Database Initialization for LabMS
-- This script runs automatically when the MySQL container starts for the first time

-- Ensure UTF-8 support
ALTER DATABASE labms_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Performance optimization settings
SET GLOBAL max_connections = 200;

-- Create a read-only user for reports (optional)
CREATE USER IF NOT EXISTS 'labms_readonly'@'%' IDENTIFIED BY 'readonly_pass_2024';
GRANT SELECT ON labms_db.* TO 'labms_readonly'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Log successful initialization
SELECT 'LabMS Database initialized successfully' AS status;