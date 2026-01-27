/**
 * 模拟微信小程序 API 环境
 * 用于在 Mac 电脑本机运行测试
 */

// 模拟 wx 对象
const mockWx = {
  // 存储
  storage: {},
  
  getStorageSync(key) {
    return this.storage[key] || null;
  },
  
  setStorageSync(key, value) {
    this.storage[key] = value;
  },
  
  // 登录
  login(options) {
    setTimeout(() => {
      if (options.success) {
        options.success({ code: 'test_code_123' });
      }
    }, 100);
  },
  
  // 陀螺仪
  startGyroscope(options) {
    setTimeout(() => {
      if (options.success) {
        options.success();
      }
    }, 100);
  },
  
  stopGyroscope() {
    // 模拟停止陀螺仪
  },
  
  onGyroscopeChange(callback) {
    // 模拟陀螺仪变化
    setInterval(() => {
      callback({ x: 0.1, y: 0.05, z: 0.02 });
    }, 100);
  },
  
  // 下载文件
  downloadFile(options) {
    const downloadTask = {
      onProgressUpdate(callback) {
        // 模拟下载进度
        callback({ progress: 100 });
      },
      
      onComplete(callback) {
        // 模拟下载完成
        callback({ statusCode: 200, tempFilePath: '/mock/path/to/image.png' });
      }
    };
    
    setTimeout(() => {
      if (options.success) {
        options.success({ statusCode: 200, tempFilePath: '/mock/path/to/image.png' });
      }
    }, 100);
    
    return downloadTask;
  },
  
  // 显示提示
  showToast(options) {
    console.log('Toast:', options.title);
  },
  
  // 页面跳转
  redirectTo(options) {
    console.log('Redirect to:', options.url);
  },
  
  switchTab(options) {
    console.log('Switch tab to:', options.url);
  },
  
  // 获取保存的文件列表
  getSavedFileList(options) {
    setTimeout(() => {
      if (options.success) {
        options.success({ fileList: [] });
      }
    }, 100);
  },
  
  // 删除保存的文件
  removeSavedFile(options) {
    setTimeout(() => {
      if (options.success) {
        options.success();
      }
    }, 100);
  }
};

// 模拟微信小程序环境
function mockWxEnvironment() {
  global.wx = mockWx;
  global.App = function(config) {
    console.log('App initialized with config:', config);
  };
  global.Page = function(config) {
    console.log('Page initialized with config:', Object.keys(config));
    return config;
  };
  global.getApp = function() {
    return {
      globalData: {
        userInfo: null,
        droneStatus: {
          speed: 0,
          altitude: 0,
          direction: 0
        }
      }
    };
  };
  
  // 模拟文件系统
  global.wx.env = {
    USER_DATA_PATH: '/mock/user/data/path'
  };
}

module.exports = {
  mockWx,
  mockWxEnvironment
};
