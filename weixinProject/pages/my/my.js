const app = getApp();
const { request } = require('../../utils/request');

Page({
  data: {
    userInfo: {},
    isLoggedIn: false
  },
  
  onLoad() {
    this.checkLoginStatus();
  },
  
  onShow() {
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.setData({ isLoggedIn: true });
      this.getUserInfo();
    } else {
      this.setData({ 
        isLoggedIn: false,
        userInfo: {}
      });
    }
  },
  
  // 获取用户信息
  async getUserInfo() {
    try {
      const res = await request({
        url: '/auth/user-info',
        method: 'GET'
      });
      
      if (res.code === 200) {
        this.setData({
          userInfo: res.userInfo
        });
        app.globalData.userInfo = res.userInfo;
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
      if (err.statusCode === 401) {
        // token过期，清除登录状态
        this.logout();
      }
    }
  },
  
  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 跳转到编辑资料页面
  editProfile() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    wx.navigateTo({
      url: '/pages/profile/edit'
    });
  },
  
  // 跳转到修改密码页面
  changePassword() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    wx.navigateTo({
      url: '/pages/password/change'
    });
  },
  
  // 跳转到系统设置页面
  goToSettings() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },
  
  // 联系我们
  contactUs() {
    wx.showModal({
      title: '联系我们',
      content: '客服电话：400-123-4567\n邮箱：support@example.com',
      showCancel: false
    });
  },
  
  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '微信小程序演示版本\n版本号：1.0.0\n©2025 版权所有',
      showCancel: false
    });
  },
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token和用户信息
          wx.removeStorageSync('token');
          app.globalData.userInfo = null;
          app.globalData.isLogin = false;
          
          this.setData({
            isLoggedIn: false,
            userInfo: {}
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
})
