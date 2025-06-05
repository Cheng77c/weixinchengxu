/**
 * 检查数据库中的文件记录
 */
const File = require('../models/file');
const User = require('../models/user');

async function checkFiles() {
  try {
    console.log('正在检查文件记录...');

    // 查找所有活跃的文件记录
    const files = await File.findAll({
      where: {
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'companyName', 'status']
        }
      ]
    });

    console.log(`共找到 ${files.length} 个文件记录`);

    // 打印每个文件的详细信息
    files.forEach(file => {
      console.log('----------------------------');
      console.log(`ID: ${file.id}`);
      console.log(`名称: ${file.name}`);
      console.log(`原始名称: ${file.originalName}`);
      console.log(`路径: ${file.path}`);
      console.log(`大小: ${file.size} 字节`);
      console.log(`类型: ${file.type}`);
      console.log(`分类: ${file.category}`);
      console.log(`上传者: ${file.uploader ? file.uploader.name : '未知'}`);
      console.log(`创建时间: ${file.createdAt}`);
    });

    console.log('----------------------------');
    console.log('检查完成!');
  } catch (error) {
    console.error('检查文件记录时出错:', error);
  } finally {
    process.exit(0);
  }
}

// 运行检查脚本
checkFiles(); 