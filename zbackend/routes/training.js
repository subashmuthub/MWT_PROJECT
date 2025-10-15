const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Training, TrainingCertification, User, Equipment } = require('../models');

// ✅ UPDATED: Improved validation middleware
const validateTraining = [
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    body('description').notEmpty().trim().isLength({ max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
    body('duration_hours').isFloat({ min: 0.5, max: 40 }).withMessage('Duration must be between 0.5 and 40 hours'),
    body('validity_months').isInt({ min: 1, max: 60 }).withMessage('Validity must be between 1 and 60 months'),
    body('max_participants').isInt({ min: 1, max: 100 }).withMessage('Max participants must be between 1 and 100'),
    body('equipment_id')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                throw new Error('Equipment ID must be a valid positive integer');
            }
            return true;
        }),
    body('instructor').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('Instructor name must be less than 200 characters'),
    body('required_for_equipment').optional().isBoolean().withMessage('Required for equipment must be boolean')
];

// ✅ HELPER FUNCTION: Clean data for database insertion
const cleanTrainingData = (data) => {
    const cleanedData = { ...data };
    
    if (cleanedData.equipment_id === '' || cleanedData.equipment_id === undefined) {
        cleanedData.equipment_id = null;
    }
    
    if (cleanedData.instructor === '' || cleanedData.instructor === undefined) {
        cleanedData.instructor = null;
    }
    
    if (cleanedData.materials === '' || cleanedData.materials === undefined) {
        cleanedData.materials = null;
    }
    
    return cleanedData;
};

// Test route (public)
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Training routes are working!',
        timestamp: new Date().toISOString()
    });
});

// Apply authentication to all routes below
router.use(authenticateToken);

// Get training statistics
router.get('/stats', async (req, res) => {
    try {
        const totalTrainings = await Training.count({ where: { is_active: true } });
        const totalCertifications = await TrainingCertification.count();
        const activeCertifications = await TrainingCertification.count({ 
            where: { status: 'active' } 
        });
        const expiredCertifications = await TrainingCertification.count({ 
            where: { status: 'expired' } 
        });

        res.json({
            success: true,
            data: {
                totalTrainings,
                totalCertifications,
                activeCertifications,
                expiredCertifications
            }
        });
    } catch (error) {
        console.error('Error fetching training stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training statistics',
            error: error.message
        });
    }
});

// Get all training programs
router.get('/', async (req, res) => {
    try {
        const {
            equipment_id,
            required_only,
            active_only = 'true',
            page = 1,
            limit = 100
        } = req.query;

        let whereClause = {};
        
        if (active_only === 'true') {
            whereClause.is_active = true;
        }
        
        if (equipment_id) {
            whereClause.equipment_id = equipment_id;
        }
        
        if (required_only === 'true') {
            whereClause.required_for_equipment = true;
        }

        const offset = (page - 1) * limit;

        const { rows: trainings, count: total } = await Training.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'category'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: trainings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching training programs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training programs',
            error: error.message
        });
    }
});

// Get single training program
router.get('/:id', async (req, res) => {
    try {
        const training = await Training.findByPk(req.params.id, {
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'category'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        if (!training) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        res.json({
            success: true,
            data: training
        });
    } catch (error) {
        console.error('Error fetching training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training program',
            error: error.message
        });
    }
});

// Create new training program
router.post('/', validateTraining, async (req, res) => {
    try {
        console.log('🎯 Training Creation Request:', {
            user: req.user.userId,
            role: req.user.role,
            body: req.body
        });

        if (!['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            console.log('❌ Access denied - Role not authorized:', req.user.role);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins, teachers, lab technicians, and lab assistants can create training programs.'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const trainingData = cleanTrainingData({
            ...req.body,
            created_by: req.user.userId
        });

        console.log('📝 Cleaned training data:', trainingData);

        const training = await Training.create(trainingData);
        console.log('✅ Training created successfully:', training.id);

        const trainingWithAssociations = await Training.findByPk(training.id, {
            include: [
                {
                    model: Equipment,
                    as: 'equipment',
                    attributes: ['id', 'name', 'category'],
                    required: false
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: trainingWithAssociations,
            message: 'Training program created successfully'
        });
    } catch (error) {
        console.error('❌ Error creating training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create training program',
            error: error.message
        });
    }
});

// Update training program
router.put('/:id', validateTraining, async (req, res) => {
    try {
        if (!['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const training = await Training.findByPk(req.params.id);
        if (!training) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        const updateData = cleanTrainingData(req.body);
        await training.update(updateData);

        res.json({
            success: true,
            data: training,
            message: 'Training program updated successfully'
        });
    } catch (error) {
        console.error('Error updating training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update training program',
            error: error.message
        });
    }
});

// Delete training program
router.delete('/:id', async (req, res) => {
    try {
        if (!['admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins can delete training programs.'
            });
        }

        const training = await Training.findByPk(req.params.id);
        if (!training) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found'
            });
        }

        const certificationCount = await TrainingCertification.count({
            where: { training_id: req.params.id }
        });

        if (certificationCount > 0) {
            await training.update({ is_active: false });
            res.json({
                success: true,
                message: 'Training program deactivated successfully (has existing certifications)'
            });
        } else {
            await training.destroy();
            res.json({
                success: true,
                message: 'Training program deleted successfully'
            });
        }
    } catch (error) {
        console.error('Error deleting training program:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training program',
            error: error.message
        });
    }
});

// Enroll in training
router.post('/:id/enroll', async (req, res) => {
    try {
        const training = await Training.findByPk(req.params.id);
        if (!training || !training.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Training program not found or inactive'
            });
        }

        const existingCertification = await TrainingCertification.findOne({
            where: {
                training_id: req.params.id,
                user_id: req.user.userId
            }
        });

        if (existingCertification) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this training program'
            });
        }

        const currentEnrollments = await TrainingCertification.count({
            where: { training_id: req.params.id }
        });

        if (currentEnrollments >= training.max_participants) {
            return res.status(400).json({
                success: false,
                message: 'Training program is full'
            });
        }

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + training.validity_months);

        const certification = await TrainingCertification.create({
            training_id: req.params.id,
            user_id: req.user.userId,
            expiry_date: expiryDate,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: certification,
            message: 'Successfully enrolled in training program'
        });
    } catch (error) {
        console.error('Error enrolling in training:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enroll in training program',
            error: error.message
        });
    }
});

// Get user certifications
router.get('/certifications/user/:userId?', async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;

        if (req.user.userId != userId && !['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const certifications = await TrainingCertification.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Training,
                    as: 'certification',
                    attributes: ['id', 'title', 'description', 'equipment_id', 'duration_hours', 'validity_months', 'instructor']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: certifications
        });
    } catch (error) {
        console.error('Error fetching user certifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user certifications',
            error: error.message
        });
    }
});

// Get all certifications (admin/teacher only)
router.get('/certifications/all', async (req, res) => {
    try {
        if (!['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            training_id,
            user_id,
            status,
            page = 1,
            limit = 100
        } = req.query;

        let whereClause = {};
        
        if (training_id) whereClause.training_id = training_id;
        if (user_id) whereClause.user_id = user_id;
        if (status) whereClause.status = status;

        const offset = (page - 1) * limit;

        const { rows: certifications, count: total } = await TrainingCertification.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Training,
                    as: 'certification',
                    attributes: ['id', 'title', 'validity_months']
                },
                {
                    model: User,
                    as: 'certifiedUser',
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: certifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching certifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certifications',
            error: error.message
        });
    }
});

// Get certification by ID
router.get('/certifications/:id', async (req, res) => {
    try {
        const certification = await TrainingCertification.findByPk(req.params.id, {
            include: [
                {
                    model: Training,
                    as: 'certification',
                    attributes: ['id', 'title', 'description', 'equipment_id', 'duration_hours', 'validity_months', 'instructor']
                },
                {
                    model: User,
                    as: 'certifiedUser',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        if (certification.user_id !== req.user.userId && !['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: certification
        });
    } catch (error) {
        console.error('Error fetching certification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certification',
            error: error.message
        });
    }
});

// Mark certification as complete
router.patch('/certifications/:id/complete', async (req, res) => {
    try {
        console.log(`🎯 Mark Complete Request - Cert ID: ${req.params.id}, User: ${req.user.userId}, Role: ${req.user.role}`);
        
        const certification = await TrainingCertification.findByPk(req.params.id);
        
        if (!certification) {
            console.log(`❌ Certification not found: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        console.log(`📋 Found certification - Owner: ${certification.user_id}, Status: ${certification.status}`);

        if (certification.user_id !== req.user.userId && !['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            console.log(`❌ Access denied - User ${req.user.userId} cannot modify cert owned by ${certification.user_id}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if already completed using certification_date
        const createdAt = new Date(certification.created_at);
        const certDate = certification.certification_date ? new Date(certification.certification_date) : null;
        
        if (certDate && Math.abs(certDate.getTime() - createdAt.getTime()) > 10000) {
            console.log(`⚠️ Already completed - Created: ${createdAt}, Completed: ${certDate}`);
            return res.status(400).json({
                success: false,
                message: 'Certification already completed'
            });
        }

        const now = new Date();
        await certification.update({
            certification_date: now,
            status: 'active'
        });

        console.log(`✅ Certification marked complete at: ${now}`);

        const updatedCertification = await TrainingCertification.findByPk(certification.id, {
            include: [
                {
                    model: Training,
                    as: 'certification',
                    attributes: ['id', 'title', 'description', 'equipment_id', 'duration_hours', 'validity_months', 'instructor']
                }
            ]
        });

        res.json({
            success: true,
            data: updatedCertification,
            message: 'Certification marked as complete successfully'
        });
    } catch (error) {
        console.error('❌ Error completing certification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete certification',
            error: error.message
        });
    }
});

// Update certification status (admin/teacher only)
router.patch('/certifications/:id/status', async (req, res) => {
    try {
        if (!['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins, teachers, lab technicians, and lab assistants can update certification status.'
            });
        }

        const { status, score, notes } = req.body;
        
        const certification = await TrainingCertification.findByPk(req.params.id);
        
        if (!certification) {
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (score !== undefined) updateData.score = score;
        if (notes !== undefined) updateData.notes = notes;
        if (status === 'revoked') updateData.is_valid = false;

        await certification.update(updateData);

        res.json({
            success: true,
            data: certification,
            message: 'Certification status updated successfully'
        });
    } catch (error) {
        console.error('Error updating certification status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update certification status',
            error: error.message
        });
    }
});

// Renew certification
router.post('/certifications/:id/renew', async (req, res) => {
    try {
        if (!['admin', 'teacher', 'lab_technician', 'lab_assistant'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins, teachers, lab technicians, and lab assistants can renew certifications.'
            });
        }

        const certification = await TrainingCertification.findByPk(req.params.id, {
            include: [
                {
                    model: Training,
                    as: 'certification',
                    attributes: ['validity_months']
                }
            ]
        });
        
        if (!certification) {
            return res.status(404).json({
                success: false,
                message: 'Certification not found'
            });
        }

        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + certification.certification.validity_months);

        await certification.update({
            certification_date: new Date(),
            expiry_date: newExpiryDate,
            status: 'active',
            is_valid: true
        });

        res.json({
            success: true,
            data: certification,
            message: 'Certification renewed successfully'
        });
    } catch (error) {
        console.error('Error renewing certification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to renew certification',
            error: error.message
        });
    }
});

module.exports = router;