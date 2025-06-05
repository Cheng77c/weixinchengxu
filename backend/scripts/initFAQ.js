/**
 * FAQ初始化脚本
 * 用于初始化常见问题数据
 */
const FAQ = require('../models/faq');
const sequelize = require('../db/mysql');

// 初始FAQ数据
const initialFAQs = [
  { 
    question: "如何注册账号?", 
    answer: "您可以通过点击注册按钮进行注册。",
    category: "账号相关",
    sortOrder: 1
  },
  { 
    question: "如何找回密码?", 
    answer: "请点击忘记密码按钮，按照提示操作。",
    category: "账号相关",
    sortOrder: 2
  },
  { 
    question: "如何联系客服?", 
    answer: "您可以在页面底部找到在线客服入口。",
    category: "服务相关",
    sortOrder: 3
  },
  { 
    question: "如何提交工单?", 
    answer: "在客户服务页面，选择工单类型并填写详细内容后提交即可。",
    category: "服务相关",
    sortOrder: 4
  },
  { 
    question: "工单处理时间是多久?", 
    answer: "我们会在1-2个工作日内处理您的工单，紧急问题会优先处理。",
    category: "服务相关",
    sortOrder: 5
  }
];

// 初始化FAQ数据
async function initFAQ() {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步FAQ模型
    await FAQ.sync({ alter: true });
    
    // 检查是否已有数据
    const count = await FAQ.count();
    if (count > 0) {
      console.log('FAQ数据已存在，跳过初始化');
      return;
    }
    
    // 批量创建FAQ数据
    await FAQ.bulkCreate(initialFAQs);
    console.log('FAQ初始数据创建成功');
  } catch (error) {
    console.error('FAQ初始化失败:', error);
  }
}

// 执行初始化
initFAQ(); 