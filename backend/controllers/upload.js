const fs = require('fs');
const path = require('path');

class UploadController {
  /**
   * 上传单个文件
   */
  async uploadFile(ctx) {
    try {
      const file = ctx.request.files.file;
      if (!file) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '没有上传文件' };
        return;
      }

      // 获取文件扩展名
      const ext = path.extname(file.originalFilename);
      
      // 生成唯一文件名
      const fileName = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
      
      // 确保上传目录存在
      const uploadDir = path.join(__dirname, '../public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // 目标文件路径
      const filePath = path.join(uploadDir, fileName);
      
      // 读取临时文件并写入到目标位置
      const reader = fs.createReadStream(file.filepath);
      const writer = fs.createWriteStream(filePath);
      
      await new Promise((resolve, reject) => {
        reader.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      // 返回文件信息
      const fileInfo = {
        name: file.originalFilename,
        url: `/uploads/${fileName}`,
        size: file.size,
        type: file.mimetype
      };
      
      ctx.body = {
        code: 200,
        message: '上传成功',
        data: fileInfo
      };
    } catch (err) {
      console.error('文件上传失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '文件上传失败' };
    }
  }
}

module.exports = new UploadController(); 