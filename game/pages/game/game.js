const PuzzleManager = require('../../utils/puzzleManager');
const logger = require('../../utils/logger');
const TT = require('../../utils/tt');

const app = getApp();

const CELL_SIZE = 25;
const GRID_SIZE = 14;
const BOARD_SIZE = CELL_SIZE * GRID_SIZE;

Page({
  data: {
    levelId: 0,
    levelName: '',
    tiles: [],
    dogImageUrl: '',
    wolfImageUrl: '',
    gameActive: false
  },

  puzzleManager: null,
  animationTimer: null,
  
  onLoad(options) {
    logger.log('=== pages/game/game.js onLoad ===');
    const levelId = parseInt(options.levelId) || 1;
    this.setData({ 
      levelId,
      dogImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApwgydymAcHiZkKh1m7yRT8Ux1Athx7JWBLVxihj0GvKV9YGLaF_cjL-sNIkQzfCrkFQHfkVcxRYKtcJAeyJ0XuUiQ52EbkxxQKFUe1VqgijE18eZUWu8xuiccee7G2qmudVaCILYLA_reP36lOJoRpFG8Dj0GyAEZ4xI7EBR7FcNmiSck-l2nppKSOQ1Z0GzyHPSxkY1p2RCT0knSz1FXGmGLa7fpJbpRBZPleUWj5Cp2-5aZW3TxuSOe6yQ3mXvdBAmkBB5c5nc',
      wolfImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVeXRADc6lXjRd-XWy9RkmbsKO0Uc4VSgBJAEwxReL1RlNzE7MLaq56uWMFiCpC2ltIZRbkAxwZboY5HDimcU4nGE93iVm3AdtaHaXReUIr_2cCmxe30FVoj9QC2yttS7Y8hQDfoqylTi4VC3s3d95rb1iG-T7EdTiegMqUx23F3uAXZjtO9BtNoHvEha4eStbQKR_1Yd_wuH-aSCCBmUDYmIc3QRoXZdcr_tyVwFTeb54TtsGnNijKh3qAKSrcGT1OB8hwrTc2-o'
    });
    this.initGame();
  },

  onReady() {
    logger.log('=== pages/game/game.js onReady ===');
    this.startLevel();
  },

  onShow() {
    logger.log('=== pages/game/game.js onShow ===');
  },

  onHide() {
    this.pauseGame();
  },

  onUnload() {
    this.destroyGame();
  },

  initGame() {
    this.puzzleManager = new PuzzleManager();
    const level = this.puzzleManager.getLevel(this.data.levelId);
    if (level) {
      this.setData({
        levelName: level.name
      });
    }
  },

  startLevel() {
    const success = this.puzzleManager.setCurrentLevel(this.data.levelId);
    if (success) {
      const level = this.puzzleManager.getCurrentLevel();
      this.setData({
        levelName: level.name,
        gameActive: true
      });
      this.updateTiles();
    } else {
      TT.showToast({
        title: '关卡加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        TT.navigateBack();
      }, 1500);
    }
  },

  calculateTileDisplayPosition(tile) {
    const x = (tile.currentX !== undefined ? tile.currentX : tile.gridCol - 1) * CELL_SIZE;
    const y = (tile.currentY !== undefined ? tile.currentY : tile.gridRow - 1) * CELL_SIZE;
    const width = tile.gridColSpan * CELL_SIZE;
    const height = tile.gridRowSpan * CELL_SIZE;
    
    return { x, y, width, height };
  },

  updateTiles() {
    const tiles = this.puzzleManager.getTiles();
    const displayTiles = tiles.map(tile => {
      const pos = this.calculateTileDisplayPosition(tile);
      return {
        id: tile.id,
        type: tile.type,
        unitType: tile.unitType,
        gridCol: tile.gridCol,
        gridRow: tile.gridRow,
        gridColSpan: tile.gridColSpan,
        gridRowSpan: tile.gridRowSpan,
        direction: tile.direction,
        state: tile.state,
        displayX: pos.x,
        displayY: pos.y,
        displayWidth: pos.width,
        displayHeight: pos.height,
        opacity: tile.opacity !== undefined ? tile.opacity : 1
      };
    });
    
    this.setData({ tiles: displayTiles });
  },

  handleTileTap(e) {
    if (!this.data.gameActive) {
      return;
    }

    const tileId = e.currentTarget.dataset.tileId;
    const puzzleTile = this.puzzleManager.getTiles().find(t => t.id === tileId);
    if (!puzzleTile) return;

    logger.log('[触摸] 点击格子:', tileId, '位置:(', puzzleTile.gridCol, ',', puzzleTile.gridRow, ')');
    
    const result = this.puzzleManager.slideTile(puzzleTile);
    
    if (result.moved) {
      this.startAnimationLoop();
      
      if (result.disappeared) {
        this.watchTileDisappearance(puzzleTile);
      }
    }
  },

  startAnimationLoop() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
    
    let lastTime = Date.now();
    
    this.animationTimer = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      const tiles = this.puzzleManager.getTiles();
      let hasAnimatingTiles = false;
      
      tiles.forEach(tile => {
        if (tile.animating) {
          this.puzzleManager.updateTileAnimation(tile, deltaTime);
          hasAnimatingTiles = true;
        }
      });
      
      this.updateTiles();
      
      if (!hasAnimatingTiles) {
        clearInterval(this.animationTimer);
        this.animationTimer = null;
      }
    }, 16);
  },

  watchTileDisappearance(tile) {
    const checkInterval = setInterval(() => {
      const currentTile = this.puzzleManager.getTiles().find(t => t.id === tile.id);
      if (!currentTile || currentTile.state === 'disappeared') {
        clearInterval(checkInterval);
        if (tile.unitType === 'dog') {
          this.handleWin();
        }
      }
    }, 100);
  },

  handleWin() {
    this.setData({ gameActive: false });

    const level = this.puzzleManager.getCurrentLevel();
    const timeUsed = 0;
    
    const stars = this.puzzleManager.calculateStars(level, timeUsed);
    const score = this.puzzleManager.calculateScore(level, timeUsed);
    
    this.puzzleManager.completeLevel(stars, score);

    setTimeout(() => {
      TT.redirectTo({
        url: `/pages/result/result?result=win&levelId=${this.data.levelId}&stars=${stars}&score=${score}`
      });
    }, 500);
  },

  handleLose() {
    this.setData({ gameActive: false });

    setTimeout(() => {
      TT.redirectTo({
        url: `/pages/result/result?result=lose&levelId=${this.data.levelId}`
      });
    }, 500);
  },

  handleUndo() {
    if (!this.data.gameActive) {
      return;
    }

    const success = this.puzzleManager.undo();
    if (success) {
      this.updateTiles();
      TT.showToast({
        title: '已撤销',
        icon: 'success',
        duration: 1000
      });
    } else {
      TT.showToast({
        title: '无法撤销',
        icon: 'none',
        duration: 1000
      });
    }
  },

  handleHint() {
    if (!this.data.gameActive) {
      return;
    }

    TT.showToast({
      title: '提示功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  handleReset() {
    if (!this.data.gameActive) {
      return;
    }

    TT.showModal({
      title: '确认重置',
      content: '确定要重置当前关卡吗？',
      success: (res) => {
        if (res.confirm) {
          this.puzzleManager.resetLevel();
          this.updateTiles();
          TT.showToast({
            title: '已重置',
            icon: 'success',
            duration: 1000
          });
        }
      }
    });
  },

  pauseGame() {
    if (!this.data.gameActive) {
      return;
    }
  },

  resumeGame() {
    if (!this.data.gameActive) {
      return;
    }
  },

  goBack() {
    if (this.data.gameActive) {
      TT.showModal({
        title: '确认退出',
        content: '当前游戏进度将丢失，确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            this.destroyGame();
            TT.navigateBack();
          }
        }
      });
    } else {
      TT.navigateBack();
    }
  },

  showSettings() {
    logger.saveLog();
    TT.showToast({
      title: '日志已保存',
      icon: 'none',
      duration: 1500
    });
  },

  saveLog() {
    return logger.saveLog();
  },

  destroyGame() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    this.puzzleManager = null;
  }
});
