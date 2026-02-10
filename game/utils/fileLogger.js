const fs = require('fs');
const path = require('path');

class FileLogger {
  constructor() {
    this.debugDir = path.join(__dirname, '../../debug');
    this.ensureDebugDir();
    this.currentLogFile = null;
    this.init();
  }

  ensureDebugDir() {
    try {
      if (!fs.existsSync(this.debugDir)) {
        fs.mkdirSync(this.debugDir, { recursive: true });
        console.log('Debug 目录已创建:', this.debugDir);
      }
    } catch (e) {
      console.error('创建 debug 目录失败:', e);
    }
  }

  init() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.debugDir, `debug_${timestamp}.log`);
    this.log('=== 日志系统初始化 ===');
    this.log('日志文件:', this.currentLogFile);
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.appendToFile(logEntry);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message}`;
    console.error(logEntry);
    this.appendToFile(logEntry);
  }

  warn(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}`;
    console.warn(logEntry);
    this.appendToFile(logEntry);
  }

  appendToFile(message) {
    if (!this.currentLogFile) return;
    try {
      fs.appendFileSync(this.currentLogFile, message + '\n', 'utf8');
    } catch (e) {
      console.error('写入日志文件失败:', e);
    }
  }

  clear() {
    try {
      const files = fs.readdirSync(this.debugDir);
      files.forEach(file => {
        const filePath = path.join(this.debugDir, file);
        fs.unlinkSync(filePath);
      });
      console.log('所有日志文件已清空');
    } catch (e) {
      console.error('清空日志文件失败:', e);
    }
  }

  getLatestLogFile() {
    try {
      const files = fs.readdirSync(this.debugDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.debugDir, file),
          mtime: fs.statSync(path.join(this.debugDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      return files.length > 0 ? files[0].path : null;
    } catch (e) {
      console.error('获取最新日志文件失败:', e);
      return null;
    }
  }
}

const fileLogger = new FileLogger();
module.exports = fileLogger;
