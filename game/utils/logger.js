class DebugLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.fs = typeof tt !== 'undefined' && tt.getFileSystemManager ? tt.getFileSystemManager() : null;
    this.logPath = `wxfile://tmp/game_debug_${Date.now()}.log`;
    this.init();
  }

  init() {
    this.log('日志系统初始化');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
    this.appendToFile(logEntry);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ERROR] ${message}`;
    this.logs.push(logEntry);
    console.error(logEntry);
    this.appendToFile(logEntry);
  }

  warn(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [WARN] ${message}`;
    this.logs.push(logEntry);
    console.warn(logEntry);
    this.appendToFile(logEntry);
  }

  appendToFile(message) {
    if (!this.fs) return;
    try {
      this.fs.appendFileSync(this.logPath, message + '\n', 'utf8');
    } catch (e) {
      console.error('写入日志文件失败:', e);
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
      const savePath = `wxfile://tmp/debug_log_${Date.now()}.log`;
      this.fs.writeFileSync(savePath, content, 'utf8');
      console.log('日志已保存到:', savePath);
      this.log('日志已保存到: ' + savePath);
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
module.exports = logger;