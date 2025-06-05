const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');

// 定义FAQ模型
const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  // 启用时间戳
  timestamps: true,
  // 表名不复数
  freezeTableName: true,
  // 表名
  tableName: 'faq',
  // 字段映射
  underscored: true,
  // 指定字符集和校对规则
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
});

module.exports = FAQ; 