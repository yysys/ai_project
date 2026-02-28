const { StorageService, STORAGE_VERSION, STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_PROGRESS } = require('../utils/storage');

class MockStorage {
  constructor() {
    this.store = {};
  }

  setItem(key, value) {
    this.store[key] = JSON.stringify(value);
  }

  getItem(key) {
    const value = this.store[key];
    return value || null;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    return Object.keys(this.store)[index];
  }
}

describe('StorageService', () => {
  let storageService;
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockStorage();
    
    global.localStorage = mockLocalStorage;
    
    delete global.tt;
    
    storageService = new StorageService();
    storageService.initialized = false;
    storageService.memoryCache.clear();
    storageService.cacheExpiry.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
    storageService.clearMemoryCache();
  });

  describe('Initialization', () => {
    test('should initialize with default values for new storage', async () => {
      await storageService.init();
      
      expect(storageService.initialized).toBe(true);
      
      const version = mockLocalStorage.store[STORAGE_KEYS.VERSION];
      expect(JSON.parse(version)).toBe(STORAGE_VERSION);
    });

    test('should not reinitialize if already initialized', async () => {
      await storageService.init();
      await storageService.init();
      
      expect(storageService.initialized).toBe(true);
    });

    test('should create default progress on first init', async () => {
      await storageService.init();
      
      const progress = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.PROGRESS]);
      
      expect(progress.currentLevel).toBe(1);
      expect(progress.unlockedLevels).toEqual([1]);
      expect(progress.levelStars).toEqual({});
      expect(progress.levelScores).toEqual({});
    });

    test('should create default settings on first init', async () => {
      await storageService.init();
      
      const settings = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.SETTINGS]);
      
      expect(settings.soundEnabled).toBe(true);
      expect(settings.musicEnabled).toBe(true);
      expect(settings.vibrationEnabled).toBe(true);
      expect(settings.language).toBe('zh-CN');
    });
  });

  describe('Basic Storage Operations', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should set and get value', async () => {
      await storageService.set('test_key', { data: 'test_value' });
      
      const value = await storageService.get('test_key');
      
      expect(value).toEqual({ data: 'test_value' });
    });

    test('should return null for non-existent key', async () => {
      const value = await storageService.get('non_existent_key');
      
      expect(value).toBeNull();
    });

    test('should remove value', async () => {
      await storageService.set('test_key', 'test_value');
      await storageService.remove('test_key');
      
      const value = await storageService.get('test_key');
      
      expect(value).toBeNull();
    });

    test('should clear all storage', async () => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');
      
      await storageService.clear();
      
      expect(await storageService.get('key1')).toBeNull();
      expect(await storageService.get('key2')).toBeNull();
    });

    test('should cache values in memory', async () => {
      await storageService.set('cached_key', 'cached_value');
      
      expect(storageService.memoryCache.has('cached_key')).toBe(true);
      
      mockLocalStorage.store['cached_key'] = JSON.stringify('different_value');
      
      const value = await storageService.get('cached_key');
      
      expect(value).toBe('cached_value');
    });
  });

  describe('Progress Management', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should save progress', async () => {
      const progress = {
        currentLevel: 5,
        unlockedLevels: [1, 2, 3, 4, 5],
        levelStars: { 1: 3, 2: 2, 3: 1 },
        levelScores: { 1: 1500, 2: 1000, 3: 800 },
        totalScore: 3300
      };
      
      await storageService.saveProgress(progress);
      
      const savedProgress = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.PROGRESS]);
      
      expect(savedProgress.currentLevel).toBe(5);
      expect(savedProgress.unlockedLevels).toEqual([1, 2, 3, 4, 5]);
      expect(savedProgress.levelStars).toEqual({ 1: 3, 2: 2, 3: 1 });
      expect(savedProgress.levelScores).toEqual({ 1: 1500, 2: 1000, 3: 800 });
      expect(savedProgress.totalScore).toBe(3300);
      expect(savedProgress.lastPlayTime).toBeGreaterThan(0);
    });

    test('should load progress', async () => {
      const progress = {
        currentLevel: 3,
        unlockedLevels: [1, 2, 3],
        levelStars: { 1: 3 },
        levelScores: { 1: 1500 },
        totalScore: 1500,
        lastPlayTime: Date.now()
      };
      
      mockLocalStorage.store[STORAGE_KEYS.PROGRESS] = JSON.stringify(progress);
      storageService.memoryCache.delete(STORAGE_KEYS.PROGRESS);
      
      const loadedProgress = await storageService.loadProgress();
      
      expect(loadedProgress.currentLevel).toBe(3);
      expect(loadedProgress.unlockedLevels).toEqual([1, 2, 3]);
      expect(loadedProgress.levelStars).toEqual({ 1: 3 });
    });

    test('should return default progress when no progress exists', async () => {
      delete mockLocalStorage.store[STORAGE_KEYS.PROGRESS];
      storageService.memoryCache.delete(STORAGE_KEYS.PROGRESS);
      
      const progress = await storageService.loadProgress();
      
      expect(progress.currentLevel).toBe(1);
      expect(progress.unlockedLevels).toEqual([1]);
    });

    test('should validate progress data', async () => {
      const invalidProgress = {
        currentLevel: -5,
        unlockedLevels: [1, 'invalid', -2],
        levelStars: { 1: 5, 2: -1, 'invalid': 3 },
        levelScores: { 1: -100 },
        totalScore: -500
      };
      
      mockLocalStorage.store[STORAGE_KEYS.PROGRESS] = JSON.stringify(invalidProgress);
      storageService.memoryCache.delete(STORAGE_KEYS.PROGRESS);
      
      const validated = await storageService.loadProgress();
      
      expect(validated.currentLevel).toBe(1);
      expect(validated.unlockedLevels).toEqual([1]);
      expect(validated.levelStars).toEqual({});
      expect(validated.levelScores).toEqual({});
      expect(validated.totalScore).toBe(0);
    });

    test('should handle partial progress data', async () => {
      const partialProgress = {
        currentLevel: 2
      };
      
      mockLocalStorage.store[STORAGE_KEYS.PROGRESS] = JSON.stringify(partialProgress);
      storageService.memoryCache.delete(STORAGE_KEYS.PROGRESS);
      
      const progress = await storageService.loadProgress();
      
      expect(progress.currentLevel).toBe(2);
      expect(progress.unlockedLevels).toEqual([1]);
      expect(progress.levelStars).toEqual({});
    });
  });

  describe('Settings Management', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should save settings', async () => {
      const settings = {
        soundEnabled: false,
        musicEnabled: false,
        vibrationEnabled: true,
        language: 'en-US'
      };
      
      await storageService.saveSettings(settings);
      
      const savedSettings = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.SETTINGS]);
      
      expect(savedSettings.soundEnabled).toBe(false);
      expect(savedSettings.musicEnabled).toBe(false);
      expect(savedSettings.vibrationEnabled).toBe(true);
      expect(savedSettings.language).toBe('en-US');
    });

    test('should load settings', async () => {
      const settings = {
        soundEnabled: false,
        musicEnabled: true,
        vibrationEnabled: false,
        language: 'ja-JP'
      };
      
      mockLocalStorage.store[STORAGE_KEYS.SETTINGS] = JSON.stringify(settings);
      storageService.memoryCache.delete(STORAGE_KEYS.SETTINGS);
      
      const loadedSettings = await storageService.loadSettings();
      
      expect(loadedSettings.soundEnabled).toBe(false);
      expect(loadedSettings.musicEnabled).toBe(true);
      expect(loadedSettings.vibrationEnabled).toBe(false);
      expect(loadedSettings.language).toBe('ja-JP');
    });

    test('should return default settings when no settings exist', async () => {
      delete mockLocalStorage.store[STORAGE_KEYS.SETTINGS];
      storageService.memoryCache.delete(STORAGE_KEYS.SETTINGS);
      
      const settings = await storageService.loadSettings();
      
      expect(settings.soundEnabled).toBe(true);
      expect(settings.musicEnabled).toBe(true);
      expect(settings.vibrationEnabled).toBe(true);
      expect(settings.language).toBe('zh-CN');
    });

    test('should validate settings data', async () => {
      const invalidSettings = {
        soundEnabled: 'yes',
        musicEnabled: 123,
        vibrationEnabled: null,
        language: 456
      };
      
      mockLocalStorage.store[STORAGE_KEYS.SETTINGS] = JSON.stringify(invalidSettings);
      storageService.memoryCache.delete(STORAGE_KEYS.SETTINGS);
      
      const validated = await storageService.loadSettings();
      
      expect(validated.soundEnabled).toBe(true);
      expect(validated.musicEnabled).toBe(true);
      expect(validated.vibrationEnabled).toBe(true);
      expect(validated.language).toBe('zh-CN');
    });
  });

  describe('Level Data Management', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should save level data', async () => {
      const levelData = {
        id: 1,
        name: 'Test Level',
        tiles: [{ id: 'tile1', gridCol: 5, gridRow: 5 }],
        type: 'normal',
        timeLimit: 60
      };
      
      await storageService.saveLevelData(1, levelData);
      
      const key = `${STORAGE_KEYS.LEVEL_DATA}1`;
      const saved = JSON.parse(mockLocalStorage.store[key]);
      
      expect(saved.id).toBe(1);
      expect(saved.name).toBe('Test Level');
      expect(saved.tiles.length).toBe(1);
      expect(saved.savedAt).toBeGreaterThan(0);
    });

    test('should load level data', async () => {
      const levelData = {
        id: 2,
        name: 'Level 2',
        tiles: [],
        type: 'timed',
        timeLimit: 30,
        savedAt: Date.now()
      };
      
      const key = `${STORAGE_KEYS.LEVEL_DATA}2`;
      mockLocalStorage.store[key] = JSON.stringify(levelData);
      
      const loaded = await storageService.loadLevelData(2);
      
      expect(loaded.id).toBe(2);
      expect(loaded.name).toBe('Level 2');
      expect(loaded.type).toBe('timed');
    });

    test('should return null for non-existent level data', async () => {
      const data = await storageService.loadLevelData(999);
      
      expect(data).toBeNull();
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should set cache with TTL', async () => {
      await storageService.setCache('test_cache', { data: 'cached' }, 3600000);
      
      const cacheKey = `${STORAGE_KEYS.CACHE}test_cache`;
      const cached = JSON.parse(mockLocalStorage.store[cacheKey]);
      
      expect(cached.value).toEqual({ data: 'cached' });
      expect(cached.expiry).toBeGreaterThan(Date.now());
    });

    test('should get cache before expiry', async () => {
      const futureExpiry = Date.now() + 3600000;
      const cacheKey = `${STORAGE_KEYS.CACHE}test_cache`;
      
      mockLocalStorage.store[cacheKey] = JSON.stringify({
        value: { data: 'cached' },
        expiry: futureExpiry
      });
      
      const cached = await storageService.getCache('test_cache');
      
      expect(cached).toEqual({ data: 'cached' });
    });

    test('should return null for expired cache', async () => {
      const pastExpiry = Date.now() - 1000;
      const cacheKey = `${STORAGE_KEYS.CACHE}test_cache`;
      
      mockLocalStorage.store[cacheKey] = JSON.stringify({
        value: { data: 'cached' },
        expiry: pastExpiry
      });
      
      const cached = await storageService.getCache('test_cache');
      
      expect(cached).toBeNull();
    });

    test('should return null for non-existent cache', async () => {
      const cached = await storageService.getCache('non_existent');
      
      expect(cached).toBeNull();
    });
  });

  describe('Data Migration', () => {
    test('should migrate from version 0 to current version', async () => {
      const oldProgress = {
        currentLevel: 3,
        unlockedLevels: [1, 2, 3],
        levelStars: { 1: 2, 2: 3 },
        levelScores: { 1: 1000, 2: 1500 },
        totalScore: 2500
      };
      
      mockLocalStorage.store['progress'] = JSON.stringify(oldProgress);
      mockLocalStorage.store[STORAGE_KEYS.VERSION] = JSON.stringify(0);
      
      await storageService.init();
      
      const migratedProgress = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.PROGRESS]);
      
      expect(migratedProgress.currentLevel).toBe(3);
      expect(migratedProgress.unlockedLevels).toEqual([1, 2, 3]);
      expect(migratedProgress.lastPlayTime).toBeGreaterThan(0);
      
      expect(mockLocalStorage.store['progress']).toBeUndefined();
    });

    test('should migrate from version 1 to version 2', async () => {
      const progressV1 = {
        currentLevel: 2,
        unlockedLevels: [1, 2],
        levelStars: { 1: 3 },
        levelScores: { 1: 1500 },
        totalScore: 1500
      };
      
      mockLocalStorage.store[STORAGE_KEYS.PROGRESS] = JSON.stringify(progressV1);
      mockLocalStorage.store[STORAGE_KEYS.VERSION] = JSON.stringify(1);
      
      await storageService.init();
      
      const migratedProgress = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.PROGRESS]);
      
      expect(migratedProgress.lastPlayTime).toBeGreaterThan(0);
      expect(JSON.parse(mockLocalStorage.store[STORAGE_KEYS.VERSION])).toBe(STORAGE_VERSION);
    });

    test('should not migrate when version is current', async () => {
      const currentProgress = {
        currentLevel: 5,
        unlockedLevels: [1, 2, 3, 4, 5],
        levelStars: { 1: 3, 2: 2 },
        levelScores: { 1: 1500, 2: 1000 },
        totalScore: 2500,
        lastPlayTime: Date.now()
      };
      
      mockLocalStorage.store[STORAGE_KEYS.PROGRESS] = JSON.stringify(currentProgress);
      mockLocalStorage.store[STORAGE_KEYS.VERSION] = JSON.stringify(STORAGE_VERSION);
      
      await storageService.init();
      
      const progress = JSON.parse(mockLocalStorage.store[STORAGE_KEYS.PROGRESS]);
      
      expect(progress.currentLevel).toBe(5);
      expect(progress.lastPlayTime).toBe(currentProgress.lastPlayTime);
    });
  });

  describe('Export and Import', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should export all data', async () => {
      await storageService.saveProgress({
        currentLevel: 3,
        unlockedLevels: [1, 2, 3],
        levelStars: { 1: 3 },
        levelScores: { 1: 1500 },
        totalScore: 1500
      });
      
      await storageService.saveSettings({
        soundEnabled: false,
        musicEnabled: true,
        vibrationEnabled: false,
        language: 'en-US'
      });
      
      const exported = await storageService.exportAllData();
      
      expect(exported.version).toBe(STORAGE_VERSION);
      expect(exported.progress.currentLevel).toBe(3);
      expect(exported.settings.soundEnabled).toBe(false);
      expect(exported.exportedAt).toBeGreaterThan(0);
    });

    test('should import all data', async () => {
      const dataToImport = {
        version: STORAGE_VERSION,
        progress: {
          currentLevel: 4,
          unlockedLevels: [1, 2, 3, 4],
          levelStars: { 1: 3, 2: 2 },
          levelScores: { 1: 1500, 2: 1000 },
          totalScore: 2500
        },
        settings: {
          soundEnabled: true,
          musicEnabled: false,
          vibrationEnabled: true,
          language: 'ja-JP'
        }
      };
      
      await storageService.importAllData(dataToImport);
      
      const progress = await storageService.loadProgress();
      const settings = await storageService.loadSettings();
      
      expect(progress.currentLevel).toBe(4);
      expect(settings.musicEnabled).toBe(false);
      expect(settings.language).toBe('ja-JP');
    });

    test('should reject invalid import data', async () => {
      await expect(storageService.importAllData(null)).rejects.toThrow('Invalid import data');
      await expect(storageService.importAllData('invalid')).rejects.toThrow('Invalid import data');
    });
  });

  describe('Storage Info', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should get storage info', () => {
      const info = storageService.getStorageInfo();
      
      expect(info).toBeDefined();
      expect(info.currentSize).toBeDefined();
    });
  });

  describe('Memory Cache', () => {
    beforeEach(async () => {
      await storageService.init();
    });

    test('should clear memory cache', async () => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');
      
      expect(storageService.memoryCache.size).toBeGreaterThan(0);
      
      storageService.clearMemoryCache();
      
      expect(storageService.memoryCache.size).toBe(0);
      expect(storageService.cacheExpiry.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      const errorStorage = {
        setItem: () => { throw new Error('Storage error'); },
        getItem: () => { throw new Error('Storage error'); },
        removeItem: () => { throw new Error('Storage error'); },
        clear: () => { throw new Error('Storage error'); }
      };
      
      global.localStorage = errorStorage;
      
      const errorService = new StorageService();
      errorService.initialized = true;
      
      const value = await errorService.get('test');
      expect(value).toBeNull();
    });
  });
});
