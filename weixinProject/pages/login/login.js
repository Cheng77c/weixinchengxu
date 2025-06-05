// pages/login/login.js
const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    phoneNumber: '',
    password: '',
    name: '',
    companyName: '',
    position: '',
    contact: '',
    isLogin: true, // true为登录模式，false为注册模式
    showPassword: false, // 是否显示密码
    rememberPassword: false // 是否记住密码
  },

  onLoad() {
    // 加载记住的账号密码
    this.loadSavedCredentials();
  },

  onUnload() {
    if (this.data.timer) clearInterval(this.data.timer);
  },

  // 加载保存的账号密码
  loadSavedCredentials() {
    try {
      const savedCredentials = wx.getStorageSync('savedCredentials');
      if (savedCredentials) {
        const { phoneNumber, password, rememberPassword } = JSON.parse(savedCredentials);
        if (rememberPassword) {
          this.setData({
            phoneNumber,
            password,
            rememberPassword
          });
        }
      }
    } catch (err) {
      console.error('加载保存的账号密码失败:', err);
    }
  },

  // 保存账号密码
  saveCredentials() {
    const { phoneNumber, password, rememberPassword } = this.data;
    if (rememberPassword) {
      wx.setStorageSync('savedCredentials', JSON.stringify({
        phoneNumber,
        password,
        rememberPassword
      }));
    } else {
      wx.removeStorageSync('savedCredentials');
    }
  },

  // 切换到登录模式
  switchToLogin() {
    this.setData({ isLogin: true });
  },

  // 切换到注册模式
  switchToRegister() {
    this.setData({ isLogin: false });
  },

  // 切换密码显示/隐藏
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换记住密码
  toggleRememberPassword() {
    this.setData({
      rememberPassword: !this.data.rememberPassword
    });
  },

  handlePhoneChange(e) {
    this.setData({ phoneNumber: e.detail.value });
  },

  handlePasswordChange(e) {
    this.setData({ password: e.detail.value });
  },

  handleNameChange(e) {
    this.setData({ name: e.detail.value });
  },

  handleCompanyNameChange(e) {
    this.setData({ companyName: e.detail.value });
  },

  handlePositionChange(e) {
    this.setData({ position: e.detail.value });
  },

  handleContactChange(e) {
    this.setData({ contact: e.detail.value });
  },

  // 验证手机号格式
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 验证密码格式
  validatePassword(password) {
    return password && password.length >= 6;
  },

  // 微信登录
  async weChatLogin() {
    try {
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      const res = await request({
        url: '/auth/wechat-login',
        method: 'POST',
        data: { code }
      });
      
      wx.setStorageSync('token', res.token);
      app.globalData.userInfo = res.userInfo;
      app.globalData.isLogin = true;
      
      wx.showToast({ title: '登录成功', icon: 'success' });
      wx.reLaunch({ url: '/pages/index/index' });
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  // 提交表单（登录/注册）
  async submitForm() {
    const { phoneNumber, password, name, companyName, position, contact, isLogin } = this.data;

    if (!phoneNumber || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' });
      return;
    }

    if (!this.validatePhone(phoneNumber)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    if (!this.validatePassword(password)) {
      wx.showToast({ title: '密码长度不能少于6位', icon: 'none' });
      return;
    }

    if (!isLogin && (!name || !companyName || !position || !contact)) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      const res = await request({
        url: isLogin ? '/auth/phone-login' : '/auth/phone-register',
        method: 'POST',
        data: {
          phone: phoneNumber,
          password,
          name,
          companyName,
          position,
          contact
        }
      });
      
      // 保存登录凭证
      wx.setStorageSync('token', res.token);
      app.globalData.userInfo = res.userInfo;
      app.globalData.isLogin = true;
      
      // 如果是登录模式，根据用户选择保存账号密码
      if (isLogin) {
        this.saveCredentials();
      }
      
      wx.showToast({ title: isLogin ? '登录成功' : '注册成功', icon: 'success' });
      wx.reLaunch({ url: '/pages/index/index' });
    } catch (err) {
      wx.showToast({ 
        title: err.message || (isLogin ? '登录失败' : '注册失败'), 
        icon: 'none' 
      });
    }
  }
});