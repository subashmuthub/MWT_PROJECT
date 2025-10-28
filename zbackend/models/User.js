const { DataTypes, Op } = require('sequelize');
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
        allowNull: true, // Allow null for OAuth users
        validate: {
            // Custom validator to require password for non-OAuth users
            passwordRequired(value) {
                // If user has OAuth IDs, password can be null
                if (this.google_id || this.github_id || this.facebook_id) {
                    return;
                }
                // For regular users, password is required
                if (!value || value.length < 6) {
                    throw new Error('Password is required and must be at least 6 characters long');
                }
            }
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'teacher', 'lab_assistant', 'lab_technician', 'admin'),
        allowNull: false,
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
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    position: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // OAuth provider fields
    google_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    facebook_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    github_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
        { unique: true, fields: ['email'] },
        { 
            unique: true, 
            fields: ['student_id'],
            where: { student_id: { [Op.ne]: null } }
        },
        { fields: ['role'] },
        { fields: ['is_active'] },
        { fields: ['department'] }
    ],

    defaultScope: {
        attributes: {
            exclude: ['password']
        }
    },

    scopes: {
        withPassword: {
            attributes: {}
        }
    }
});

// No password hashing - return plain text
User.hashPassword = async function (plainPassword) {
    return plainPassword;
};

// Instance methods - using plain text password comparison
User.prototype.comparePassword = async function (candidatePassword) {
    try {
        const userWithPassword = await User.unscoped().findByPk(this.id);
        return candidatePassword === userWithPassword.password;
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
    this.password = newPassword;
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

// No password hashing - using plain text for simplicity
module.exports = User;