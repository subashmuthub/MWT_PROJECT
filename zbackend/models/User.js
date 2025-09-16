const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 255]
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'teacher', 'lab_assistant', 'admin'),
        defaultValue: 'student'
    },
    student_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // Default scope (excludes password)
    defaultScope: {
        attributes: {
            exclude: ['password']
        }
    },

    // Scopes
    scopes: {
        withPassword: {
            attributes: {}
        }
    }
});

// ✅ CRITICAL FIX: Remove automatic password hashing hooks
// The auth routes will handle password hashing manually to avoid conflicts

// DISABLED: Automatic hashing to prevent double-hashing
// User.beforeCreate(async (user) => {
//     if (user.password) {
//         const salt = await bcrypt.genSalt(12);
//         user.password = await bcrypt.hash(user.password, salt);
//     }
// });

// DISABLED: Automatic hashing on updates
// User.beforeUpdate(async (user) => {
//     if (user.changed('password')) {
//         const salt = await bcrypt.genSalt(12);
//         user.password = await bcrypt.hash(user.password, salt);
//     }
// });

// ✅ NEW: Manual password hashing methods (use these when needed)
User.hashPassword = async function (plainPassword) {
    return await bcrypt.hash(plainPassword, 12);
};

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    try {
        // Get the user with password included
        const userWithPassword = await User.unscoped().findByPk(this.id);
        return await bcrypt.compare(candidatePassword, userWithPassword.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

User.prototype.updateLastLogin = async function () {
    this.last_login = new Date();
    return await this.save({ fields: ['last_login'] });
};

User.prototype.setPassword = async function (newPassword) {
    this.password = await bcrypt.hash(newPassword, 12);
    return await this.save({ fields: ['password'] });
};

// Static methods
User.findByEmailWithPassword = async function (email) {
    return await this.unscoped().findOne({
        where: {
            email: email.toLowerCase(),
            is_active: true
        }
    });
};

User.getStats = async function () {
    const totalUsers = await this.count();
    const activeUsers = await this.count({ where: { is_active: true } });
    const usersByRole = await this.findAll({
        attributes: ['role', [sequelize.fn('COUNT', sequelize.col('role')), 'count']],
        group: ['role']
    });

    return {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole.reduce((acc, user) => {
            acc[user.role] = parseInt(user.dataValues.count);
            return acc;
        }, {})
    };
};

module.exports = User;