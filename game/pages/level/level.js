const LevelManager = require('../../utils/levelManager');
const TT = require('../../utils/tt');

const app = getApp();

Page({
  data: {
    levels: [],
    totalStars: 0,
    maxStars: 0,
    currentChapter: '第一章'
  },

  levelManager: null,

  async onLoad() {
    this.levelManager = new LevelManager();
    await this.loadLevels();
  },

  async onShow() {
    await this.loadLevels();
  },

  async loadLevels() {
    await this.levelManager.init();
    
    const progress = await app.loadGameProgress();
    if (progress) {
      this.levelManager.loadProgress(progress);
    }

    const levels = this.levelManager.getLevels();
    const totalStars = this.levelManager.getTotalStars();
    const maxStars = this.levelManager.getMaxStars();
    const currentLevelId = progress ? progress.currentLevel : 1;

    const processedLevels = levels.map(level => ({
      id: level.id,
      name: level.name,
      unlocked: level.unlocked,
      completed: level.completed,
      stars: level.stars,
      score: level.score,
      current: level.id === currentLevelId
    }));

    this.setData({
      levels: processedLevels,
      totalStars,
      maxStars
    });
  },

  selectLevel(e) {
    const levelId = e.currentTarget.dataset.id;
    const level = this.levelManager.getLevel(levelId);

    if (!level || !level.unlocked) {
      TT.showToast({
        title: '关卡未解锁',
        icon: 'none'
      });
      return;
    }

    TT.navigateTo({
      url: `/pages/game/game?levelId=${levelId}`
    });
  },

  goBack() {
    TT.navigateBack();
  }
});
