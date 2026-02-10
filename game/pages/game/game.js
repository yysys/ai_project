const PuzzleManager = require('../../utils/puzzleManager');

const app = getApp();

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

  onLoad(options) {
    console.log('游戏页加载', options);
    const levelId = parseInt(options.levelId) || 1;
    this.setData({ 
      levelId,
      dogImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApwgydymAcHiZkKh1m7yRT8Ux1Athx7JWBLVxihj0GvKV9YGLaF_cjL-sNIkQzfCrkFQHfkVcxRYKtcJAeyJ0XuUiQ52EbkxxQKFUe1VqgijE18eZUWu8xuiccee7G2qmudVaCILYLA_reP36lOJoRpFG8Dj0GyAEZ4xI7EBR7FcNmiSck-l2nppKSOQ1Z0GzyHPSxkY1p2RCT0knSz1FXGmGLa7fpJbpRBZPleUWj5Cp2-5aZW3TxoSOe6yQ3mXvdBAmkBB5c5nc',
      wolfImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVeXRADc6lXjRd-XWy9RkmbsKO0Uc4VSgBJAEwxReL1RlNzE7MLaq56uWMFiCpC2ltIZRbkAxwZboY5HDimcU4nGE93iVm3AdtaHaXReUIr_2cCmxe30FVoj9QC2yttS7Y8hQDfoqylTi4VC3s3d95rb1iG-T7EdTiegMqUx23F3uAXZjtO9BtNoHvEha4eStbQKR_1Yd_wuH-aSCCBmUDYmIc3QRoXZdcr_tyWwFTeb54TtsGnNijKh3qAKSrcGT1OB8hwrTc2-o'
    });
    this.initGame();
  },

  onReady() {
    this.startLevel();
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
      wx.showToast({
        title: '关卡加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  updateTiles() {
    const tiles = this.puzzleManager.getTiles();
    this.setData({
      tiles: tiles.map(tile => ({
        id: tile.id,
        type: tile.type,
        unitType: tile.unitType,
        gridCol: tile.gridCol,
        gridRow: tile.gridRow,
        gridColSpan: tile.gridColSpan,
        gridRowSpan: tile.gridRowSpan,
        direction: tile.direction
      }))
    });
  },

  handleTileTap(e) {
    if (!this.data.gameActive) {
      return;
    }

    const tileIndex = e.currentTarget.dataset.tileIndex;
    const tiles = this.data.tiles;
    const tile = tiles[tileIndex];

    if (!tile) return;

    const puzzleTile = this.puzzleManager.getTiles().find(t => t.id === tile.id);
    if (!puzzleTile) return;

    const result = this.puzzleManager.slideTile(puzzleTile);
    
    if (result.moved) {
      this.updateTiles();
      
      if (result.disappeared) {
        if (puzzleTile.unitType === 'dog') {
          this.handleWin();
        }
      }
    }
  },

  handleWin() {
    this.setData({ gameActive: false });

    const level = this.puzzleManager.getCurrentLevel();
    const timeUsed = 0;
    
    const stars = this.puzzleManager.calculateStars(level, timeUsed);
    const score = this.puzzleManager.calculateScore(level, timeUsed);
    
    this.puzzleManager.completeLevel(stars, score);

    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?result=win&levelId=${this.data.levelId}&stars=${stars}&score=${score}`
      });
    }, 500);
  },

  handleLose() {
    this.setData({ gameActive: false });

    setTimeout(() => {
      wx.redirectTo({
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
      wx.showToast({
        title: '已撤销',
        icon: 'success',
        duration: 1000
      });
    } else {
      wx.showToast({
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

    const tiles = this.puzzleManager.getTiles();
    let hintTile = null;

    for (const tile of tiles) {
      const direction = tile.direction;
      const vector = {
        up_left: { col: -1, row: -1 },
        up_right: { col: 1, row: -1 },
        down_left: { col: -1, row: 1 },
        down_right: { col: 1, row: 1 }
      }[direction];

      if (!vector) continue;

      let newCol = tile.gridCol;
      let newRow = tile.gridRow;
      let canSlide = false;

      while (true) {
        const nextCol = newCol + vector.col;
        const nextRow = newRow + vector.row;

        if (nextCol < 1 || nextCol > 14 || 
            nextRow < 1 || nextRow > 14) {
          canSlide = true;
          break;
        }

        const hasCollision = this.checkCollision(tile, nextCol, nextRow);
        if (hasCollision) {
          canSlide = nextCol !== tile.gridCol || nextRow !== tile.gridRow;
          break;
        }

        newCol = nextCol;
        newRow = nextRow;
      }

      if (canSlide) {
        hintTile = tile;
        break;
      }
    }

    if (hintTile) {
      const directionTexts = {
        up_left: '向左上',
        up_right: '向右上',
        down_left: '向左下',
        down_right: '向右下'
      };
      
      wx.showToast({
        title: `提示: 点击${directionTexts[hintTile.direction]}的方块`,
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '没有可移动的方块',
        icon: 'none',
        duration: 2000
      });
    }
  },

  checkCollision(tile, col, row) {
    const tiles = this.puzzleManager.getTiles().filter(t => 
      t.id !== tile.id && t.state !== 'disappeared'
    );

    for (const otherTile of tiles) {
      const colOverlap = col < otherTile.gridCol + otherTile.gridColSpan &&
                         col + tile.gridColSpan > otherTile.gridCol;
      const rowOverlap = row < otherTile.gridRow + otherTile.gridRowSpan &&
                         row + tile.gridRowSpan > otherTile.gridRow;

      if (colOverlap && rowOverlap) {
        return true;
      }
    }

    return false;
  },

  handleReset() {
    if (!this.data.gameActive) {
      return;
    }

    wx.showModal({
      title: '确认重置',
      content: '确定要重置当前关卡吗？',
      success: (res) => {
        if (res.confirm) {
          const success = this.puzzleManager.resetLevel();
          if (success) {
            this.updateTiles();
            wx.showToast({
              title: '已重置',
              icon: 'success',
              duration: 1000
            });
          }
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

  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none',
      duration: 1500
    });
  },

  destroyGame() {
    this.puzzleManager = null;
  }
});
