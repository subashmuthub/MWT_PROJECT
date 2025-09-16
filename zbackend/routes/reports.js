const express = require('express');
const router = express.Router();
const { Report, ReportSchedule, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Test route to create a simple report
router.post('/test', async (req, res) => {
    try {
        const report = await Report.create({
            title: 'Test Report',
            report_type: 'usage',
            date_range_start: '2024-01-01',
            date_range_end: '2024-01-31',
            report_data: { test: 'data' },
            generated_by: req.user.id,
            status: 'completed'
        });

        res.json({
            success: true,
            data: { report },
            message: 'Test report created successfully'
        });
    } catch (error) {
        console.error('Error creating test report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test report',
            error: error.message
        });
    }
});

// Test route to create a simple schedule
router.post('/schedule/test', async (req, res) => {
    try {
        const schedule = await ReportSchedule.create({
            name: 'Test Schedule',
            report_type: 'usage',
            frequency: 'weekly',
            day_of_week: 1, // Monday
            created_by: req.user.id
        });

        res.json({
            success: true,
            data: { schedule },
            message: 'Test schedule created successfully'
        });
    } catch (error) {
        console.error('Error creating test schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test schedule',
            error: error.message
        });
    }
});

module.exports = router;