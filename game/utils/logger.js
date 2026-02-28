const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4
};

class DebugLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.isTt = false;
    this.fs = null;
    this.logPath = null;
    this.logBuffer = [];
    this.logLevel = LOG_LEVEL.INFO;
  }

  init() {
    try {
      if (typeof tt !== 'undefined' && tt.getFileSystemManager) {
        this.fs = tt.getFileSystemManager();
        this.isTt = true;
        this.logPath = 'ttfile://user/debug/game_debug.log';
      } else if (typeof wx !== 'undefined' && wx.getFileSystemManager) {
        this.fs = wx.getFileSystemManager();
        this.logPath = 'ttfile://user/debug/game_debug.log';
      } else if (typeof require === 'function') {
        const fs = require('fs');
        const path = require('path');
        this.fs = {
          writeFileSync: (path, content, encoding) => fs.writeFileSync(path, content, encoding),
          appendFileSync: (path, content, encoding) => fs.appendFileSync(path, content, encoding)
        };
        this.logPath = path.join(__dirname, '../../debug/game_debug.log');
      } else {
        console.warn('[logger] 无法初始化文件系统，日志将只输出到控制台');
      }

      const envLevel = (typeof process !== 'undefined' && process.env?.LOG_LEVEL) || (typeof global !== 'undefined' && global.GAME_LOG_LEVEL);
      if (envLevel) {
        const level = LOG_LEVEL[envLevel.toUpperCase()];
        if (level !== undefined) {
          this.logLevel = level;
        }
      }
    } catch (e) {
      console.error('[logger] 日志系统初始化失败:', e);
    }
  }

  setLogLevel(level) {
    const logLevel = typeof level === 'string' ? LOG_LEVEL[level.toUpperCase()] : level;
    if (logLevel !== undefined) {
      this.logLevel = logLevel;
    }
  }

  getLogLevel() {
    return this.logLevel;
  }

  _shouldLog(level) {
    return level <= this.logLevel;
  }

  _writeLog(level, levelName, message, color = null) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [${levelName}] ${message}`;
      this.logs.push(logEntry);
      
      if (color) {
        console.log(`%c${logEntry}`, color);
      } else {
        console.log(logEntry);
      }
      
      this.logBuffer.push(logEntry);
      if (this.logBuffer.length >= 10) {
        this.flushLogBuffer();
      }
    } catch (e) {
      console.error('[logger] log error:', e);
    }
  }

  log(message) {
    if (this._shouldLog(LOG_LEVEL.INFO)) {
      this._writeLog(LOG_LEVEL.INFO, 'INFO', message);
    }
  }

  info(message) {
    if (this._shouldLog(LOG_LEVEL.INFO)) {
      this._writeLog(LOG_LEVEL.INFO, 'INFO', message);
    }
  }

  debug(message) {
    if (this._shouldLog(LOG_LEVEL.DEBUG)) {
      this._writeLog(LOG_LEVEL.DEBUG, 'DEBUG', message, 'color: #888;');
    }
  }

  verbose(message) {
    if (this._shouldLog(LOG_LEVEL.VERBOSE)) {
      this._writeLog(LOG_LEVEL.VERBOSE, 'VERBOSE', message, 'color: #aaa;');
    }
  }

  error(message) {
    if (this._shouldLog(LOG_LEVEL.ERROR)) {
      this._writeLog(LOG_LEVEL.ERROR, 'ERROR', message, 'color: #f44336;');
    }
  }

  warn(message) {
    if (this._shouldLog(LOG_LEVEL.WARN)) {
      this._writeLog(LOG_LEVEL.WARN, 'WARN', message, 'color: #ff9800;');
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
            this.logBuffer = [];
          },
          fail: (err) => {
            console.error('[logger] 写入日志文件失败:', err);
          }
        });
      } else if (typeof this.fs.appendFileSync === 'function') {
        this.fs.appendFileSync(this.logPath, content, 'utf8');
        this.logBuffer = [];
      } else if (typeof this.fs.writeFileSync === 'function') {
        this.fs.writeFileSync(this.logPath, content, 'utf8');
        this.logBuffer = [];
      }
    } catch (e) {
      console.error('[logger] flushLogBuffer error:', e);
    }
  }

  getLogs() {
    return this.logs.join('\n');
  }

  saveLog() {
    if (!this.fs) {
      console.error('[logger] 文件系统不可用');
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
            this.log('日志已保存到: ' + savePath);
          },
          fail: (err) => {
            console.error('[logger] 保存日志失败:', err);
          }
        });
      } else {
        this.fs.writeFileSync(savePath, content, 'utf8');
        this.log('日志已保存到: ' + savePath);
      }
      return savePath;
    } catch (e) {
      console.error('[logger] saveLog error:', e);
      return null;
    }
  }

  clear() {
    this.logs = [];
    this.log('日志已清空');
  }
}

let _loggerInstance = null;

function getLogger() {
  if (!_loggerInstance) {
    _loggerInstance = new DebugLogger();
    _loggerInstance.init();
  }
  return _loggerInstance;
}

const logger = getLogger();

module.exports = logger;
