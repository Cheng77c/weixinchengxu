const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const File = require('../models/file');
const User = require('../models/user');

class FileController {
  /**
   * 上传文件到资料中心
   */
  async uploadFile(ctx) {
    try {
      const { category, description, isExclusive, fileName } = ctx.request.body;
      const file = ctx.request.files.file;
      const user = ctx.state.user;
      
      if (!file) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '没有上传文件' };
        return;
      }

      if (!category) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '请选择文件分类' };
        return;
      }

      // 获取文件扩展名
      const ext = path.extname(file.originalFilename);
      
      // 生成唯一文件名
      const uniqueFileName = `datum_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
      
      // 确保上传目录存在
      const uploadDir = path.join(__dirname, '../public/datum');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // 目标文件路径
      const filePath = path.join(uploadDir, uniqueFileName);
      
      // 读取临时文件并写入到目标位置
      const reader = fs.createReadStream(file.filepath);
      const writer = fs.createWriteStream(filePath);
      
      await new Promise((resolve, reject) => {
        reader.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      // 使用客户端提供的文件名或从原始文件名中提取
      const displayFileName = fileName || file.originalFilename || path.basename(file.filepath);
      console.log('文件上传 - 原始文件名:', file.originalFilename);
      console.log('文件上传 - 显示文件名:', displayFileName);
      
      // 保存文件信息到数据库
      const fileRecord = await File.create({
        name: displayFileName,
        originalName: displayFileName,
        path: `/datum/${uniqueFileName}`,
        size: file.size,
        type: file.mimetype,
        category: category,
        description: description || '',
        isExclusive: isExclusive === 'true' || isExclusive === true,
        userId: user.id
      });
      
      // 返回文件信息
      ctx.body = {
        code: 200,
        message: '上传成功',
        data: {
          id: fileRecord.id,
          name: fileRecord.name,
          url: fileRecord.path,
          size: fileRecord.size,
          type: fileRecord.type,
          category: fileRecord.category,
          isExclusive: fileRecord.isExclusive,
          createdAt: fileRecord.createdAt
        }
      };
    } catch (err) {
      console.error('文件上传失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '文件上传失败' };
    }
  }

  /**
   * 获取文件列表
   */
  async getFileList(ctx) {
    try {
      const { category, query, page = 1, limit = 10 } = ctx.query;
      const user = ctx.state.user;
      
      const where = { status: 'active' };
      
      // 根据分类筛选
      if (category) {
        where.category = category;
      }
      
      // 根据关键词搜索
      if (query) {
        where.name = {
          [Op.like]: `%${query}%`
        };
      }
      
      // 普通用户只能看到非专属文件和自己上传的文件
      if (user.status !== 'admin') {
        where[Op.or] = [
          { isExclusive: false },
          { userId: user.id }
        ];
      }
      
      // 分页查询
      const offset = (page - 1) * limit;
      
      const { count, rows } = await File.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name', 'companyName', 'status']
          }
        ],
        order: [['createdAt', 'DESC']],
        offset,
        limit: parseInt(limit)
      });
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          files: rows.map(file => ({
            id: file.id,
            name: file.name,
            url: file.path,
            size: file.size,
            type: file.type,
            category: file.category,
            description: file.description,
            isExclusive: file.isExclusive,
            downloadCount: file.downloadCount,
            uploader: file.uploader ? {
              id: file.uploader.id,
              name: file.uploader.name,
              companyName: file.uploader.companyName,
              status: file.uploader.status
            } : null,
            createdAt: file.createdAt
          }))
        }
      };
    } catch (err) {
      console.error('获取文件列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取文件列表失败' };
    }
  }

  /**
   * 按类型获取文件列表（分类展示）
   */
  async getFilesByCategory(ctx) {
    try {
      const { query } = ctx.query;
      const user = ctx.state.user;
      
      // 获取所有分类
      const categories = ['培训资料', '法律文件', '行业报告', '项目文件'];
      const result = {};
      
      // 基础查询条件
      const baseWhere = { status: 'active' };
      
      // 根据关键词搜索
      if (query) {
        baseWhere.name = {
          [Op.like]: `%${query}%`
        };
      }
      
      // 普通用户只能看到非专属文件和自己上传的文件
      if (user.status !== 'admin') {
        baseWhere[Op.or] = [
          { isExclusive: false },
          { userId: user.id }
        ];
      }
      
      // 对每个分类分别查询
      for (const category of categories) {
        const where = { ...baseWhere, category };
        
        const files = await File.findAll({
          where,
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'companyName', 'status']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10 // 每个分类最多显示10个文件
        });
        
        // 添加调试日志
        console.log(`${category}类别的文件:`, JSON.stringify(files.map(f => f.toJSON())));
        
        result[category] = files.map(file => ({
          id: file.id,
          name: file.name,
          url: file.path,
          size: file.size,
          type: file.type,
          category: file.category,
          description: file.description,
          isExclusive: file.isExclusive,
          downloadCount: file.downloadCount,
          uploader: file.uploader ? {
            id: file.uploader.id,
            name: file.uploader.name,
            companyName: file.uploader.companyName,
            status: file.uploader.status
          } : null,
          createdAt: file.createdAt
        }));
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: {
          categories,
          files: result
        }
      };
    } catch (err) {
      console.error('获取分类文件列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取分类文件列表失败' };
    }
  }

  /**
   * 获取文件详情
   */
  async getFileDetail(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;
      
      const file = await File.findOne({
        where: { id, status: 'active' },
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'name', 'companyName', 'status']
          }
        ]
      });
      
      if (!file) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '文件不存在' };
        return;
      }
      
      // 检查权限：普通用户不能查看专属文件（除非是自己上传的）
      if (file.isExclusive && user.status !== 'admin' && file.userId !== user.id) {
        ctx.status = 403;
        ctx.body = { code: 403, message: '无权访问此文件' };
        return;
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: {
          id: file.id,
          name: file.name,
          url: file.path,
          size: file.size,
          type: file.type,
          category: file.category,
          description: file.description,
          isExclusive: file.isExclusive,
          downloadCount: file.downloadCount,
          uploader: file.uploader ? {
            id: file.uploader.id,
            name: file.uploader.name,
            companyName: file.uploader.companyName,
            status: file.uploader.status
          } : null,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      };
    } catch (err) {
      console.error('获取文件详情失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取文件详情失败' };
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;
      
      const file = await File.findOne({
        where: { id, status: 'active' }
      });
      
      if (!file) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '文件不存在' };
        return;
      }
      
      // 检查权限：普通用户不能下载专属文件（除非是自己上传的）
      if (file.isExclusive && user.status !== 'admin' && file.userId !== user.id) {
        ctx.status = 403;
        ctx.body = { code: 403, message: '无权下载此文件' };
        return;
      }
      
      // 文件完整路径
      const filePath = path.join(__dirname, '../public', file.path);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '文件不存在或已被删除' };
        return;
      }
      
      // 更新下载次数
      await file.increment('downloadCount');
      
      // 设置响应头
      ctx.set('Content-disposition', `attachment; filename=${encodeURIComponent(file.name)}`);
      ctx.set('Content-type', file.type);
      
      // 返回文件流
      ctx.body = fs.createReadStream(filePath);
    } catch (err) {
      console.error('文件下载失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '文件下载失败' };
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;
      
      const file = await File.findOne({
        where: { id, status: 'active' }
      });
      
      if (!file) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '文件不存在' };
        return;
      }
      
      // 检查权限：只有管理员或文件上传者可以删除
      if (user.status !== 'admin' && file.userId !== user.id) {
        ctx.status = 403;
        ctx.body = { code: 403, message: '无权删除此文件' };
        return;
      }
      
      // 软删除文件（更新状态）
      await file.update({ status: 'deleted' });
      
      ctx.body = {
        code: 200,
        message: '删除成功'
      };
    } catch (err) {
      console.error('文件删除失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '文件删除失败' };
    }
  }

  /**
   * 获取文件分类列表
   */
  async getCategories(ctx) {
    try {
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: ['培训资料', '法律文件', '行业报告', '项目文件']
      };
    } catch (err) {
      console.error('获取文件分类失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取文件分类失败' };
    }
  }

  /**
   * 获取用户上传的文件列表
   */
  async getUserUploadedFiles(ctx) {
    try {
      const { page = 1, limit = 10 } = ctx.query;
      const user = ctx.state.user;
      
      // 分页查询
      const offset = (page - 1) * limit;
      
      const { count, rows } = await File.findAndCountAll({
        where: { 
          userId: user.id,
          status: 'active'
        },
        order: [['createdAt', 'DESC']],
        offset,
        limit: parseInt(limit)
      });
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          files: rows.map(file => ({
            id: file.id,
            name: file.name,
            url: file.path,
            size: file.size,
            type: file.type,
            category: file.category,
            description: file.description,
            isExclusive: file.isExclusive,
            downloadCount: file.downloadCount,
            createdAt: file.createdAt
          }))
        }
      };
    } catch (err) {
      console.error('获取用户上传文件列表失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取用户上传文件列表失败' };
    }
  }
}

module.exports = new FileController(); 