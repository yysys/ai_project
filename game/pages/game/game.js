const GameEngine = require('../../utils/gameEngine');
const { GameState } = require('../../utils/constants');

const app = getApp();

Page({
  data: {
    levelId: 0,
    levelName: '',
    timeRemaining: 0,
    isTimed: false,
    isPaused: false,
    gameActive: false
  },

  gameEngine: null,
  canvas: null,
  ctx: null,
  timerInterval: null,

  onLoad(options) {
    console.log('游戏页加载', options);
    const levelId = parseInt(options.levelId) || 1;
    this.setData({ levelId });
    this.initGame();
  },

  onReady() {
    this.createCanvas();
  },

  onShow() {
    console.log('游戏页显示');
  },

  onHide() {
    this.pauseGame();
  },

  onUnload() {
    this.destroyGame();
  },

  createCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.error('Canvas not found');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.ctx = ctx;

        this.initGameEngine(res[0].width, res[0].height);
      });
  },

  initGameEngine(width, height) {
    this.gameEngine = new GameEngine();
    this.gameEngine.init(this.canvas, this.ctx, width, height);

    this.gameEngine.onWin = () => {
      this.handleWin();
    };

    this.gameEngine.onLose = () => {
      this.handleLose();
    };

    this.gameEngine.onUpdate = (elapsedTime) => {
      this.updateUI(elapsedTime);
    };

    this.startLevel();
  },

  initGame() {
    const level = this.gameEngine ? this.gameEngine.levelManager.getLevel(this.data.levelId) : null;
    if (level) {
      this.setData({
        levelName: level.name,
        isTimed: level.type === 'timed',
        timeRemaining: level.timeLimit || 0
      });
    }
  },

  startLevel() {
    const success = this.gameEngine.startLevel(this.data.levelId);
    if (success) {
      const level = this.gameEngine.levelManager.getCurrentLevel();
      this.setData({
        levelName: level.name,
        isTimed: level.type === 'timed',
        timeRemaining: level.timeLimit || 0,
        gameActive: true
      });

      if (this.data.isTimed) {
        this.startTimer();
      }
    } else {
      wx.showToast({
        title: '关卡加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (!this.data.isPaused && this.data.gameActive) {
        const elapsedTime = this.gameEngine.gameStateManager.getElapsedTime();
        const level = this.gameEngine.levelManager.getCurrentLevel();
        const timeRemaining = Math.max(0, level.timeLimit - elapsedTime);
        
        this.setData({ timeRemaining });
      }
    }, 100);
  },

  updateUI(elapsedTime) {
    if (this.data.isTimed) {
      const level = this.gameEngine.levelManager.getCurrentLevel();
      const timeRemaining = Math.max(0, level.timeLimit - elapsedTime);
      this.setData({ timeRemaining });
    }
  },

  handleCanvasTouch(e) {
    if (!this.data.gameActive || this.data.isPaused) {
      return;
    }

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.gameEngine.handleClick(x, y);
  },

  handleWin() {
    this.setData({ gameActive: false });
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const level = this.gameEngine.levelManager.getCurrentLevel();
    const stars = level.stars;
    const score = level.score;

    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?result=win&levelId=${this.data.levelId}&stars=${stars}&score=${score}`
      });
    }, 500);
  },

  handleLose() {
    this.setData({ gameActive: false });
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?result=lose&levelId=${this.data.levelId}`
      });
    }, 500);
  },

  pauseGame() {
    if (!this.data.gameActive || this.data.isPaused) {
      return;
    }
    
    this.gameEngine.pause();
    this.setData({ isPaused: true });
  },

  resumeGame() {
    if (!this.data.gameActive || !this.data.isPaused) {
      return;
    }
    
    this.gameEngine.resume();
    this.setData({ isPaused: false });
  },

  resetGame() {
    if (!this.data.gameActive) {
      return;
    }
    
    this.gameEngine.reset();
    this.startLevel();
  },

  goBack() {
    if (this.data.gameActive) {
      wx.showModal({
        title: '确认退出',
        content: '当前游戏进度将丢失，确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            this.destroyGame();
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  destroyGame() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.gameEngine) {
      this.gameEngine.destroy();
      this.gameEngine = null;
    }

    this.canvas = null;
    this.ctx = null;
  }
});
