class DebugLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.isTt = false;
    this.fs = null;
    this.logPath = null;
    this.logBuffer = [];
    this.init();
  }

  init() {
    try {
      if (typeof tt !== 'undefined' && tt.getFileSystemManager) {
        this.fs = tt.getFileSystemManager();
        this.isTt = true;
        this.logPath = 'ttfile://user/debug/game_debug.log';
        console.log('抖音小游戏日志系统初始化成功');
      } else if (typeof wx !== 'undefined' && wx.getFileSystemManager) {
        this.fs = wx.getFileSystemManager();
        this.logPath = 'wxfile://user/debug/game_debug.log';
        console.log('微信小程序日志系统初始化成功');
      } else if (typeof require === 'function') {
        const fs = require('fs');
        const path = require('path');
        this.fs = {
          writeFileSync: (path, content, encoding) => fs.writeFileSync(path, content, encoding),
          appendFileSync: (path, content, encoding) => fs.appendFileSync(path, content, encoding)
        };
        this.logPath = path.join(__dirname, '../../debug/game_debug.log');
        console.log('Node.js 日志系统初始化成功');
      } else {
        console.warn('无法初始化文件系统，日志将只输出到控制台');
      }
    } catch (e) {
      console.error('日志系统初始化失败:', e);
    }

    this.log('日志系统初始化');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message}`;
    this.logs.push(logEntry);
    console.error(logEntry);
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  warn(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}`;
    this.logs.push(logEntry);
    console.warn(logEntry);
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  flushLogBuffer() {
    if (this.logBuffer.length === 0 || !this.fs) return;
    try {
      const content = this.logBuffer.join('\n') + '\n';
      
      if (this.isTt) {
        this.fs.writeFile({
          filePath: this.logPath,
          data: content,
          encoding: 'utf8',
          success: () => {
            console.log('日志写入成功:', this.logPath);
            this.logBuffer = [];
          },
          fail: (err) => {
            console.error('写入日志文件失败:', err);
          }
        });
      } else if (typeof this.fs.appendFileSync === 'function') {
        this.fs.appendFileSync(this.logPath, content, 'utf8');
        this.logBuffer = [];
      }
    } catch (e) {
      console.error('写入日志文件失败:', e);
    }
  }

  appendToFile(message) {
    this.logBuffer.push(message);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  getLogs() {
    return this.logs.join('\n');
  }

  saveLog() {
    if (!this.fs) {
      console.error('文件系统不可用');
      return null;
    }
    
    try {
      const content = this.getLogs();
      const savePath = this.isTt ? 'ttfile://user/debug/saved_log.log' : this.logPath.replace('game_debug', 'saved_log');
      
      if (this.isTt) {
        this.fs.writeFile({
          filePath: savePath,
          data: content,
          encoding: 'utf8',
          success: () => {
            console.log('日志已保存到:', savePath);
            this.log('日志已保存到: ' + savePath);
          },
          fail: (err) => {
            console.error('保存日志失败:', err);
          }
        });
      } else {
        this.fs.writeFileSync(savePath, content, 'utf8');
        console.log('日志已保存到:', savePath);
        this.log('日志已保存到: ' + savePath);
      }
      return savePath;
    } catch (e) {
      console.error('保存日志失败:', e);
      return null;
    }
  }

  clear() {
    this.logs = [];
    this.log('日志已清空');
  }
}

const logger = new DebugLogger();

try {
  if (typeof tt !== 'undefined' && tt.onHide) {
    tt.onHide(() => {
      logger.flushLogBuffer();
    });
  } else if (typeof wx !== 'undefined' && wx.onHide) {
    wx.onHide(() => {
      logger.flushLogBuffer();
    });
  } else if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('hide', () => {
      logger.flushLogBuffer();
    });
  }
} catch (e) {
  console.error('设置页面隐藏监听失败:', e);
}

module.exports = logger;
