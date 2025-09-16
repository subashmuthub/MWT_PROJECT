// routes/orders.js - Updated to use your existing middleware
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Import models
let Order, User;

try {
    const models = require('../models');
    Order = models.Order || require('../models/Order');
    User = models.User || require('../models/User');
} catch (error) {
    console.error('Error importing models:', error);
    Order = require('../models/Order');
    User = require('../models/User');
}

// Order validation
const orderValidation = [
    body('supplier').trim().isLength({ min: 2, max: 255 }).withMessage('Supplier name required'),
    body('equipment_name').trim().isLength({ min: 2, max: 255 }).withMessage('Equipment name required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('status').optional().isIn(['Pending', 'Approved', 'Ordered', 'Delivered', 'Cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
];

// GET /api/orders/test - Test orders routes (No auth required)
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Orders routes are working!',
        timestamp: new Date().toISOString(),
        note: 'All other endpoints require admin authentication',
        availableEndpoints: {
            getAll: 'GET /api/orders (Admin only)',
            getById: 'GET /api/orders/:id (Admin only)',
            create: 'POST /api/orders (Admin only)',
            update: 'PUT /api/orders/:id (Admin only)',
            delete: 'DELETE /api/orders/:id (Admin only)',
            stats: 'GET /api/orders/stats/summary (Admin only)',
            test: 'GET /api/orders/test (Public)'
        }
    });
});

// GET /api/orders/stats/summary - Get order statistics (Admin only)
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching order statistics for admin:', req.user.email);

        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'Pending' } });
        const approvedOrders = await Order.count({ where: { status: 'Approved' } });
        const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });

        const totalValue = await Order.sum('total_amount') || 0;
        const pendingValue = await Order.sum('total_amount', { where: { status: 'Pending' } }) || 0;

        console.log('✅ Order statistics calculated');

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                approvedOrders,
                deliveredOrders,
                totalValue: parseFloat(totalValue),
                pendingValue: parseFloat(pendingValue)
            }
        });

    } catch (error) {
        console.error('💥 Error fetching order statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Apply authentication and admin requirement to all routes below
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/orders - Get all orders (Admin only)
router.get('/', async (req, res) => {
    try {
        console.log('📦 Fetching orders for admin:', req.user.email);

        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (status && status !== 'all') {
            whereClause.status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { supplier: { [Op.like]: `%${search}%` } },
                { equipment_name: { [Op.like]: `%${search}%` } }
            ];
        }

        // Try with associations first, fallback without if association fails
        let ordersData;
        try {
            ordersData = await Order.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                        required: false // LEFT JOIN instead of INNER JOIN
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (associationError) {
            console.log('Association failed, fetching without associations:', associationError.message);
            ordersData = await Order.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }

        console.log(`✅ Found ${ordersData.count} orders`);

        res.json({
            success: true,
            data: ordersData.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: ordersData.count,
                pages: Math.ceil(ordersData.count / limit)
            }
        });
    } catch (error) {
        console.error('💥 Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/orders/:id - Get single order by ID (Admin only)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`📦 Fetching order with ID: ${id} for admin:`, req.user.email);

        let order;
        try {
            order = await Order.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        } catch (associationError) {
            console.log('Association failed, fetching without associations');
            order = await Order.findByPk(id);
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        console.log('✅ Order found');

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('💥 Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// POST /api/orders - Create new order (Admin only)
router.post('/', orderValidation, async (req, res) => {
    try {
        console.log('📦 Creating new order for admin:', req.user.email);
        console.log('User info:', req.user);

        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            supplier,
            equipment_name,
            quantity,
            unit_price,
            total_amount,
            status = 'Pending',
            priority = 'Medium',
            order_date,
            expected_delivery,
            description
        } = req.body;

        console.log('Creating order with data:', {
            supplier: supplier?.trim(),
            equipment_name: equipment_name?.trim(),
            quantity: parseInt(quantity),
            unit_price: parseFloat(unit_price),
            total_amount: parseFloat(total_amount),
            status,
            priority,
            created_by: req.user.userId
        });

        // Create order
        const order = await Order.create({
            supplier: supplier.trim(),
            equipment_name: equipment_name.trim(),
            quantity: parseInt(quantity),
            unit_price: parseFloat(unit_price),
            total_amount: parseFloat(total_amount),
            status,
            priority,
            order_date: order_date || new Date().toISOString().split('T')[0],
            expected_delivery: expected_delivery || null,
            description: description?.trim() || null,
            created_by: req.user.userId
        });

        console.log('✅ Order created successfully:', order.id);

        // Try to fetch with associations, fallback without
        let createdOrder;
        try {
            createdOrder = await Order.findByPk(order.id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        } catch (associationError) {
            console.log('Association failed, returning basic order data');
            createdOrder = order;
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: createdOrder
        });

    } catch (error) {
        console.error('💥 Error creating order:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// PUT /api/orders/:id - Update order (Admin only)
router.put('/:id', orderValidation, async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`📦 Updating order with ID: ${id} by admin:`, req.user.email);

        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const {
            supplier,
            equipment_name,
            quantity,
            unit_price,
            total_amount,
            status,
            priority,
            order_date,
            expected_delivery,
            description
        } = req.body;

        // Update order
        await order.update({
            supplier: supplier.trim(),
            equipment_name: equipment_name.trim(),
            quantity: parseInt(quantity),
            unit_price: parseFloat(unit_price),
            total_amount: parseFloat(total_amount),
            status,
            priority,
            order_date,
            expected_delivery: expected_delivery || null,
            description: description?.trim() || null
        });

        console.log('✅ Order updated successfully');

        // Try to fetch with associations, fallback without
        let updatedOrder;
        try {
            updatedOrder = await Order.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        } catch (associationError) {
            console.log('Association failed, returning basic order data');
            updatedOrder = await Order.findByPk(id);
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('💥 Error updating order:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// DELETE /api/orders/:id - Delete order (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`🗑️ Deleting order with ID: ${id} by admin:`, req.user.email);

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.destroy();

        console.log('✅ Order deleted successfully');

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('💥 Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;