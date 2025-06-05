const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user');
const config = require('../config');

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      phone: user.phone,
      name: user.name
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// 格式化用户信息，去除敏感字段
const formatUserInfo = (user) => {
  const { password, ...userInfo } = user.toJSON();
  return userInfo;
};

class AuthController {
  /**
   * 手机号密码登录
   */
  async phoneLogin(ctx) {
    const { phone, password } = ctx.request.body;
    
    // 验证请求参数
    if (!phone || !password) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '手机号和密码不能为空' };
      return;
    }
    
    try {
      // 查找用户
      const user = await User.findOne({ where: { phone } });
      
      // 用户不存在
      if (!user) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '用户不存在' };
        return;
      }
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '密码错误' };
        return;
      }
      
      // 生成JWT令牌
      const token = generateToken(user);
      
      // 返回用户信息和令牌
      ctx.body = {
        code: 200,
        message: '登录成功',
        token,
        userInfo: formatUserInfo(user)
      };
    } catch (err) {
      console.error('登录失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '登录失败，请稍后重试' };
    }
  }
  
  /**
   * 手机号注册
   */
  async phoneRegister(ctx) {
    const { phone, password, name, companyName, position, contact } = ctx.request.body;
    
    // 验证请求参数
    if (!phone || !password || !name || !companyName || !position || !contact) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '请填写完整的注册信息' };
      return;
    }
    
    try {
      // 检查手机号是否已注册
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '该手机号已注册' };
        return;
      }
      
      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await User.create({
        phone,
        password: hashedPassword,
        name,
        companyName,
        position,
        contact
      });
      
      // 生成JWT令牌
      const token = generateToken(user);
      
      // 返回用户信息和令牌
      ctx.body = {
        code: 200,
        message: '注册成功',
        token,
        userInfo: formatUserInfo(user)
      };
    } catch (err) {
      console.error('注册失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '注册失败，请稍后重试' };
    }
  }
  
  /**
   * 微信登录
   */
  async wechatLogin(ctx) {
    const { code } = ctx.request.body;
    
    if (!code) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '微信授权码不能为空' };
      return;
    }
    
    try {
      // 获取微信openid
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appid}&secret=${config.wechat.secret}&js_code=${code}&grant_type=authorization_code`;
      const response = await axios.get(url);
      
      if (response.data.errcode) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '微信授权失败' };
        return;
      }
      
      const { openid } = response.data;
      
      // 查找或创建用户
      let user = await User.findOne({ where: { openid } });
      
      if (!user) {
        // 用户不存在，返回需要绑定手机号的状态
        ctx.body = {
          code: 201,
          message: '需要绑定手机号',
          openid
        };
        return;
      }
      
      // 生成JWT令牌
      const token = generateToken(user);
      
      // 返回用户信息和令牌
      ctx.body = {
        code: 200,
        message: '登录成功',
        token,
        userInfo: formatUserInfo(user)
      };
    } catch (err) {
      console.error('微信登录失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '微信登录失败，请稍后重试' };
    }
  }
  
  /**
   * 绑定微信和手机号
   */
  async bindWechat(ctx) {
    const { openid, phone, password, name, companyName, position, contact } = ctx.request.body;
    
    // 验证请求参数
    if (!openid || !phone || !password || !name || !companyName || !position || !contact) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '请填写完整的信息' };
      return;
    }
    
    try {
      // 检查手机号是否已注册
      let user = await User.findOne({ where: { phone } });
      
      if (user) {
        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          ctx.status = 400;
          ctx.body = { code: 400, message: '密码错误' };
          return;
        }
        
        // 更新openid
        user.openid = openid;
        await user.save();
      } else {
        // 创建新用户
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          phone,
          password: hashedPassword,
          name,
          companyName,
          position,
          contact,
          openid
        });
      }
      
      // 生成JWT令牌
      const token = generateToken(user);
      
      // 返回用户信息和令牌
      ctx.body = {
        code: 200,
        message: '绑定成功',
        token,
        userInfo: formatUserInfo(user)
      };
    } catch (err) {
      console.error('绑定失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '绑定失败，请稍后重试' };
    }
  }
  
  /**
   * 获取用户信息
   */
  async getUserInfo(ctx) {
    try {
      const userId = ctx.state.user.id;
      const user = await User.findByPk(userId);
      
      if (!user) {
        ctx.status = 404;
        ctx.body = { code: 404, message: '用户不存在' };
        return;
      }
      
      ctx.body = {
        code: 200,
        message: '获取成功',
        userInfo: formatUserInfo(user)
      };
    } catch (err) {
      console.error('获取用户信息失败:', err);
      ctx.status = 500;
      ctx.body = { code: 500, message: '获取用户信息失败' };
    }
  }
}

module.exports = new AuthController(); 