const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');

// 定义工单模型
const Ticket = sequelize.define('Ticket', {
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
  ticketType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'resolved', 'closed'),
    defaultValue: 'pending',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // 启用时间戳
  timestamps: true,
  // 表名不复数
  freezeTableName: true,
  // 表名
  tableName: 'ticket',
  // 字段映射
  underscored: true,
  // 指定字符集和校对规则
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
});

// 关联用户表
Ticket.belongsTo(User, { foreignKey: 'userId' });

module.exports = Ticket; 