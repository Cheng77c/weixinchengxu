import { datumAPI } from '../../utils/api';

const app = getApp();

// 根据文件名或MIME类型确定文件类型
const getFileType = (fileName, mimeType) => {
  const ext = fileName.split('.').pop().toLowerCase();
  
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext) || 
      (mimeType && mimeType.startsWith('image/'))) {
    return 'image';
  }
  
  // 文本文件
  if (['txt', 'doc', 'docx', 'md', 'rtf'].includes(ext) || 
      (mimeType && mimeType.startsWith('text/'))) {
    return 'text';
  }
  
  // 视频文件
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext) || 
      (mimeType && mimeType.startsWith('video/'))) {
    return 'video';
  }
  
  // 音频文件
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext) || 
      (mimeType && mimeType.startsWith('audio/'))) {
    return 'audio';
  }
  
  // 默认为应用/文档类型
  return 'application';
};

// 格式化文件大小的wxs过滤器
const wxs = `
module.exports = {
  formatFileSize: function(size) {
    if (!size && size !== 0) return '';
    size = Number(size);
    if (isNaN(size)) return '';
    
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
  }
};
`;

// 注册wxs过滤器
wx.setStorageSync('datumCenterWxs', wxs);

Page({
  data: {
    fileCategories: ['培训资料', '法律文件', '行业报告', '项目文件'],  // 资料分类
    categoryFiles: {},  // 按分类存储的文件列表
    myFiles: [],  // 用户上传的文件列表
    userInfo: null,  // 当前用户信息
    viewMode: 'category',  // 查看模式：category-分类浏览，myUploads-我的上传
    currentCategory: '',  // 当前选中的分类
    searchQuery: '',  // 搜索关键词
    
    // 上传相关
    showUploadModal: false,  // 是否显示上传弹窗
    categoryIndex: 0,  // 选择的分类索引
    description: '',  // 文件描述
    isExclusive: false,  // 是否为专属文件
    selectedFile: null,  // 选择的文件
  },

  onLoad: function () {
    // 获取用户信息
    this.getUserInfo();
    
    // 获取文件分类列表
    this.loadCategories();
    
    // 按分类加载文件
    this.loadFilesByCategory();
  },

  onPullDownRefresh: function() {
    // 下拉刷新
    if (this.data.viewMode === 'category') {
      this.loadFilesByCategory();
    } else {
      this.loadMyFiles();
    }
    wx.stopPullDownRefresh();
  },
  
  // 获取用户信息
  getUserInfo: function() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 加载文件分类
  loadCategories: function() {
    datumAPI.getCategories().then(res => {
      if (res.code === 200) {
        this.setData({ fileCategories: res.data });
      }
    }).catch(err => {
      console.error('获取文件分类失败', err);
    });
  },
  
  // 按分类加载文件列表
  loadFilesByCategory: function() {
    wx.showLoading({ title: '加载中' });
    
    datumAPI.getFilesByCategory(this.data.searchQuery).then(res => {
      if (res.code === 200) {
        console.log('获取到的文件数据:', JSON.stringify(res.data));
        this.setData({
          categoryFiles: res.data.files,
          fileCategories: res.data.categories || this.data.fileCategories
        });
      }
      wx.hideLoading();
    }).catch(err => {
      console.error('获取文件列表失败', err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },
  
  // 加载用户上传的文件
  loadMyFiles: function() {
    wx.showLoading({ title: '加载中' });
    
    datumAPI.getUserFiles().then(res => {
      if (res.code === 200) {
        console.log('获取到的我的文件数据:', JSON.stringify(res.data));
        this.setData({ myFiles: res.data.files });
      }
      wx.hideLoading();
    }).catch(err => {
      console.error('获取我的文件失败', err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    
    // 如果点击当前选中的分类，则取消选中
    if (category === this.data.currentCategory) {
      this.setData({ currentCategory: '' });
    } else {
      this.setData({ currentCategory: category });
    }
  },
  
  // 切换查看模式
  switchViewMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ viewMode: mode });
    
    if (mode === 'myUploads' && this.data.myFiles.length === 0) {
      this.loadMyFiles();
    }
  },
  
  // 处理搜索
  handleSearch: function(e) {
    const query = e.detail.value.trim();
    this.setData({ searchQuery: query });
    
    if (this.data.viewMode === 'category') {
      this.loadFilesByCategory();
    }
  },
  
  // 处理上传按钮点击
  handleUpload: function() {
    // 检查用户是否登录
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showUploadModal: true,
      categoryIndex: 0,
      description: '',
      isExclusive: false,
      selectedFile: null
    });
  },

  // 关闭上传弹窗
  closeUploadModal: function() {
    this.setData({ showUploadModal: false });
  },
  
  // 处理分类选择
  handleCategoryChange: function(e) {
    this.setData({ categoryIndex: e.detail.value });
  },
  
  // 处理描述输入
  handleDescriptionInput: function(e) {
    this.setData({ description: e.detail.value });
  },
  
  // 切换专属文件状态
  toggleExclusive: function() {
    this.setData({ isExclusive: !this.data.isExclusive });
  },
  
  // 选择文件
  selectFile: function() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'docx', 'xlsx', 'jpg', 'png', 'ppt', 'pptx'],
      success: res => {
        const file = res.tempFiles[0];
        // 添加文件类型
        file.type = getFileType(file.name, file.type);
        this.setData({ selectedFile: file });
      }
    });
  },
  
  // 确认上传
  confirmUpload: function() {
    if (!this.data.selectedFile) {
      wx.showToast({ title: '请选择文件', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '上传中' });
    
    const category = this.data.fileCategories[this.data.categoryIndex];
    const formData = {
      category: category,
      description: this.data.description,
      isExclusive: this.data.isExclusive,
      fileType: this.data.selectedFile.type || getFileType(this.data.selectedFile.name),
      fileName: this.data.selectedFile.name
    };
    
    console.log('上传文件信息:', {
      path: this.data.selectedFile.path,
      name: this.data.selectedFile.name,
      size: this.data.selectedFile.size
    });
    
    datumAPI.uploadFile(this.data.selectedFile.path, formData).then(res => {
      if (res.code === 200) {
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
        this.closeUploadModal();
        
        // 刷新文件列表
        this.loadFilesByCategory();
        if (this.data.viewMode === 'myUploads') {
          this.loadMyFiles();
        }
      } else {
        wx.hideLoading();
        wx.showToast({ title: res.message || '上传失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('文件上传失败', err);
      wx.hideLoading();
      wx.showToast({ title: '上传失败', icon: 'none' });
    });
  },

  // 处理文件下载
  handleDownload: function(e) {
    const fileId = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '下载中' });
    
    datumAPI.downloadFile(fileId).then(res => {
      wx.hideLoading();
      if (res.success) {
        wx.showToast({ title: '下载成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.message || '下载失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('文件下载失败', err);
      wx.hideLoading();
      wx.showToast({ title: '下载失败', icon: 'none' });
    });
  },

  // 处理文件删除
  handleDelete: function(e) {
    const fileId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此文件吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' });
          
          datumAPI.deleteFile(fileId).then(res => {
            wx.hideLoading();
            if (res.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              
              // 刷新文件列表
              if (this.data.viewMode === 'category') {
                this.loadFilesByCategory();
              } else {
                this.loadMyFiles();
              }
            } else {
              wx.showToast({ title: res.message || '删除失败', icon: 'none' });
            }
          }).catch(err => {
            console.error('文件删除失败', err);
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },
  
  // 格式化文件大小
  formatFileSize: function(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
  }
});
