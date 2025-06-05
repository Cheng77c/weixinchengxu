// utils/request.js
const baseUrl = 'http://127.0.0.1:3001';

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    const defaultHeader = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      defaultHeader['Authorization'] = `Bearer ${token}`;
    }
    
    wx.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...defaultHeader,
        ...(options.header || {})
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

module.exports = {
  request,
  baseUrl
};