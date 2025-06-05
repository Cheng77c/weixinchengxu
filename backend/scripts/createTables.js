/**
 * 执行SQL脚本创建表
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

async function createTables() {
  try {
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'createCustomerTables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 连接数据库
    const connection = await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database,
      multipleStatements: true // 允许执行多条SQL语句
    });
    
    console.log('数据库连接成功');
    
    // 执行SQL脚本
    await connection.query(sql);
    console.log('表创建成功');
    
    // 关闭连接
    await connection.end();
    
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

// 执行函数
createTables(); 