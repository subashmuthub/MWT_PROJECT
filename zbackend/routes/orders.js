const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Order, User } = require('../models');
const router = express.Router();

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

// GET order statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'Pending' } });
        const approvedOrders = await Order.count({ where: { status: 'Approved' } });
        const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });

        const totalValue = await Order.sum('total_amount') || 0;
        const pendingValue = await Order.sum('total_amount', { where: { status: 'Pending' } }) || 0;

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
        console.error('Error fetching order statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: error.message
        });
    }
});

// Apply authentication and admin requirement to remaining routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET all orders
router.get('/', async (req, res) => {
    try {
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

        const ordersData = await Order.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator', // Fixed: Match association in models/index.js
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

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
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator', // Fixed: Match association in models/index.js
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
});

// POST create new order
router.post('/', orderValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
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

        const createdOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: createdOrder
        });

    } catch (error) {
        console.error('Error creating order:', error);

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
            error: error.message
        });
    }
});

// PUT update order
router.put('/:id', orderValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const order = await Order.findByPk(req.params.id);

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

        const updatedOrder = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order:', error);

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
            error: error.message
        });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.destroy();

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
});

module.exports = router;