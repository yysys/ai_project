const LevelManager = require('../../utils/levelManager');

const app = getApp();

Page({
  data: {
    levels: [],
    totalStars: 0,
    maxStars: 0,
    currentChapter: '第一章'
  },

  levelManager: null,

  onLoad() {
    console.log('关卡页加载');
    this.levelManager = new LevelManager();
    this.loadLevels();
  },

  onShow() {
    console.log('关卡页显示');
    this.loadLevels();
  },

  loadLevels() {
    const levels = this.levelManager.getLevels();
    const totalStars = this.levelManager.getTotalStars();
    const maxStars = this.levelManager.getMaxStars();

    this.setData({
      levels,
      totalStars,
      maxStars
    });
  },

  selectLevel(e) {
    const levelId = e.currentTarget.dataset.id;
    const level = this.levelManager.getLevel(levelId);

    if (!level.unlocked) {
      wx.showToast({
        title: '关卡未解锁',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/game/game?levelId=${levelId}`
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
