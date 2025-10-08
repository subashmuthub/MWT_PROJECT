const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    item_type: {
        type: DataTypes.ENUM('lab', 'equipment', 'booking', 'report'),
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
    accessed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'recently_accessed',
    timestamps: true, // This will create created_at and updated_at
    indexes: [
        {
            fields: ['user_id', 'accessed_at'],
            name: 'idx_user_accessed'
        },
        {
            fields: ['user_id', 'item_type', 'item_id'],
            unique: true,
            name: 'unique_user_item'
        }
    ]
});

module.exports = RecentlyAccessed;