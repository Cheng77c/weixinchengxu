/**
 * 文件测试数据生成脚本
 */
const File = require('../models/file');
const User = require('../models/user');
const sequelize = require('../db/mysql');

async function seedFiles() {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 获取一个用户作为上传者
    const user = await User.findOne();
    if (!user) {
      console.error('未找到用户，请先创建用户');
      return;
    }

    // 创建测试文件数据
    const testFiles = [
      {
        name: '培训手册.pdf',
        originalName: '培训手册.pdf',
        category: '培训资料',
        description: '新员工入职培训手册',
        path: '/datum/training_manual.pdf',
        size: 1024 * 1024 * 2, // 2MB
        type: 'application/pdf',
        isExclusive: false,
        userId: user.id,
        downloadCount: 5,
        status: 'active'
      },
      {
        name: '法律合同模板.docx',
        originalName: '法律合同模板.docx',
        category: '法律文件',
        description: '标准合同模板',
        path: '/datum/contract_template.docx',
        size: 1024 * 512, // 512KB
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        isExclusive: true,
        userId: user.id,
        downloadCount: 3,
        status: 'active'
      },
      {
        name: '2023年行业分析报告.xlsx',
        originalName: '2023年行业分析报告.xlsx',
        category: '行业报告',
        description: '2023年度行业发展趋势分析',
        path: '/datum/industry_report_2023.xlsx',
        size: 1024 * 1024, // 1MB
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        isExclusive: false,
        userId: user.id,
        downloadCount: 10,
        status: 'active'
      },
      {
        name: '项目计划书.pptx',
        originalName: '项目计划书.pptx',
        category: '项目文件',
        description: '项目规划与实施计划',
        path: '/datum/project_plan.pptx',
        size: 1024 * 1024 * 3, // 3MB
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        isExclusive: false,
        userId: user.id,
        downloadCount: 7,
        status: 'active'
      }
    ];

    // 清空现有数据
    await File.destroy({ where: {} });
    console.log('已清空现有文件数据');

    // 插入测试数据
    await File.bulkCreate(testFiles);
    console.log('测试文件数据创建成功');

    // 查询验证
    const files = await File.findAll();
    console.log(`已创建 ${files.length} 条文件记录`);
    
    process.exit(0);
  } catch (error) {
    console.error('测试数据创建失败:', error);
    process.exit(1);
  }
}

// 执行脚本
seedFiles(); 