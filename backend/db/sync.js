const sequelize = require('./mysql');
const User = require('../models/user');

async function syncDatabase() {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行同步
syncDatabase(); 