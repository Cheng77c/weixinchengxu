/**
 * 文件模型
 * 用于存储资料中心的文件信息
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db/mysql');
const User = require('./user');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '文件名'
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '原始文件名'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '文件分类'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '文件描述'
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '文件存储路径'
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '文件大小(字节)'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '文件类型'
  },
  isExclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否为专属文件（仅管理员和合作伙伴可见）'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '上传者ID'
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '下载次数'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    comment: '文件状态：active-正常，deleted-已删除'
  }
}, {
  tableName: 'files',
  timestamps: true,
  underscored: true
});

// 建立与用户的关联
File.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'uploader' 
});

module.exports = File; 