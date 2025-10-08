const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const TrainingCertification = sequelize.define('TrainingCertification', {
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
    training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'training',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    certification_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'active'
    },
    certificate_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    issued_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'training_certifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
        expiryAfterCertification() {
            if (new Date(this.expiry_date) <= new Date(this.certification_date)) {
                throw new Error('Expiry date must be after certification date');
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'training_id']
        },
        { fields: ['status'] },
        { fields: ['expiry_date'] },
        { fields: ['issued_by'] },
        { unique: true, fields: ['certificate_number'], where: { certificate_number: { [Op.ne]: null } } }
    ]
});

// Instance methods
TrainingCertification.prototype.isExpired = function() {
    return new Date() > new Date(this.expiry_date);
};

TrainingCertification.prototype.daysUntilExpiry = function() {
    const now = new Date();
    const expiry = new Date(this.expiry_date);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

TrainingCertification.prototype.renew = async function(newExpiryDate) {
    this.certification_date = new Date();
    this.expiry_date = newExpiryDate;
    this.status = 'active';
    this.is_valid = true;
    return await this.save();
};

// Static methods
TrainingCertification.getExpiringSoon = async function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await this.findAll({
        where: {
            expiry_date: {
                [Op.lte]: futureDate
            },
            status: 'active',
            is_valid: true
        },
        order: [['expiry_date', 'ASC']]
    });
};

TrainingCertification.getExpired = async function() {
    return await this.findAll({
        where: {
            expiry_date: {
                [Op.lt]: new Date()
            },
            status: 'active'
        }
    });
};

module.exports = TrainingCertification;