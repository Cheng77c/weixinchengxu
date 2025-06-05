const { Sequelize } = require('sequelize');
const config = require('../config');

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: false, // 关闭SQL日志
    timezone: '+08:00', // 东八区
    define: {
      // 不自动添加时间戳字段
      timestamps: true,
      // 不使用驼峰式命名
      underscored: true,
      // 表名不复数化
      freezeTableName: true
    },
    // 连接池配置
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

testConnection();

module.exports = sequelize;
