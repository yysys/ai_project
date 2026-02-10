const PuzzleManager = require('../../utils/puzzleManager');

const app = getApp();

Page({
  data: {
    levels: [],
    totalStars: 0,
    maxStars: 0,
    currentChapter: '第一章'
  },

  puzzleManager: null,

  onLoad() {
    console.log('关卡页加载');
    this.puzzleManager = new PuzzleManager();
    this.loadLevels();
  },

  onShow() {
    console.log('关卡页显示');
    this.loadLevels();
  },

  loadLevels() {
    const levels = this.puzzleManager.getLevels();
    const totalStars = this.puzzleManager.getTotalStars();
    const maxStars = this.puzzleManager.getMaxStars();

    this.setData({
      levels,
      totalStars,
      maxStars
    });
  },

  selectLevel(e) {
    const levelId = e.currentTarget.dataset.id;
    const level = this.puzzleManager.getLevel(levelId);

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
