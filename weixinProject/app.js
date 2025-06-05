// app.js
const request = require('./utils/request');

App({
  onLaunch() {
    this.checkLoginStatus();
  },
  
  async checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      try {
        const userInfo = await this.getUserInfo();
        if (userInfo) {
          this.globalData.userInfo = userInfo;
          this.globalData.isLogin = true;
        }
      } catch (err) {
        console.error('自动登录失败', err);
        this.clearLoginStatus();
      }
    }
  },
  
  async getUserInfo() {
    try {
      const res = await request({
        url: '/auth/user-info',
        method: 'GET'
      });
      
      if (res.code === 200 && res.data) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('获取用户信息失败', err);
      throw err;
    }
  },
  
  clearLoginStatus() {
    wx.removeStorageSync('token');
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
  },
  
  globalData: {
    userInfo: null,
    isLogin: false,
    baseUrl: 'http://localhost:3001'
  }
});