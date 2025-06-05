const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');

// 定义项目模型
const Project = sequelize.define('Project', {
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
  projectName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  projectLeader: {
    type: DataTypes.STRING,
    allowNull: false
  },
  projectDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectGoal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectBudget: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed'),
    defaultValue: 'pending',
    allowNull: false
  },
  progress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // 启用时间戳
  timestamps: true,
  // 表名不复数
  freezeTableName: true,
  // 表名
  tableName: 'project',
  // 字段映射
  underscored: true
});

// 关联用户表
Project.belongsTo(User, { foreignKey: 'userId' });

module.exports = Project;