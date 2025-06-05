const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');

// 定义在线咨询模型
const Inquiry = sequelize.define('Inquiry', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'resolved'),
    defaultValue: 'pending',
    allowNull: false
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  repliedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // 启用时间戳
  timestamps: true,
  // 表名不复数
  freezeTableName: true,
  // 表名
  tableName: 'inquiry',
  // 字段映射
  underscored: true,
  // 指定字符集和校对规则
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
});

// 关联用户表
Inquiry.belongsTo(User, { foreignKey: 'userId' });

module.exports = Inquiry; 