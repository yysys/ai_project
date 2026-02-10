class FileLogger {
  constructor() {
    this.fs = null;
    this.debugDir = 'ttfile://user/debug';
    this.currentLogFile = null;
    this.logBuffer = [];
    this.isTt = false;
    this.init();
  }

  init() {
    try {
      if (typeof tt !== 'undefined' && tt.getFileSystemManager) {
        this.fs = tt.getFileSystemManager();
        this.isTt = true;
        console.log('抖音小游戏文件系统初始化成功');
      } else if (typeof wx !== 'undefined' && wx.getFileSystemManager) {
        this.fs = wx.getFileSystemManager();
        console.log('微信小程序文件系统初始化成功');
      } else if (typeof require === 'function') {
        const fs = require('fs');
        const path = require('path');
        this.fs = {
          mkdirSync: (dir) => fs.mkdirSync(dir, { recursive: true }),
          existsSync: (path) => fs.existsSync(path),
          writeFileSync: (path, content) => fs.writeFileSync(path, content, 'utf8'),
          appendFileSync: (path, content) => fs.appendFileSync(path, content, 'utf8'),
          readdirSync: (path) => fs.readdirSync(path),
          unlinkSync: (path) => fs.unlinkSync(path),
          statSync: (path) => fs.statSync(path)
        };
        this.debugDir = path.join(__dirname, '../../debug');
        console.log('Node.js 文件系统初始化成功');
      } else {
        console.warn('无法初始化文件系统，日志将只输出到控制台');
        return;
      }

      this.ensureDebugDir();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.currentLogFile = `${this.debugDir}/debug_${timestamp}.log`;
      this.log('=== 日志系统初始化 ===');
      this.log('日志文件:', this.currentLogFile);
    } catch (e) {
      console.error('FileLogger 初始化失败:', e);
    }
  }

  ensureDebugDir() {
    try {
      if (this.isTt) {
        this.fs.mkdir({
          dirPath: this.debugDir,
          success: () => console.log('Debug 目录已创建:', this.debugDir),
          fail: (err) => console.error('创建 debug 目录失败:', err)
        });
      } else if (typeof this.fs.existsSync === 'function' && !this.fs.existsSync(this.debugDir)) {
        if (typeof this.fs.mkdirSync === 'function') {
          this.fs.mkdirSync(this.debugDir);
          console.log('Debug 目录已创建:', this.debugDir);
        }
      }
    } catch (e) {
      console.error('创建 debug 目录失败:', e);
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message}`;
    console.error(logEntry);
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length >= 10) {
      this.flushLogBuffer();
    }
  }

  warn(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}`;
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
          filePath: this.currentLogFile,
          data: content,
          encoding: 'utf8',
          success: () => {
            console.log('日志写入成功:', this.currentLogFile);
            this.logBuffer = [];
          },
          fail: (err) => {
            console.error('写入日志文件失败:', err);
          }
        });
      } else if (typeof this.fs.writeFileSync === 'function') {
        this.fs.writeFileSync(this.currentLogFile, content);
        this.logBuffer = [];
      } else if (typeof this.fs.writeFile === 'function') {
        this.fs.writeFile({
          filePath: this.currentLogFile,
          data: content,
          encoding: 'utf8'
        });
        this.logBuffer = [];
      }
    } catch (e) {
      console.error('刷新日志缓冲失败:', e);
    }
  }

  clear() {
    if (!this.fs) return;
    try {
      if (this.isTt) {
        this.fs.readdir({
          dirPath: this.debugDir,
          success: (res) => {
            res.files.forEach(file => {
              if (file.endsWith('.log')) {
                const filePath = `${this.debugDir}/${file}`;
                this.fs.unlink({
                  filePath: filePath,
                  success: () => console.log('删除日志文件:', filePath),
                  fail: (err) => console.error('删除日志文件失败:', err)
                });
              }
            });
            console.log('所有日志文件已清空');
          },
          fail: (err) => console.error('清空日志文件失败:', err)
        });
      } else if (typeof this.fs.readdirSync === 'function') {
        const files = this.fs.readdirSync(this.debugDir);
        files.forEach(file => {
          const filePath = `${this.debugDir}/${file}`;
          if (typeof this.fs.unlinkSync === 'function') {
            this.fs.unlinkSync(filePath);
          }
        });
        console.log('所有日志文件已清空');
      }
    } catch (e) {
      console.error('清空日志文件失败:', e);
    }
  }

  getLatestLogFile() {
    if (!this.fs) return null;
    try {
      if (this.isTt) {
        return this.currentLogFile;
      } else if (typeof this.fs.readdirSync === 'function') {
        const files = this.fs.readdirSync(this.debugDir)
          .filter(file => file.endsWith('.log'))
          .map(file => ({
            name: file,
            path: `${this.debugDir}/${file}`,
            mtime: typeof this.fs.statSync === 'function' ? 
              this.fs.statSync(`${this.debugDir}/${file}`).mtime : Date.now()
          }))
          .sort((a, b) => b.mtime - a.mtime);
        
        return files.length > 0 ? files[0].path : null;
      }
    } catch (e) {
      console.error('获取最新日志文件失败:', e);
      return null;
    }
  }
}

const fileLogger = new FileLogger();

window.addEventListener('hide', () => {
  fileLogger.flushLogBuffer();
});

module.exports = fileLogger;
