const TT = require('../../utils/tt');
const app = getApp();

Page({
  data: {
    result: '',
    levelId: 0,
    stars: 0,
    score: 0,
    coins: 0,
    bones: 1,
    hasNextLevel: true,
    moves: 0
  },

  async onLoad(options) {
    const result = options.result || 'win';
    const levelId = parseInt(options.levelId) || 1;
    const stars = parseInt(options.stars) || 0;
    const score = parseInt(options.score) || 0;
    const moves = parseInt(options.moves) || 0;
    const coins = Math.floor(score / 10);
    const bones = stars >= 3 ? 2 : 1;

    this.setData({
      result,
      levelId,
      stars,
      score,
      coins,
      bones,
      moves
    });

    if (result === 'win') {
      await this.saveProgress();
    }
  },

  onShow() {
  },

  async saveProgress() {
    try {
      let progress = await app.loadGameProgress();
      
      if (!progress) {
        progress = {
          currentLevel: 1,
          unlockedLevels: [1],
          levelStars: {},
          levelScores: {},
          totalScore: 0,
          coins: 0,
          lastPlayTime: 0
        };
      }

      const nextLevelId = this.data.levelId + 1;
      if (!progress.unlockedLevels.includes(nextLevelId)) {
        progress.unlockedLevels.push(nextLevelId);
      }

      if (!progress.levelStars[this.data.levelId] || progress.levelStars[this.data.levelId] < this.data.stars) {
        progress.levelStars[this.data.levelId] = this.data.stars;
      }

      if (!progress.levelScores[this.data.levelId] || progress.levelScores[this.data.levelId] < this.data.score) {
        progress.levelScores[this.data.levelId] = this.data.score;
      }

      progress.currentLevel = nextLevelId;
      progress.totalScore = Object.values(progress.levelScores).reduce((sum, s) => sum + s, 0);
      progress.coins += this.data.coins;
      progress.lastPlayTime = Date.now();

      await app.saveGameProgress(progress);

      const LevelManager = require('../../utils/levelManager');
      const levelManager = new LevelManager();
      await levelManager.init();
      const levels = levelManager.getLevels();
      const hasNextLevel = levels.some(l => l.id === nextLevelId);
      
      this.setData({ hasNextLevel });
      
    } catch (error) {
      console.error('Save progress error:', error);
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
