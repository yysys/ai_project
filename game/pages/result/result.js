const TT = require('../../utils/tt');
const app = getApp();

Page({
  data: {
    result: '',
    levelId: 0,
    stars: 0,
    score: 0,
    showConfetti: false
  },

  onLoad(options) {
    const result = options.result || 'win';
    const levelId = parseInt(options.levelId) || 1;
    const stars = parseInt(options.stars) || 0;
    const score = parseInt(options.score) || 0;

    this.setData({
      result,
      levelId,
      stars,
      score,
      showConfetti: result === 'win'
    });

    if (result === 'win') {
      this.saveProgress();
    }
  },

  onShow() {
  },

  saveProgress() {
    const progress = app.loadGameProgress();
    if (progress) {
      if (!progress.unlockedLevels.includes(this.data.levelId + 1)) {
        progress.unlockedLevels.push(this.data.levelId + 1);
      }
      
      if (!progress.highScores[this.data.levelId] || progress.highScores[this.data.levelId] < this.data.score) {
        progress.highScores[this.data.levelId] = this.data.score;
      }
      
      progress.totalScore += this.data.score;
      progress.coins += Math.floor(this.data.score / 10);
      
      app.saveGameProgress(progress);
    }
  },

  goHome() {
    TT.reLaunch({
      url: '/pages/index/index'
    });
  },

  nextLevel() {
    const nextLevelId = this.data.levelId + 1;
    TT.redirectTo({
      url: `/pages/game/game?levelId=${nextLevelId}`
    });
  },

  retryLevel() {
    TT.redirectTo({
      url: `/pages/game/game?levelId=${this.data.levelId}`
    });
  }
});
