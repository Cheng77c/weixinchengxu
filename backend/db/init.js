/**
 * 数据库初始化脚本
 * 用于同步模型到数据库
 */
const sequelize = require('./mysql');

// 导入所有模型
const User = require('../models/user');
const Cooperate = require('../models/cooperate');
const Project = require('../models/project');
const ProjectReport = require('../models/projectReport');
const Inquiry = require('../models/inquiry');
const Ticket = require('../models/ticket');
const FAQ = require('../models/faq');
// 在这里导入其他模型...

// 同步所有模型到数据库
async function syncModels() {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 仅创建不存在的表，不修改现有表结构
    // 这样可以避免Too many keys错误
    try {
      // 尝试单独同步新模型
      await Inquiry.sync({ force: false, alter: false });
      await Ticket.sync({ force: false, alter: false });
      await FAQ.sync({ force: false, alter: false });
      console.log('客户服务相关模型已同步到数据库');
    } catch (modelError) {
      console.error('客户服务模型同步失败:', modelError);
    }
    
    console.log('所有模型同步完成');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

module.exports = { syncModels }; 