// projectDetail.js
import { request, baseUrl } from '../../utils/request';
import { formatDate, formatFileSize } from '../../utils/util';

Page({
  data: {
    id: null,
    project: {},
    reports: [],
    reportFile: null,
    reportFileName: '',
    progressValue: 0,
    statusMap: {
      'pending': '待审核',
      'approved': '已通过',
      'rejected': '已拒绝',
      'in_progress': '进行中',
      'completed': '已完成'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      });
      this.loadProjectDetail(options.id);
      this.loadReports(options.id);
    } else {
      wx.showToast({
        title: '项目ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onPullDownRefresh() {
    const { id } = this.data;
    Promise.all([
      this.loadProjectDetail(id),
      this.loadReports(id)
    ]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载项目详情
  loadProjectDetail(id) {
    return request({
      url: `/api/project/detail/${id}`,
      method: 'GET'
    }).then(res => {
      if (res.code === 200) {
        const project = res.data;
        // 处理日期格式
        project.createdAt = formatDate(new Date(project.createdAt));
        if (project.reviewedAt) {
          project.reviewedAt = formatDate(new Date(project.reviewedAt));
        }
        
        // 处理进度值
        const progressValue = parseInt(project.progress || '0%');
        
        this.setData({
          project,
          progressValue
        });
      } else {
        wx.showToast({
          title: res.message || '获取项目详情失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    });
  },

  // 加载项目报告
  loadReports(projectId) {
    return request({
      url: '/api/project/report/list',
      method: 'GET',
      data: {
        projectId
      }
    }).then(res => {
      if (res.code === 200) {
        const reports = res.data.list.map(item => {
          // 处理日期格式
          item.createdAt = formatDate(new Date(item.createdAt));
          // 处理文件大小显示
          if (item.fileSize) {
            item.fileSizeText = formatFileSize(item.fileSize);
          }
          return item;
        });
        
        this.setData({
          reports
        });
      } else {
        wx.showToast({
          title: res.message || '获取项目报告失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    });
  },

  // 进度条变化
  progressChange(e) {
    this.setData({
      progressValue: e.detail.value
    });
  },

  // 更新项目进度
  updateProgress() {
    const { id, progressValue } = this.data;
    
    request({
      url: `/api/project/progress/${id}`,
      method: 'PUT',
      data: {
        progress: `${progressValue}%`
      }
    }).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '进度更新成功',
          icon: 'success'
        });
        
        // 更新项目信息
        this.setData({
          'project.progress': `${progressValue}%`,
          'project.status': 'in_progress'
        });
      } else {
        wx.showToast({
          title: res.message || '更新进度失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    });
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          reportFile: file.path,
          reportFileName: file.name
        });
      }
    });
  },

  // 提交报告
  submitReport() {
    const { id, reportFile } = this.data;
    
    if (!reportFile) {
      wx.showToast({
        title: '请选择报告文件',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '上传中...'
    });
    
    wx.uploadFile({
      url: baseUrl + '/api/project/report',
      filePath: reportFile,
      name: 'file',
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      formData: {
        projectId: id,
        reportTitle: '项目进度报告'
      },
      success: (res) => {
        wx.hideLoading();
        const result = JSON.parse(res.data);
        
        if (result.code === 200) {
          wx.showToast({
            title: '报告提交成功',
            icon: 'success'
          });
          
          this.setData({
            reportFile: null,
            reportFileName: ''
          });
          
          // 重新加载报告列表
          this.loadReports(id);
        } else {
          wx.showToast({
            title: result.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 下载文件
  downloadFile(e) {
    const { url, name } = e.currentTarget.dataset;
    
    if (!url) {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '正在打开文件...'
    });
    
    // 微信小程序不能直接下载文件，但可以预览
    wx.downloadFile({
      url: baseUrl + url,
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath;
          
          // 根据文件类型选择不同的打开方式
          const fileType = this.getFileType(name);
          
          if (fileType === 'image') {
            wx.previewImage({
              urls: [filePath]
            });
          } else if (fileType === 'video') {
            wx.openVideoPlayer({
              videoSrc: filePath
            });
          } else {
            wx.openDocument({
              filePath: filePath,
              showMenu: true,
              success: () => {
                console.log('打开文档成功');
              },
              fail: (error) => {
                console.error('打开文档失败', error);
                wx.showToast({
                  title: '无法打开此类型文件',
                  icon: 'none'
                });
              }
            });
          }
        } else {
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取文件类型
  getFileType(fileName) {
    if (!fileName) return 'other';
    
    const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return 'image';
    } else if (['mp4', 'mov', 'avi', 'wmv'].includes(ext)) {
      return 'video';
    } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'txt'].includes(ext)) {
      return 'document';
    } else {
      return 'other';
    }
  }
}); 