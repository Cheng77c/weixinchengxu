const bcrypt = require('bcryptjs');
const User = require('../models/user');

class UserController {
  /**
   * 更新用户个人资料
   */
  async updateProfile(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { name, companyName, position, contact } = ctx.request.body;
      
      // 验证请求参数
      if (!name) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '姓名不能为空' };
        return;
      }
      
      // 查找用户
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '用户不存在' };
        return;
      }
      
      // 更新用户信息
      user.name = name;
      if (companyName) user.companyName = companyName;
      if (position) user.position = position;
      if (contact) user.contact = contact;
      
      await user.save();
      
      // 返回更新后的用户信息
      const { password, ...userInfo } = user.toJSON();
      
      ctx.body = {
        code: 200,
        message: '更新成功',
        userInfo
      };
    } catch (err) {
      console.error('更新个人资料失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '更新个人资料失败' };
    }
  }
  
  /**
   * 修改密码
   */
  async changePassword(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { oldPassword, newPassword } = ctx.request.body;
      
      // 验证请求参数
      if (!oldPassword || !newPassword) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '原密码和新密码不能为空' };
        return;
      }
      
      if (newPassword.length < 6) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '新密码长度不能少于6位' };
        return;
      }
      
      // 查找用户
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '用户不存在' };
        return;
      }
      
      // 验证原密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '原密码错误' };
        return;
      }
      
      // 检查新密码是否与原密码相同
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '新密码不能与原密码相同' };
        return;
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新密码
      user.password = hashedPassword;
      await user.save();
      
      ctx.body = {
        code: 200,
        message: '密码修改成功'
      };
    } catch (err) {
      console.error('修改密码失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '修改密码失败' };
    }
  }
}

module.exports = new UserController(); 