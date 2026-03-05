const logger = require('./utils/logger');
const storageService = require('./utils/storage');

App({
  onLaunch(options) {
    console.log('App launched', options);
    this.setupDebugHelpers();
    this.initStorage();
  },

  onShow(options) {
    console.log('App show', options);
  },

  onHide() {
    console.log('App hide');
  },

  onError(msg) {
    console.error('App error:', msg);
  },

  setupDebugHelpers() {
    this.logger = logger;
  },

  async initStorage() {
    try {
      await storageService.init();
      logger.log('Storage initialized');
    } catch (error) {
      logger.error('Storage init error:', error);
    }
  },

  async loadGameProgress() {
    try {
      const progress = await storageService.loadProgress();
      logger.log('Loaded progress:', progress);
      return progress;
    } catch (error) {
      logger.error('Load progress error:', error);
      return {
        currentLevel: 1,
        unlockedLevels: [1],
        levelStars: {},
        levelScores: {},
        totalScore: 0,
        lastPlayTime: 0
      };
    }
  },

  async saveGameProgress(progress) {
    try {
      await storageService.saveProgress(progress);
      logger.log('Saved progress:', progress);
      return true;
    } catch (error) {
      logger.error('Save progress error:', error);
      return false;
    }
  },

  globalData: {
    userInfo: null
  }
});
