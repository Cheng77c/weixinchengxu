const sequelize = require('../db/mysql');
const User = require('../models/user');
const VerificationCode = require('../models/verificationCode');

async function init() {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ force: true });
    console.log('数据库表创建成功');
  } catch (error) {
    console.error('数据库表创建失败:', error);
  }
}

init(); 