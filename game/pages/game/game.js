const LevelManager = require('../../utils/levelManager');
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
    gameActive: false,
    moves: 0,
    targetMoves: 3
  },

  levelManager: null,
  currentLevel: null,
  animationTimer: null,
  
  async onLoad(options) {
    logger.log('=== pages/game/game.js onLoad ===');
    const levelId = parseInt(options.levelId) || 1;
    this.setData({ 
      levelId,
      dogImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApwgydymAcHiZkKh1m7yRT8Ux1Athx7JWBLVxihj0GvKV9YGLaF_cjL-sNIkQzfCrkFQHfkVcxRYKtcJAeyJ0XuUiQ52EbkxxQKFUe1VqgijE18eZUWu8xuiccee7G2qmudVaCILYLA_reP36lOJoRpFG8Dj0GyAEZ4xI7EBR7FcNmiSck-l2nppKSOQ1Z0GzyHPSxkY1p2RCT0knSz1FXGmGLa7fpJbpRBZPleUWj5Cp2-5aZW3TxuSOe6yQ3mXvdBAmkBB5c5nc',
      wolfImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVeXRADc6lXjRd-XWy9RkmbsKO0Uc4VSgBJAEwxReL1RlNzE7MLaq56uWMFiCpC2ltIZRbkAxwZboY5HDimcU4nGE93iVm3AdtaHaXReUIr_2cCmxe30FVoj9QC2yttS7Y8hQDfoqylTi4VC3s3d95rb1iG-T7EdTiegMqUx23F3uAXZjtO9BtNoHvEha4eStbQKR_1Yd_wuH-aSCCBmUDYmIc3QRoXZdcr_tyVwFTeb54TtsGnNijKh3qAKSrcGT1OB8hwrTc2-o'
    });
    await this.initGame();
  },

  onReady() {
    logger.log('=== pages/game/game.js onReady ===');
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

  async initGame() {
    this.levelManager = new LevelManager();
    await this.levelManager.init();
    
    const progress = await app.loadGameProgress();
    if (progress) {
      this.levelManager.loadProgress(progress);
    }

    const level = this.levelManager.getLevel(this.data.levelId);
    if (level) {
      this.currentLevel = level;
      const targetMoves = this.levelManager.calculateTargetMoves(level);
      this.setData({
        levelName: level.name,
        gameActive: true,
        moves: 0,
        targetMoves
      });
      this.updateTilesFromLevel(level);
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

  updateTilesFromLevel(level) {
    if (!level || !level.tiles) {
      this.setData({ tiles: [] });
      return;
    }

    const displayTiles = level.tiles.map(tile => {
      const x = (tile.gridCol - 1) * CELL_SIZE;
      const y = (tile.gridRow - 1) * CELL_SIZE;
      const width = tile.gridColSpan * CELL_SIZE;
      const height = tile.gridRowSpan * CELL_SIZE;
      
      return {
        id: tile.id,
        type: tile.type,
        unitType: tile.unitType,
        gridCol: tile.gridCol,
        gridRow: tile.gridRow,
        gridColSpan: tile.gridColSpan,
        gridRowSpan: tile.gridRowSpan,
        direction: tile.direction,
        state: tile.state || 'idle',
        displayX: x,
        displayY: y,
        displayWidth: width,
        displayHeight: height,
        opacity: 1
      };
    });
    
    this.setData({ tiles: displayTiles });
  },

  calculateTileDisplayPosition(tile) {
    const x = (tile.currentX !== undefined ? tile.currentX : tile.gridCol - 1) * CELL_SIZE;
    const y = (tile.currentY !== undefined ? tile.currentY : tile.gridRow - 1) * CELL_SIZE;
    const width = tile.gridColSpan * CELL_SIZE;
    const height = tile.gridRowSpan * CELL_SIZE;
    
    return { x, y, width, height };
  },

  handleTileTap(e) {
    if (!this.data.gameActive) {
      return;
    }

    const tileId = e.currentTarget.dataset.tileId;
    const tile = this.data.tiles.find(t => t.id === tileId);
    if (!tile) return;

    logger.log('[触摸] 点击格子:', tileId, '位置:(', tile.gridCol, ',', tile.gridRow, ')');
    
    this.handleTileSlide(tile);
  },

  handleTileSlide(tile) {
    const { Direction, DIRECTION_VECTORS } = require('../../utils/constants');
    
    let direction = tile.direction;
    let vector = DIRECTION_VECTORS[direction];
    
    if (!vector) {
      TT.showToast({
        title: '无法移动',
        icon: 'none'
      });
      return;
    }

    let newCol = tile.gridCol + vector.col * tile.gridColSpan;
    let newRow = tile.gridRow + vector.row * tile.gridRowSpan;

    const isBlocked = this.checkCollision(newCol, newRow, tile);
    const isOutOfBounds = newCol < 1 || newCol > GRID_SIZE || newRow < 1 || newRow > GRID_SIZE;

    if (isOutOfBounds && tile.unitType === 'dog') {
      this.animateTileExit(tile, vector);
      return;
    }

    if (isBlocked || isOutOfBounds) {
      TT.showToast({
        title: '无法移动',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    this.animateTileMove(tile, newCol, newRow);
  },

  checkCollision(newCol, newRow, excludeTile) {
    for (const tile of this.data.tiles) {
      if (tile.id === excludeTile.id) continue;
      
      if (this.tilesOverlap(newCol, newRow, excludeTile.gridColSpan, excludeTile.gridRowSpan,
                           tile.gridCol, tile.gridRow, tile.gridColSpan, tile.gridRowSpan)) {
        return true;
      }
    }
    return false;
  },

  tilesOverlap(col1, row1, spanCol1, spanRow1, col2, row2, spanCol2, spanRow2) {
    return !(col1 + spanCol1 <= col2 || col2 + spanCol2 <= col1 ||
             row1 + spanRow1 <= row2 || row2 + spanRow2 <= row1);
  },

  animateTileMove(tile, newCol, newRow) {
    const newMoves = this.data.moves + 1;
    const tiles = this.data.tiles.map(t => {
      if (t.id === tile.id) {
        return {
          ...t,
          gridCol: newCol,
          gridRow: newRow,
          displayX: (newCol - 1) * CELL_SIZE,
          displayY: (newRow - 1) * CELL_SIZE
        };
      }
      return t;
    });
    
    this.setData({ tiles, moves: newMoves });
  },

  animateTileExit(tile, vector) {
    const newMoves = this.data.moves + 1;
    const tiles = this.data.tiles.map(t => {
      if (t.id === tile.id) {
        return {
          ...t,
          state: 'exiting'
        };
      }
      return t;
    });
    
    this.setData({ tiles, moves: newMoves });

    let currentCol = tile.gridCol;
    let currentRow = tile.gridRow;
    
    const exitAnimation = setInterval(() => {
      currentCol += vector.col;
      currentRow += vector.row;
      
      const tiles = this.data.tiles.map(t => {
        if (t.id === tile.id) {
          return {
            ...t,
            displayX: (currentCol - 1) * CELL_SIZE,
            displayY: (currentRow - 1) * CELL_SIZE,
            opacity: Math.max(0, t.opacity - 0.1)
          };
        }
        return t;
      });
      
      this.setData({ tiles });
      
      if (currentCol < -2 || currentCol > GRID_SIZE + 2 || currentRow < -2 || currentRow > GRID_SIZE + 2) {
        clearInterval(exitAnimation);
        this.handleWin();
      }
    }, 30);
  },

  async handleWin() {
    this.setData({ gameActive: false });

    const moves = this.data.moves;
    const stars = this.levelManager.calculateStars(this.currentLevel, moves);
    const score = this.levelManager.calculateScore(this.currentLevel, moves);
    
    this.levelManager.setCurrentLevel(this.data.levelId);
    this.levelManager.completeLevel(stars, score);
    
    const progress = this.levelManager.saveProgress();
    await app.saveGameProgress(progress);

    setTimeout(() => {
      TT.redirectTo({
        url: `/pages/result/result?result=win&levelId=${this.data.levelId}&stars=${stars}&score=${score}&moves=${moves}`
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

    TT.showToast({
      title: '无法撤销',
      icon: 'none',
      duration: 1000
    });
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
          this.updateTilesFromLevel(this.currentLevel);
          this.setData({ moves: 0 });
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
    this.levelManager = null;
    this.currentLevel = null;
  }
});
