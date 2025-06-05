// 获取应用实例
const app = getApp();
const { request, baseUrl } = require('../../utils/request');

Page({
  data: {
    companyName: '',
    contactName: '',
    contactPhone: '',
    companyDesc: '',
    intentionDesc: '',
    fileList: [],
    applyStatus: '',
    applications: [],
    currentTab: 'form', // 'form', 'list', 'detail'
    currentDetail: null,
    loading: false
  },

  onLoad: function () {
    // 如果用户已登录，获取申请状态
    if (app.globalData.isLogin) {
      this.fetchApplicationStats();
    }
  },

  onShow: function () {
    if (app.globalData.isLogin && this.data.currentTab === 'list') {
      this.fetchApplicationList();
    }
  },

  // 输入框内容变化处理
  onInputChange: function (e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
    });
  },

  // 文件上传处理
  onFileChange: function (e) {
    const { fileList = [] } = e.detail;
    this.setData({
      fileList
    });
  },

  // 选择文件
  chooseFile: function () {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => ({
          name: file.name || file.path.split('/').pop(),
          size: file.size,
          type: this.getFileType(file.name || file.path),
          url: file.path
        }));
        
        const fileList = [...this.data.fileList, ...tempFiles];
        this.setData({ fileList });
      }
    });
  },

  // 获取文件类型
  getFileType: function (fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
    
    if (imageExts.includes(ext)) {
      return 'image/' + ext;
    } else if (docExts.includes(ext)) {
      if (ext === 'pdf') return 'application/pdf';
      if (ext === 'txt') return 'text/plain';
      if (ext.startsWith('doc')) return 'application/msword';
      if (ext.startsWith('xls')) return 'application/vnd.ms-excel';
      if (ext.startsWith('ppt')) return 'application/vnd.ms-powerpoint';
      return 'application/octet-stream';
    } else {
      return 'application/octet-stream';
    }
  },

  // 切换标签页
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });

    if (tab === 'list' && app.globalData.isLogin) {
      this.fetchApplicationList();
    }
  },

  // 提交申请
  onSubmit: async function () {
    const { companyName, contactName, contactPhone, companyDesc, intentionDesc, fileList } = this.data;

    // 表单验证
    if (!companyName || !contactName || !contactPhone || !companyDesc || !intentionDesc) {
      wx.showToast({
        title: '请填写所有必填项',
        icon: 'none',
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
      wx.showToast({
        title: '请输入有效的电话号码',
        icon: 'none',
      });
      return;
    }

    // 检查登录状态
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再提交申请',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '提交中...' });

    try {
      // 准备表单数据
      const formData = {
        companyName,
        contactName,
        contactPhone,
        companyDesc,
        intentionDesc
      };

      // 上传文件
      let uploadedFiles = [];
      if (fileList.length > 0) {
        uploadedFiles = await this.uploadFiles(fileList);
      }

      // 提交申请
      const result = await request({
        url: '/api/cooperate/apply',
        method: 'POST',
        data: {
          ...formData,
          attachments: uploadedFiles
        }
      });

      if (result.code === 200) {
        wx.hideLoading();
        this.setData({
          applyStatus: '待审核',
          loading: false,
          // 清空表单
          companyName: '',
          contactName: '',
          contactPhone: '',
          companyDesc: '',
          intentionDesc: '',
          fileList: []
        });
        
        wx.showToast({
          title: '提交成功',
          icon: 'success',
        });
        
        // 切换到列表页
        setTimeout(() => {
          this.setData({ currentTab: 'list' });
          this.fetchApplicationList();
        }, 1500);
      }
    } catch (error) {
      console.error('提交申请失败:', error);
      wx.hideLoading();
      this.setData({ loading: false });
      wx.showToast({
        title: '提交失败，请稍后重试',
        icon: 'none',
      });
    }
  },

  // 上传文件
  uploadFiles: async function (files) {
    const uploadedFiles = [];
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3001';
    
    for (const file of files) {
      try {
        const result = await new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${baseUrl}/api/upload`,
            filePath: file.url,
            name: 'file',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: (res) => {
              const data = JSON.parse(res.data);
              if (data.code === 200) {
                // 添加文件类型信息
                const fileInfo = {
                  ...data.data,
                  name: file.name,
                  type: file.type
                };
                resolve(fileInfo);
              } else {
                reject(new Error(data.message || '上传失败'));
              }
            },
            fail: reject
          });
        });
        uploadedFiles.push(result);
      } catch (error) {
        console.error('文件上传失败:', error);
      }
    }
    return uploadedFiles;
  },

  // 获取申请列表
  fetchApplicationList: async function () {
    this.setData({ loading: true });
    try {
      const result = await request({
        url: '/api/cooperate/list',
        method: 'GET'
      });

      if (result.code === 200) {
        this.setData({
          applications: result.data.list || [],
          loading: false
        });
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '获取申请列表失败',
        icon: 'none'
      });
    }
  },

  // 获取申请统计
  fetchApplicationStats: async function () {
    try {
      const result = await request({
        url: '/api/cooperate/stats',
        method: 'GET'
      });

      if (result.code === 200) {
        // 更新申请状态
        const stats = result.data;
        if (stats.pending > 0) {
          this.setData({ applyStatus: '有待审核的申请' });
        } else if (stats.reviewing > 0) {
          this.setData({ applyStatus: '有正在审核的申请' });
        } else if (stats.approved > 0) {
          this.setData({ applyStatus: '有已通过的申请' });
        } else if (stats.rejected > 0) {
          this.setData({ applyStatus: '有被拒绝的申请' });
        } else {
          this.setData({ applyStatus: '暂无申请记录' });
        }
      }
    } catch (error) {
      console.error('获取申请统计失败:', error);
    }
  },

  // 查看申请详情
  viewDetail: async function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ loading: true });

    try {
      const result = await request({
        url: `/api/cooperate/detail/${id}`,
        method: 'GET'
      });

      if (result.code === 200) {
        // 处理附件大小显示
        if (result.data.attachments && result.data.attachments.length > 0) {
          result.data.attachments = result.data.attachments.map(item => {
            return this.formatFileSize(item);
          });
        }
        
        this.setData({
          currentDetail: result.data,
          currentTab: 'detail',
          loading: false
        });
      }
    } catch (error) {
      console.error('获取申请详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '获取申请详情失败',
        icon: 'none'
      });
    }
  },

  // 格式化文件大小
  formatFileSize: function(file) {
    const size = file.size;
    if (!size) {
      file.sizeText = '未知';
      file.sizeUnit = '';
      return file;
    }
    
    if (size < 1024) {
      file.sizeText = size;
      file.sizeUnit = 'B';
    } else if (size < 1024 * 1024) {
      file.sizeText = (size / 1024).toFixed(2);
      file.sizeUnit = 'KB';
    } else {
      file.sizeText = (size / (1024 * 1024)).toFixed(2);
      file.sizeUnit = 'MB';
    }
    
    return file;
  },

  // 取消申请
  cancelApplication: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此申请吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          try {
            const result = await request({
              url: `/api/cooperate/${id}`,
              method: 'DELETE'
            });

            if (result.code === 200) {
              wx.showToast({
                title: '已取消申请',
                icon: 'success'
              });
              
              // 刷新列表
              this.fetchApplicationList();
              this.fetchApplicationStats();
              
              // 如果在详情页，返回列表页
              if (this.data.currentTab === 'detail') {
                this.setData({ currentTab: 'list' });
              }
            }
          } catch (error) {
            console.error('取消申请失败:', error);
            this.setData({ loading: false });
            wx.showToast({
              title: '取消申请失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 返回列表
  backToList: function () {
    this.setData({ currentTab: 'list' });
  },

  // 查询进度
  onCheckStatus: function () {
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再查询申请进度',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    this.setData({ currentTab: 'list' });
    this.fetchApplicationList();
  },

  // 查看历史记录
  onViewHistory: function () {
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再查看历史记录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    this.setData({ currentTab: 'list' });
    this.fetchApplicationList();
  },

  // 删除文件
  deleteFile: function(e) {
    const index = e.currentTarget.dataset.index;
    const fileList = [...this.data.fileList];
    fileList.splice(index, 1);
    this.setData({ fileList });
  },

  // 下载文件
  downloadFile: function(e) {
    const { url, name } = e.currentTarget.dataset;
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3001';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    wx.showLoading({
      title: '正在下载...',
    });
    
    wx.downloadFile({
      url: fullUrl,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({
            title: '下载成功',
            icon: 'success'
          });
          
          // 打开文件
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: function() {
              console.log('打开文件成功');
            },
            fail: function(error) {
              console.error('打开文件失败', error);
              wx.showToast({
                title: '无法打开此类型文件',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('下载文件失败:', error);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 预览文件
  previewFile: function(e) {
    const { url, type } = e.currentTarget.dataset;
    const baseUrl = app.globalData.baseUrl || 'http://127.0.0.1:3001';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    if (type && type.startsWith('image/')) {
      // 预览图片
      wx.previewImage({
        urls: [fullUrl],
        current: fullUrl
      });
    } else {
      // 对于其他类型的文件，尝试下载并打开
      this.downloadFile(e);
    }
  },
})
