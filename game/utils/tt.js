const TT = {
  get isTt() {
    return typeof tt !== 'undefined';
  },

  get isWx() {
    return typeof wx !== 'undefined';
  },

  get isNode() {
    return typeof require === 'function' && typeof module !== 'undefined';
  },

  get platform() {
    if (this.isTt) return 'tt';
    if (this.isWx) return 'wx';
    if (this.isNode) return 'node';
    return 'unknown';
  },

  getFileSystemManager() {
    if (this.isTt && tt.getFileSystemManager) {
      return tt.getFileSystemManager();
    }
    if (this.isWx && wx.getFileSystemManager) {
      return wx.getFileSystemManager();
    }
    if (this.isNode) {
      const fs = require('fs');
      return {
        mkdir: (options) => {
          try {
            fs.mkdirSync(options.dirPath, { recursive: true });
            options.success && options.success();
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        },
        readdir: (options) => {
          try {
            const files = fs.readdirSync(options.dirPath);
            options.success && options.success({ files });
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        },
        writeFile: (options) => {
          try {
            fs.writeFileSync(options.filePath, options.data, options.encoding || 'utf8');
            options.success && options.success();
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        },
        unlink: (options) => {
          try {
            fs.unlinkSync(options.filePath);
            options.success && options.success();
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        },
        stat: (options) => {
          try {
            const stats = fs.statSync(options.path);
            options.success && options.success({ stats });
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        },
        access: (options) => {
          try {
            fs.accessSync(options.path);
            options.success && options.success();
          } catch (e) {
            options.fail && options.fail({ errMsg: e.message });
          }
        }
      };
    }
    return null;
  },

  showToast(options) {
    const api = this._getApi();
    if (api && api.showToast) {
      return api.showToast(options);
    }
    console.log('[showToast]', options.title);
  },

  showModal(options) {
    const api = this._getApi();
    if (api && api.showModal) {
      return api.showModal(options);
    }
    console.log('[showModal]', options.title, options.content);
    if (options.success) {
      options.success({ confirm: true });
    }
  },

  navigateTo(options) {
    const api = this._getApi();
    if (api && api.navigateTo) {
      return api.navigateTo(options);
    }
    console.log('[navigateTo]', options.url);
  },

  navigateBack(options) {
    const api = this._getApi();
    if (api && api.navigateBack) {
      return api.navigateBack(options);
    }
    console.log('[navigateBack]');
  },

  redirectTo(options) {
    const api = this._getApi();
    if (api && api.redirectTo) {
      return api.redirectTo(options);
    }
    console.log('[redirectTo]', options.url);
  },

  reLaunch(options) {
    const api = this._getApi();
    if (api && api.reLaunch) {
      return api.reLaunch(options);
    }
    console.log('[reLaunch]', options.url);
  },

  onHide(callback) {
    const api = this._getApi();
    if (api && api.onHide) {
      return api.onHide(callback);
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('hide', callback);
    }
  },

  onShow(callback) {
    const api = this._getApi();
    if (api && api.onShow) {
      return api.onShow(callback);
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('show', callback);
    }
  },

  getSystemInfoSync() {
    const api = this._getApi();
    if (api && api.getSystemInfoSync) {
      return api.getSystemInfoSync();
    }
    return {
      platform: 'unknown',
      screenWidth: 375,
      screenHeight: 667,
      pixelRatio: 2
    };
  },

  getStorage(options) {
    const api = this._getApi();
    if (api && api.getStorage) {
      return api.getStorage(options);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(options.key);
        options.success && options.success({ data: data ? JSON.parse(data) : null });
      } catch (e) {
        options.fail && options.fail({ errMsg: e.message });
      }
    }
  },

  setStorage(options) {
    const api = this._getApi();
    if (api && api.setStorage) {
      return api.setStorage(options);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(options.key, JSON.stringify(options.data));
        options.success && options.success();
      } catch (e) {
        options.fail && options.fail({ errMsg: e.message });
      }
    }
  },

  getUserDataPath() {
    if (this.isTt) {
      return 'ttfile://user';
    }
    if (this.isWx) {
      return 'wxfile://user';
    }
    if (this.isNode) {
      const path = require('path');
      return path.join(__dirname, '../../');
    }
    return './';
  },

  _getApi() {
    if (this.isTt) return tt;
    if (this.isWx) return wx;
    return null;
  }
};

module.exports = TT;
