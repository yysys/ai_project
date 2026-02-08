App({
  onLaunch() {
    console.log('拯救菜狗小程序启动');
    this.initGame();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  initGame() {
    const gameProgress = this.loadGameProgress();
    if (!gameProgress) {
      this.saveGameProgress({
        currentLevel: 1,
        unlockedLevels: [1],
        highScores: {},
        totalScore: 0,
        coins: 0,
        unlockedSkins: [],
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          vibrationEnabled: true
        }
      });
    }
  },

  loadGameProgress() {
    try {
      const data = wx.getStorageSync('gameProgress');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载游戏进度失败:', error);
      return null;
    }
  },

  saveGameProgress(progress) {
    try {
      wx.setStorageSync('gameProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('保存游戏进度失败:', error);
    }
  },

  globalData: {
    userInfo: null,
    gameProgress: null
  }
});
