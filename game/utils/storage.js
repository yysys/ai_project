const logger = require('./logger');

const STORAGE_VERSION = 2;

const STORAGE_KEYS = {
  PROGRESS: 'game_progress',
  SETTINGS: 'game_settings',
  LEVEL_DATA: 'level_data_',
  CACHE: 'cache_',
  VERSION: 'storage_version'
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  language: 'zh-CN'
};

const DEFAULT_PROGRESS = {
  currentLevel: 1,
  unlockedLevels: [1],
  levelStars: {},
  levelScores: {},
  totalScore: 0,
  lastPlayTime: 0
};

class StorageService {
  constructor() {
    this.isTTEnvironment = typeof tt !== 'undefined' && tt !== null;
    this.memoryCache = new Map();
    this.cacheExpiry = new Map();
    this.initialized = false;
  }

  _getStorageAPI() {
    if (this.isTTEnvironment) {
      return {
        set: (key, value) => {
          try {
            tt.setStorageSync(key, value);
            return true;
          } catch (e) {
            logger.error('TT Storage set error:', e);
            return false;
          }
        },
        get: (key) => {
          try {
            return tt.getStorageSync(key);
          } catch (e) {
            logger.error('TT Storage get error:', e);
            return null;
          }
        },
        remove: (key) => {
          try {
            tt.removeStorageSync(key);
            return true;
          } catch (e) {
            logger.error('TT Storage remove error:', e);
            return false;
          }
        },
        clear: () => {
          try {
            tt.clearStorageSync();
            return true;
          } catch (e) {
            logger.error('TT Storage clear error:', e);
            return false;
          }
        },
        getInfo: () => {
          try {
            return tt.getStorageInfoSync();
          } catch (e) {
            logger.error('TT Storage getInfo error:', e);
            return null;
          }
        }
      };
    }
    
    return {
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          logger.error('LocalStorage set error:', e);
          return false;
        }
      },
      get: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (e) {
          logger.error('LocalStorage get error:', e);
          return null;
        }
      },
      remove: (key) => {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          logger.error('LocalStorage remove error:', e);
          return false;
        }
      },
      clear: () => {
        try {
          localStorage.clear();
          return true;
        } catch (e) {
          logger.error('LocalStorage clear error:', e);
          return false;
        }
      },
      getInfo: () => {
        try {
          let size = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            size += localStorage.getItem(key).length * 2;
          }
          return { currentSize: size, keys: Object.keys(localStorage) };
        } catch (e) {
          return null;
        }
      }
    };
  }

  async init() {
    if (this.initialized) {
      return true;
    }

    const storage = this._getStorageAPI();
    
    try {
      const storedVersion = storage.get(STORAGE_KEYS.VERSION);
      
      if (storedVersion === null || storedVersion === undefined) {
        await this._initializeNewStorage();
      } else if (storedVersion < STORAGE_VERSION) {
        await this._migrateData(storedVersion);
      }
      
      this.initialized = true;
      logger.log('StorageService initialized, version:', STORAGE_VERSION);
      return true;
    } catch (error) {
      logger.error('StorageService init error:', error);
      this.initialized = true;
      return false;
    }
  }

  async _initializeNewStorage() {
    const storage = this._getStorageAPI();
    
    storage.set(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    storage.set(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
    storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    
    logger.log('Initialized new storage with version', STORAGE_VERSION);
  }

  async _migrateData(fromVersion) {
    const storage = this._getStorageAPI();
    
    logger.log('Migrating storage from version', fromVersion, 'to', STORAGE_VERSION);
    
    if (fromVersion < 1) {
      const oldProgress = storage.get('progress');
      if (oldProgress) {
        const newProgress = this._migrateFromV0(oldProgress);
        storage.set(STORAGE_KEYS.PROGRESS, newProgress);
        storage.remove('progress');
      }
    }
    
    if (fromVersion < 2) {
      const progress = storage.get(STORAGE_KEYS.PROGRESS);
      if (progress && !progress.lastPlayTime) {
        progress.lastPlayTime = Date.now();
        storage.set(STORAGE_KEYS.PROGRESS, progress);
      }
    }
    
    storage.set(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    logger.log('Storage migration completed');
  }

  _migrateFromV0(oldProgress) {
    return {
      currentLevel: oldProgress.currentLevel || 1,
      unlockedLevels: oldProgress.unlockedLevels || [1],
      levelStars: oldProgress.levelStars || {},
      levelScores: oldProgress.levelScores || {},
      totalScore: oldProgress.totalScore || 0,
      lastPlayTime: Date.now()
    };
  }

  async set(key, value) {
    const storage = this._getStorageAPI();
    
    try {
      const success = storage.set(key, value);
      
      if (success) {
        this.memoryCache.set(key, value);
      }
      
      return success ? Promise.resolve() : Promise.reject(new Error('Storage set failed'));
    } catch (error) {
      logger.error('Storage set error:', error);
      return Promise.reject(error);
    }
  }

  async get(key) {
    if (this.memoryCache.has(key)) {
      return Promise.resolve(this.memoryCache.get(key));
    }
    
    const storage = this._getStorageAPI();
    
    try {
      const value = storage.get(key);
      
      if (value !== null && value !== undefined) {
        this.memoryCache.set(key, value);
      }
      
      return Promise.resolve(value);
    } catch (error) {
      logger.error('Storage get error:', error);
      return Promise.resolve(null);
    }
  }

  async remove(key) {
    const storage = this._getStorageAPI();
    
    try {
      storage.remove(key);
      this.memoryCache.delete(key);
      this.cacheExpiry.delete(key);
      return Promise.resolve();
    } catch (error) {
      logger.error('Storage remove error:', error);
      return Promise.reject(error);
    }
  }

  async clear() {
    const storage = this._getStorageAPI();
    
    try {
      storage.clear();
      this.memoryCache.clear();
      this.cacheExpiry.clear();
      
      await this._initializeNewStorage();
      
      return Promise.resolve();
    } catch (error) {
      logger.error('Storage clear error:', error);
      return Promise.reject(error);
    }
  }

  async saveProgress(progress) {
    const progressData = {
      currentLevel: progress.currentLevel || 1,
      unlockedLevels: progress.unlockedLevels || [1],
      levelStars: progress.levelStars || {},
      levelScores: progress.levelScores || {},
      totalScore: progress.totalScore || 0,
      lastPlayTime: Date.now()
    };
    
    try {
      await this.set(STORAGE_KEYS.PROGRESS, progressData);
      logger.log('Progress saved:', progressData);
      return Promise.resolve();
    } catch (error) {
      logger.error('Save progress error:', error);
      return Promise.reject(error);
    }
  }

  async loadProgress() {
    try {
      const progress = await this.get(STORAGE_KEYS.PROGRESS);
      
      if (!progress) {
        logger.log('No progress found, returning default');
        return Promise.resolve({ ...DEFAULT_PROGRESS });
      }
      
      const validatedProgress = this._validateProgress(progress);
      return Promise.resolve(validatedProgress);
    } catch (error) {
      logger.error('Load progress error:', error);
      return Promise.resolve({ ...DEFAULT_PROGRESS });
    }
  }

  _validateProgress(progress) {
    const validated = { ...DEFAULT_PROGRESS };
    
    if (typeof progress.currentLevel === 'number' && progress.currentLevel > 0) {
      validated.currentLevel = progress.currentLevel;
    }
    
    if (Array.isArray(progress.unlockedLevels) && progress.unlockedLevels.length > 0) {
      validated.unlockedLevels = progress.unlockedLevels.filter(id => typeof id === 'number' && id > 0);
    }
    
    if (progress.levelStars && typeof progress.levelStars === 'object') {
      validated.levelStars = {};
      for (const [key, value] of Object.entries(progress.levelStars)) {
        const levelId = parseInt(key);
        if (!isNaN(levelId) && typeof value === 'number' && value >= 0 && value <= 3) {
          validated.levelStars[levelId] = value;
        }
      }
    }
    
    if (progress.levelScores && typeof progress.levelScores === 'object') {
      validated.levelScores = {};
      for (const [key, value] of Object.entries(progress.levelScores)) {
        const levelId = parseInt(key);
        if (!isNaN(levelId) && typeof value === 'number' && value >= 0) {
          validated.levelScores[levelId] = value;
        }
      }
    }
    
    if (typeof progress.totalScore === 'number' && progress.totalScore >= 0) {
      validated.totalScore = progress.totalScore;
    }
    
    if (typeof progress.lastPlayTime === 'number' && progress.lastPlayTime > 0) {
      validated.lastPlayTime = progress.lastPlayTime;
    }
    
    return validated;
  }

  async saveLevelData(levelId, data) {
    const key = `${STORAGE_KEYS.LEVEL_DATA}${levelId}`;
    
    const levelData = {
      id: data.id || levelId,
      name: data.name || `第${levelId}关`,
      tiles: data.tiles || [],
      type: data.type || 'normal',
      timeLimit: data.timeLimit || 0,
      savedAt: Date.now()
    };
    
    try {
      await this.set(key, levelData);
      logger.log('Level data saved:', levelId);
      return Promise.resolve();
    } catch (error) {
      logger.error('Save level data error:', error);
      return Promise.reject(error);
    }
  }

  async loadLevelData(levelId) {
    const key = `${STORAGE_KEYS.LEVEL_DATA}${levelId}`;
    
    try {
      const data = await this.get(key);
      
      if (!data) {
        return Promise.resolve(null);
      }
      
      return Promise.resolve(data);
    } catch (error) {
      logger.error('Load level data error:', error);
      return Promise.resolve(null);
    }
  }

  async saveSettings(settings) {
    const settingsData = {
      soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
      musicEnabled: settings.musicEnabled !== undefined ? settings.musicEnabled : true,
      vibrationEnabled: settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true,
      language: settings.language || 'zh-CN'
    };
    
    try {
      await this.set(STORAGE_KEYS.SETTINGS, settingsData);
      logger.log('Settings saved:', settingsData);
      return Promise.resolve();
    } catch (error) {
      logger.error('Save settings error:', error);
      return Promise.reject(error);
    }
  }

  async loadSettings() {
    try {
      const settings = await this.get(STORAGE_KEYS.SETTINGS);
      
      if (!settings) {
        return Promise.resolve({ ...DEFAULT_SETTINGS });
      }
      
      const validatedSettings = this._validateSettings(settings);
      return Promise.resolve(validatedSettings);
    } catch (error) {
      logger.error('Load settings error:', error);
      return Promise.resolve({ ...DEFAULT_SETTINGS });
    }
  }

  _validateSettings(settings) {
    const validated = { ...DEFAULT_SETTINGS };
    
    if (typeof settings.soundEnabled === 'boolean') {
      validated.soundEnabled = settings.soundEnabled;
    }
    
    if (typeof settings.musicEnabled === 'boolean') {
      validated.musicEnabled = settings.musicEnabled;
    }
    
    if (typeof settings.vibrationEnabled === 'boolean') {
      validated.vibrationEnabled = settings.vibrationEnabled;
    }
    
    if (typeof settings.language === 'string' && settings.language) {
      validated.language = settings.language;
    }
    
    return validated;
  }

  async setCache(key, value, ttl = 3600000) {
    const cacheKey = `${STORAGE_KEYS.CACHE}${key}`;
    const cacheData = {
      value: value,
      expiry: Date.now() + ttl
    };
    
    try {
      await this.set(cacheKey, cacheData);
      this.cacheExpiry.set(cacheKey, cacheData.expiry);
      return Promise.resolve();
    } catch (error) {
      logger.error('Set cache error:', error);
      return Promise.reject(error);
    }
  }

  async getCache(key) {
    const cacheKey = `${STORAGE_KEYS.CACHE}${key}`;
    
    if (this.cacheExpiry.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey);
      if (Date.now() > expiry) {
        await this.remove(cacheKey);
        return Promise.resolve(null);
      }
    }
    
    try {
      const cacheData = await this.get(cacheKey);
      
      if (!cacheData) {
        return Promise.resolve(null);
      }
      
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        await this.remove(cacheKey);
        return Promise.resolve(null);
      }
      
      return Promise.resolve(cacheData.value);
    } catch (error) {
      logger.error('Get cache error:', error);
      return Promise.resolve(null);
    }
  }

  getStorageInfo() {
    const storage = this._getStorageAPI();
    return storage.getInfo();
  }

  async exportAllData() {
    try {
      const progress = await this.loadProgress();
      const settings = await this.loadSettings();
      
      return Promise.resolve({
        version: STORAGE_VERSION,
        exportedAt: Date.now(),
        progress,
        settings
      });
    } catch (error) {
      logger.error('Export data error:', error);
      return Promise.reject(error);
    }
  }

  async importAllData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data');
      }
      
      if (data.progress) {
        await this.saveProgress(data.progress);
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
      
      logger.log('Data imported successfully');
      return Promise.resolve();
    } catch (error) {
      logger.error('Import data error:', error);
      return Promise.reject(error);
    }
  }

  clearMemoryCache() {
    this.memoryCache.clear();
    this.cacheExpiry.clear();
    logger.log('Memory cache cleared');
  }
}

const storageService = new StorageService();

module.exports = storageService;
module.exports.StorageService = StorageService;
module.exports.STORAGE_VERSION = STORAGE_VERSION;
module.exports.STORAGE_KEYS = STORAGE_KEYS;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
module.exports.DEFAULT_PROGRESS = DEFAULT_PROGRESS;
