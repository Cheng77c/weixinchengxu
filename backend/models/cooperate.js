const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');

// 定义合作申请模型
const Cooperate = sequelize.define('Cooperate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    validate: {
      is: /^1[3-9]\d{9}$/
    }
  },
  companyDesc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  intentionDesc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('attachments');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('attachments', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  reviewComment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  // 启用时间戳
  timestamps: true,
  // 表名不复数
  freezeTableName: true,
  // 表名
  tableName: 'cooperate',
  // 字段映射
  underscored: true
});

// 关联用户表
Cooperate.belongsTo(User, { foreignKey: 'userId' });

module.exports = Cooperate; 