import { request } from './request';

const app = getApp();

// 资料中心相关API
const datumAPI = {
  // 获取文件分类
  getCategories: () => {
    return request({
      url: '/api/datum/categories',
      method: 'GET'
    });
  },
  
  // 按分类获取文件列表
  getFilesByCategory: (query) => {
    return request({
      url: '/api/datum/files-by-category',
      method: 'GET',
      data: { query }
    });
  },
  
  // 获取文件列表
  getFileList: (params) => {
    return request({
      url: '/api/datum/files',
      method: 'GET',
      data: params
    });
  },
  
  // 获取用户上传的文件
  getUserFiles: (params) => {
    return request({
      url: '/api/datum/my-files',
      method: 'GET',
      data: params
    });
  },
  
  // 获取文件详情
  getFileDetail: (id) => {
    return request({
      url: `/api/datum/files/${id}`,
      method: 'GET'
    });
  },
  
  // 上传文件
  uploadFile: (filePath, data) => {
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3001';
    return new Promise((resolve, reject) => {
      // 确保文件名被正确传递
      if (!data.fileName && filePath) {
        // 从文件路径中提取文件名
        const fileName = filePath.split('/').pop();
        data.fileName = fileName;
      }
      
      wx.uploadFile({
        url: `${baseUrl}/api/datum/upload`,
        filePath: filePath,
        name: 'file',
        formData: data,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            resolve(data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },
  
  // 下载文件
  downloadFile: (id) => {
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3001';
    return new Promise((resolve, reject) => {
      // 先获取文件详情
      request({
        url: `/api/datum/files/${id}`,
        method: 'GET'
      }).then(res => {
        if (res.code === 200) {
          const fileInfo = res.data;
          // 下载文件
          wx.downloadFile({
            url: `${baseUrl}/api/datum/download/${id}`,
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: (res) => {
              if (res.statusCode === 200) {
                // 保存文件到本地
                const tempFilePath = res.tempFilePath;
                // 打开文件
                wx.openDocument({
                  filePath: tempFilePath,
                  success: () => {
                    resolve({ success: true, message: '文件打开成功' });
                  },
                  fail: (error) => {
                    reject({ success: false, message: '文件打开失败', error });
                  }
                });
              } else {
                reject({ success: false, message: '文件下载失败', error: res });
              }
            },
            fail: (error) => {
              reject({ success: false, message: '文件下载失败', error });
            }
          });
        } else {
          reject({ success: false, message: res.message });
        }
      }).catch(reject);
    });
  },
  
  // 删除文件
  deleteFile: (id) => {
    return request({
      url: `/api/datum/files/${id}`,
      method: 'DELETE'
    });
  }
};

// 导出所有API
export {
  datumAPI
}; 