const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');
const Project = require('./project');

// 定义项目报告模型
const ProjectReport = sequelize.define('ProjectReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Project,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  reportTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reportContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'reviewed', 'rejected'),
    defaultValue: 'submitted',
    allowNull: false
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
  tableName: 'project_report',
  // 字段映射
  underscored: true
});

// 关联用户表和项目表
ProjectReport.belongsTo(User, { foreignKey: 'userId' });
ProjectReport.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = ProjectReport; 