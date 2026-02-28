const PuzzleManager = require('../../utils/puzzleManager');
const TT = require('../../utils/tt');

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
    this.puzzleManager = new PuzzleManager();
    this.loadLevels();
  },

  onShow() {
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
