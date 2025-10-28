// Recently Accessed Items Tracking System
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Define RecentlyAccessed model
const RecentlyAccessed = sequelize.define('RecentlyAccessed', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    item_type: {
        type: DataTypes.ENUM('equipment', 'lab', 'booking', 'maintenance', 'report', 'user'),
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    item_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    access_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    last_accessed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'recently_accessed',
    timestamps: true,
    indexes: [
        { fields: ['user_id', 'item_type', 'item_id'], unique: true },
        { fields: ['user_id', 'last_accessed'] },
        { fields: ['item_type'] }
    ]
});

// Sync the model (create table if it doesn't exist)
// RecentlyAccessed.sync(); // Disabled for Docker - tables created by initialization scripts

// Middleware to track item access
const trackAccess = (itemType) => {
    return async (req, res, next) => {
        try {
            if (req.user && req.params.id) {
                const itemId = req.params.id;
                const userId = req.user.id;
                
                // Get item details based on type
                let itemName = `${itemType} #${itemId}`;
                let itemDescription = '';
                
                // Try to get more descriptive name based on item type
                try {
                    const { Equipment, Lab, User, Booking, Maintenance } = require('../models');
                    let item;
                    
                    switch (itemType) {
                        case 'equipment':
                            item = await Equipment.findByPk(itemId);
                            if (item) {
                                itemName = item.name;
                                itemDescription = item.description || `${item.category} equipment`;
                            }
                            break;
                        case 'lab':
                            item = await Lab.findByPk(itemId);
                            if (item) {
                                itemName = item.name;
                                itemDescription = item.description || `${item.lab_type} lab`;
                            }
                            break;
                        case 'user':
                            item = await User.findByPk(itemId);
                            if (item) {
                                itemName = item.name;
                                itemDescription = `${item.role} - ${item.email}`;
                            }
                            break;
                    }
                } catch (error) {
                    console.log('Could not fetch item details:', error.message);
                }
                
                // Update or create recent access record
                const [recentItem, created] = await RecentlyAccessed.findOrCreate({
                    where: {
                        user_id: userId,
                        item_type: itemType,
                        item_id: itemId
                    },
                    defaults: {
                        item_name: itemName,
                        item_description: itemDescription,
                        access_count: 1,
                        last_accessed: new Date()
                    }
                });
                
                if (!created) {
                    await recentItem.update({
                        item_name: itemName,
                        item_description: itemDescription,
                        access_count: recentItem.access_count + 1,
                        last_accessed: new Date()
                    });
                }
            }
        } catch (error) {
            console.log('Access tracking error:', error.message);
        }
        
        next();
    };
};

// Get recently accessed items for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { limit = 10, type } = req.query;
        const userId = req.user.id;
        
        const whereClause = { user_id: userId };
        if (type) {
            whereClause.item_type = type;
        }
        
        const recentItems = await RecentlyAccessed.findAll({
            where: whereClause,
            order: [['last_accessed', 'DESC']],
            limit: parseInt(limit)
        });
        
        // Group by item type for better organization
        const groupedItems = recentItems.reduce((acc, item) => {
            if (!acc[item.item_type]) {
                acc[item.item_type] = [];
            }
            acc[item.item_type].push({
                id: item.item_id,
                name: item.item_name,
                description: item.item_description,
                accessCount: item.access_count,
                lastAccessed: item.last_accessed,
                type: item.item_type
            });
            return acc;
        }, {});
        
        res.json({
            success: true,
            data: {
                recentItems: recentItems.map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    description: item.item_description,
                    type: item.item_type,
                    accessCount: item.access_count,
                    lastAccessed: item.last_accessed
                })),
                groupedItems,
                totalCount: recentItems.length
            }
        });
    } catch (error) {
        console.error('Error fetching recently accessed items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recently accessed items',
            error: error.message
        });
    }
});

// Get frequently accessed items
router.get('/frequent', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const userId = req.user.id;
        
        const frequentItems = await RecentlyAccessed.findAll({
            where: { user_id: userId },
            order: [['access_count', 'DESC'], ['last_accessed', 'DESC']],
            limit: parseInt(limit)
        });
        
        res.json({
            success: true,
            data: {
                frequentItems: frequentItems.map(item => ({
                    id: item.item_id,
                    name: item.item_name,
                    description: item.item_description,
                    type: item.item_type,
                    accessCount: item.access_count,
                    lastAccessed: item.last_accessed
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching frequently accessed items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch frequently accessed items',
            error: error.message
        });
    }
});

// Clear recent access history
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query;
        
        const whereClause = { user_id: userId };
        if (type) {
            whereClause.item_type = type;
        }
        
        const deletedCount = await RecentlyAccessed.destroy({
            where: whereClause
        });
        
        res.json({
            success: true,
            message: `Cleared ${deletedCount} recent access records`,
            deletedCount
        });
    } catch (error) {
        console.error('Error clearing recent access:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear recent access history',
            error: error.message
        });
    }
});

// Manually track an item access
router.post('/track', authenticateToken, async (req, res) => {
    try {
        const { itemType, itemId, itemName, itemDescription } = req.body;
        const userId = req.user.id;
        
        if (!itemType || !itemId) {
            return res.status(400).json({
                success: false,
                message: 'itemType and itemId are required'
            });
        }
        
        const [recentItem, created] = await RecentlyAccessed.findOrCreate({
            where: {
                user_id: userId,
                item_type: itemType,
                item_id: itemId
            },
            defaults: {
                item_name: itemName || `${itemType} #${itemId}`,
                item_description: itemDescription || '',
                access_count: 1,
                last_accessed: new Date()
            }
        });
        
        if (!created) {
            await recentItem.update({
                access_count: recentItem.access_count + 1,
                last_accessed: new Date()
            });
        }
        
        res.json({
            success: true,
            message: 'Access tracked successfully',
            data: {
                itemId: recentItem.item_id,
                itemType: recentItem.item_type,
                accessCount: recentItem.access_count,
                created
            }
        });
    } catch (error) {
        console.error('Error tracking access:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track access',
            error: error.message
        });
    }
});

// Export both router and middleware
module.exports = {
    router,
    trackAccess
};