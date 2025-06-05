/**
 * 修复数据库中的文件名
 * 这个脚本会检查所有文件记录，确保它们有正确的显示文件名
 */
const { Op } = require('sequelize');
const File = require('../models/file');

async function fixFileNames() {
  try {
    console.log('开始修复文件名...');

    // 查找所有可能有问题的文件记录
    const files = await File.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { name: { [Op.like]: 'tt%' } },  // 临时文件名通常以tt开头
          { name: { [Op.like]: '%tmp%' } }, // 包含tmp的可能是临时文件
          { name: { [Op.notLike]: '%.%' } } // 没有扩展名的可能是临时文件
        ]
      }
    });

    console.log(`找到 ${files.length} 个可能需要修复的文件记录`);

    let fixedCount = 0;
    for (const file of files) {
      // 检查是否有originalName字段
      if (file.originalName && file.originalName !== file.name) {
        console.log(`修复文件: ID=${file.id}, 原名称=${file.name}, 新名称=${file.originalName}`);
        
        // 更新文件名为原始文件名
        await file.update({ name: file.originalName });
        fixedCount++;
      } else {
        // 尝试从路径中提取更好的文件名
        const pathParts = file.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // 如果路径中的文件名包含有意义的信息（如日期戳），则使用它
        if (fileName.includes('datum_') && fileName !== file.name) {
          console.log(`修复文件: ID=${file.id}, 原名称=${file.name}, 新名称=${fileName}`);
          await file.update({ name: fileName });
          fixedCount++;
        }
      }
    }

    console.log(`修复完成! 共修复了 ${fixedCount} 个文件记录`);
  } catch (error) {
    console.error('修复文件名时出错:', error);
  } finally {
    process.exit(0);
  }
}

// 运行修复脚本
fixFileNames(); 