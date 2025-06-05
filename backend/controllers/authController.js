// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { Op } = require('sequelize');
const User = require('../models/user');
const VerificationCode = require('../models/verificationCode');
const config = require('../config');

// 生成验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
      }

// 生成JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, phone: user.phone },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

// 发送验证码
async function sendVerificationCode(ctx) {
  const { phone } = ctx.request.body;
  
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    ctx.status = 400;
    ctx.body = { message: '无效的手机号' };
    return;
  }

  try {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期

    await VerificationCode.create({
      phone,
      code,
      expiresAt
    });

    // TODO: 调用短信服务发送验证码
    console.log(`验证码: ${code}`); // 开发环境打印验证码

    ctx.body = { message: '验证码已发送' };
  } catch (error) {
    console.error('发送验证码失败:', error);
    ctx.status = 500;
    ctx.body = { message: '发送验证码失败' };
  }
}

// 手机号密码登录
const phoneLogin = async (ctx) => {
  const { phone, password } = ctx.request.body;

  try {
    // 查找用户
    const user = await User.findOne({ where: { phone } });
      if (!user) {
      ctx.status = 401;
      ctx.body = { message: '用户不存在' };
      return;
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { message: '密码错误' };
      return;
      }

    // 生成token
    const token = generateToken(user);
      
    // 返回用户信息和token
      ctx.body = {
          token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        companyName: user.companyName,
        position: user.position,
        contact: user.contact,
        avatarUrl: user.avatarUrl
        }
      };
  } catch (err) {
    console.error('登录失败:', err);
    ctx.status = 500;
    ctx.body = { message: '登录失败，请重试' };
    }
};

// 手机号注册
const phoneRegister = async (ctx) => {
  const { phone, password, name, companyName, position, contact } = ctx.request.body;
    
  try {
    // 检查手机号是否已注册
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { message: '该手机号已注册' };
      return;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = await User.create({
      phone,
      password: hashedPassword,
      name,
      companyName,
      position,
      contact
    });

    // 生成token
    const token = generateToken(user);

    // 返回用户信息和token
    ctx.body = {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        companyName: user.companyName,
        position: user.position,
        contact: user.contact,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (err) {
    console.error('注册失败:', err);
    ctx.status = 500;
    ctx.body = { message: '注册失败，请重试' };
  }
};

// 微信登录
const wechatLogin = async (ctx) => {
  const { code } = ctx.request.body;

  try {
    // 获取微信用户信息
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.wxAppId,
        secret: config.wxAppSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = wxResponse.data;
    if (!openid) {
      ctx.status = 400;
      ctx.body = { message: '微信登录失败' };
      return;
    }

    // 查找或创建用户
    let user = await User.findOne({ where: { openid } });
    if (!user) {
      // 创建新用户
      user = await User.create({
        openid,
        phone: '', // 微信登录时手机号为空
        password: '', // 微信登录时密码为空
        name: '',
        companyName: '',
        position: '',
        contact: ''
      });
  }

    // 生成token
    const token = generateToken(user);

    // 返回用户信息和token
    ctx.body = {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        companyName: user.companyName,
        position: user.position,
        contact: user.contact,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (err) {
    console.error('微信登录失败:', err);
    ctx.status = 500;
    ctx.body = { message: '微信登录失败，请重试' };
      }
    };

// 获取用户信息
const getUserInfo = async (ctx) => {
  try {
    const user = await User.findByPk(ctx.state.user.id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户不存在' };
      return;
    }

    ctx.body = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      companyName: user.companyName,
      position: user.position,
      contact: user.contact,
      avatarUrl: user.avatarUrl
    };
  } catch (err) {
    console.error('获取用户信息失败:', err);
    ctx.status = 500;
    ctx.body = { message: '获取用户信息失败' };
  }
};

module.exports = {
  sendVerificationCode,
  phoneLogin,
  phoneRegister,
  wechatLogin,
  getUserInfo
};