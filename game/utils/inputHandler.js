const { TILE_CONFIG, GAME_CONFIG, UnitState, Direction, DIRECTION_VECTORS } = require('./constants');
const logger = require('./logger');

class InputHandler {
  constructor(config = {}) {
    this.canvas = null;
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.gridSize = TILE_CONFIG.gridSize;
    this.rotation = GAME_CONFIG.BOARD_ROTATION;
    
    this.touchStartCallbacks = [];
    this.touchMoveCallbacks = [];
    this.touchEndCallbacks = [];
    
    this.boundHandlers = {
      touchStart: null,
      touchMove: null,
      touchEnd: null
    };
    
    this.undoLimit = config.undoLimit || 5;
    this.hintLimit = config.hintLimit || 3;
    this.undoCount = 0;
    this.hintCount = 0;
    
    this.hintedTiles = [];
    this.hintHighlightTimeout = null;
    
    this.isBound = false;
    this.platform = this._detectPlatform();
  }

  _detectPlatform() {
    if (typeof tt !== 'undefined') {
      return 'douyin';
    } else if (typeof wx !== 'undefined') {
      return 'wechat';
    } else if (typeof window !== 'undefined') {
      return 'web';
    }
    return 'unknown';
  }

  init(canvas, screenWidth, screenHeight) {
    this.canvas = canvas;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.undoCount = 0;
    this.hintCount = 0;
    this.hintedTiles = [];
    
    logger.log('InputHandler 初始化完成', {
      screenWidth,
      screenHeight,
      gridSize: this.gridSize,
      platform: this.platform
    });
  }

  bindEvents() {
    if (this.isBound) {
      logger.log('事件已绑定，跳过');
      return;
    }

    this.boundHandlers.touchStart = this._handleTouchStart.bind(this);
    this.boundHandlers.touchMove = this._handleTouchMove.bind(this);
    this.boundHandlers.touchEnd = this._handleTouchEnd.bind(this);

    if (this.platform === 'douyin' || this.platform === 'wechat') {
      const api = this.platform === 'douyin' ? tt : wx;
      
      api.onTouchStart(this.boundHandlers.touchStart);
      api.onTouchMove(this.boundHandlers.touchMove);
      api.onTouchEnd(this.boundHandlers.touchEnd);
    } else if (this.platform === 'web' && this.canvas) {
      this.canvas.addEventListener('touchstart', this.boundHandlers.touchStart);
      this.canvas.addEventListener('touchmove', this.boundHandlers.touchMove);
      this.canvas.addEventListener('touchend', this.boundHandlers.touchEnd);
      this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
      this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
      this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
    }

    this.isBound = true;
    logger.log('事件绑定完成');
  }

  unbindEvents() {
    if (!this.isBound) return;

    if (this.platform === 'douyin' || this.platform === 'wechat') {
      const api = this.platform === 'douyin' ? tt : wx;
      
      api.offTouchStart(this.boundHandlers.touchStart);
      api.offTouchMove(this.boundHandlers.touchMove);
      api.offTouchEnd(this.boundHandlers.touchEnd);
    } else if (this.platform === 'web' && this.canvas) {
      this.canvas.removeEventListener('touchstart', this.boundHandlers.touchStart);
      this.canvas.removeEventListener('touchmove', this.boundHandlers.touchMove);
      this.canvas.removeEventListener('touchend', this.boundHandlers.touchEnd);
    }

    this.isBound = false;
    logger.log('事件解绑完成');
  }

  _handleTouchStart(event) {
    const touch = this._extractTouch(event);
    if (!touch) return;

    this.touchStartCallbacks.forEach(callback => {
      try {
        callback(touch);
      } catch (e) {
        logger.error('TouchStart callback error:', e);
      }
    });
  }

  _handleTouchMove(event) {
    const touch = this._extractTouch(event);
    if (!touch) return;

    this.touchMoveCallbacks.forEach(callback => {
      try {
        callback(touch);
      } catch (e) {
        logger.error('TouchMove callback error:', e);
      }
    });
  }

  _handleTouchEnd(event) {
    const touch = this._extractTouch(event);
    if (!touch) return;

    this.touchEndCallbacks.forEach(callback => {
      try {
        callback(touch);
      } catch (e) {
        logger.error('TouchEnd callback error:', e);
      }
    });
  }

  _handleMouseDown(event) {
    const touch = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    };
    this.touchStartCallbacks.forEach(callback => callback(touch));
  }

  _handleMouseMove(event) {
    const touch = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    };
    this.touchMoveCallbacks.forEach(callback => callback(touch));
  }

  _handleMouseUp(event) {
    const touch = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    };
    this.touchEndCallbacks.forEach(callback => callback(touch));
  }

  _extractTouch(event) {
    let x, y;
    
    if (this.platform === 'douyin' || this.platform === 'wechat') {
      const touches = event.touches || event.changedTouches;
      if (!touches || touches.length === 0) return null;
      x = touches[0].clientX;
      y = touches[0].clientY;
    } else {
      x = event.x || event.clientX;
      y = event.y || event.clientY;
    }

    return {
      x,
      y,
      timestamp: Date.now()
    };
  }

  onTouchStart(callback) {
    this.touchStartCallbacks.push(callback);
    return () => {
      const index = this.touchStartCallbacks.indexOf(callback);
      if (index > -1) {
        this.touchStartCallbacks.splice(index, 1);
      }
    };
  }

  onTouchMove(callback) {
    this.touchMoveCallbacks.push(callback);
    return () => {
      const index = this.touchMoveCallbacks.indexOf(callback);
      if (index > -1) {
        this.touchMoveCallbacks.splice(index, 1);
      }
    };
  }

  onTouchEnd(callback) {
    this.touchEndCallbacks.push(callback);
    return () => {
      const index = this.touchEndCallbacks.indexOf(callback);
      if (index > -1) {
        this.touchEndCallbacks.splice(index, 1);
      }
    };
  }

  getTileAtPosition(screenX, screenY, tiles) {
    if (!tiles || tiles.length === 0) {
      return null;
    }

    const gridPos = this.screenToGrid(screenX, screenY);
    
    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i];
      
      if (tile.state === UnitState.DISAPPEARED) continue;
      if (tile.animating) continue;
      
      if (this._isPointInTile(gridPos.col, gridPos.row, tile)) {
        logger.log('点击命中格子:', {
          tileId: tile.id,
          gridCol: tile.gridCol,
          gridRow: tile.gridRow,
          clickPos: gridPos
        });
        return tile;
      }
    }

    return null;
  }

  _isPointInTile(col, row, tile) {
    const tileLeft = tile.gridCol;
    const tileRight = tile.gridCol + tile.gridColSpan - 1;
    const tileTop = tile.gridRow;
    const tileBottom = tile.gridRow + tile.gridRowSpan - 1;

    return col >= tileLeft && col <= tileRight &&
           row >= tileTop && row <= tileBottom;
  }

  screenToGrid(screenX, screenY) {
    const sqrt2 = Math.sqrt(2);
    const maxGridWidth = this.screenWidth / sqrt2;
    const maxGridHeight = this.screenHeight / sqrt2;
    
    const tileSize = Math.min(maxGridWidth, maxGridHeight) / this.gridSize;
    const gridWidth = tileSize * this.gridSize;
    const gridHeight = tileSize * this.gridSize;
    
    const offsetX = (this.screenWidth - gridWidth) / 2;
    const offsetY = (this.screenHeight - gridHeight) / 2;

    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;

    const dx = screenX - centerX;
    const dy = screenY - centerY;

    const angle = -this.rotation * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    const localX = rotatedX + centerX;
    const localY = rotatedY + centerY;

    const gridCol = Math.floor((localX - offsetX) / tileSize) + 1;
    const gridRow = Math.floor((localY - offsetY) / tileSize) + 1;

    return {
      col: gridCol,
      row: gridRow,
      tileSize,
      offsetX,
      offsetY,
      localX,
      localY
    };
  }

  gridToScreen(col, row) {
    const sqrt2 = Math.sqrt(2);
    const maxGridWidth = this.screenWidth / sqrt2;
    const maxGridHeight = this.screenHeight / sqrt2;
    
    const tileSize = Math.min(maxGridWidth, maxGridHeight) / this.gridSize;
    const gridWidth = tileSize * this.gridSize;
    const gridHeight = tileSize * this.gridSize;
    
    const offsetX = (this.screenWidth - gridWidth) / 2;
    const offsetY = (this.screenHeight - gridHeight) / 2;

    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;

    const localX = offsetX + (col - 1) * tileSize + tileSize / 2;
    const localY = offsetY + (row - 1) * tileSize + tileSize / 2;

    const dx = localX - centerX;
    const dy = localY - centerY;

    const angle = this.rotation * Math.PI / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY
    };
  }

  rotateCoordinates(x, y, angle) {
    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;

    const dx = x - centerX;
    const dy = y - centerY;

    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY
    };
  }

  canUndo() {
    return this.undoCount < this.undoLimit;
  }

  getUndoCount() {
    return this.undoCount;
  }

  getRemainingUndoCount() {
    return Math.max(0, this.undoLimit - this.undoCount);
  }

  incrementUndoCount() {
    if (this.canUndo()) {
      this.undoCount++;
      return true;
    }
    return false;
  }

  resetUndoCount() {
    this.undoCount = 0;
  }

  canShowHint() {
    return this.hintCount < this.hintLimit;
  }

  getHintCount() {
    return this.hintCount;
  }

  getRemainingHintCount() {
    return Math.max(0, this.hintLimit - this.hintCount);
  }

  incrementHintCount() {
    if (this.canShowHint()) {
      this.hintCount++;
      return true;
    }
    return false;
  }

  resetHintCount() {
    this.hintCount = 0;
  }

  findHintTiles(tiles, puzzleManager) {
    if (!tiles || tiles.length === 0) {
      return [];
    }

    const hintTiles = [];

    for (const tile of tiles) {
      if (tile.state !== UnitState.IDLE) continue;
      if (tile.animating) continue;

      const canSlide = this._checkTileCanSlide(tile, tiles, puzzleManager);
      if (canSlide.canMove) {
        hintTiles.push({
          tile,
          direction: tile.direction,
          willDisappear: canSlide.willDisappear,
          distance: canSlide.distance
        });
      }
    }

    return hintTiles;
  }

  _checkTileCanSlide(tile, tiles, puzzleManager) {
    const direction = tile.direction;
    const vector = DIRECTION_VECTORS[direction];

    if (!vector) {
      return { canMove: false, reason: 'invalid_direction' };
    }

    let currentCol = tile.gridCol;
    let currentRow = tile.gridRow;
    let distance = 0;

    while (true) {
      const nextCol = currentCol + vector.col;
      const nextRow = currentRow + vector.row;

      const isInsideDiamond = puzzleManager.isPositionInDiamond(
        nextCol, nextRow,
        tile.gridColSpan, tile.gridRowSpan
      );

      if (!isInsideDiamond) {
        if (distance === 0) {
          return { canMove: false, reason: 'blocked_by_boundary' };
        }
        return { canMove: true, willDisappear: false, distance };
      }

      const hasCollision = puzzleManager.checkCollision(tile, nextCol, nextRow);
      if (hasCollision) {
        if (distance === 0) {
          return { canMove: false, reason: 'blocked_by_collision' };
        }
        return { canMove: true, willDisappear: false, distance };
      }

      currentCol = nextCol;
      currentRow = nextRow;
      distance++;
    }
  }

  highlightHintTiles(tiles, duration = 2000) {
    this.clearHintHighlight();

    this.hintedTiles = tiles.map(hint => hint.tile.id);

    if (this.hintHighlightTimeout) {
      clearTimeout(this.hintHighlightTimeout);
    }

    this.hintHighlightTimeout = setTimeout(() => {
      this.clearHintHighlight();
    }, duration);

    return this.hintedTiles;
  }

  clearHintHighlight() {
    if (this.hintHighlightTimeout) {
      clearTimeout(this.hintHighlightTimeout);
      this.hintHighlightTimeout = null;
    }
    this.hintedTiles = [];
  }

  isTileHighlighted(tileId) {
    return this.hintedTiles.includes(tileId);
  }

  getHintedTileIds() {
    return [...this.hintedTiles];
  }

  setScreenSize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  reset() {
    this.undoCount = 0;
    this.hintCount = 0;
    this.clearHintHighlight();
  }

  destroy() {
    this.unbindEvents();
    this.touchStartCallbacks = [];
    this.touchMoveCallbacks = [];
    this.touchEndCallbacks = [];
    this.clearHintHighlight();
    this.canvas = null;
  }
}

class InteractionManager {
  constructor(config = {}) {
    this.inputHandler = new InputHandler(config);
    this.puzzleManager = null;
    
    this.undoLimit = config.undoLimit || 5;
    this.hintLimit = config.hintLimit || 3;
    
    this.onUndoCallback = null;
    this.onResetCallback = null;
    this.onHintCallback = null;
    this.onTileClickCallback = null;
    
    this.resetConfirmEnabled = config.resetConfirmEnabled !== false;
    this.resetAnimationEnabled = config.resetAnimationEnabled !== false;
  }

  init(canvas, screenWidth, screenHeight, puzzleManager) {
    this.inputHandler.init(canvas, screenWidth, screenHeight);
    this.puzzleManager = puzzleManager;
    
    this.inputHandler.onTouchEnd((touch) => {
      this._handleTouchEnd(touch);
    });
  }

  _handleTouchEnd(touch) {
    if (!this.puzzleManager) return;

    const tiles = this.puzzleManager.getTiles();
    const tile = this.inputHandler.getTileAtPosition(touch.x, touch.y, tiles);

    if (tile && this.onTileClickCallback) {
      this.onTileClickCallback(tile, touch);
    }
  }

  bindEvents() {
    this.inputHandler.bindEvents();
  }

  unbindEvents() {
    this.inputHandler.unbindEvents();
  }

  handleClick(x, y) {
    if (!this.puzzleManager) {
      return { success: false, reason: 'no_puzzle_manager' };
    }

    const tiles = this.puzzleManager.getTiles();
    const tile = this.inputHandler.getTileAtPosition(x, y, tiles);

    if (!tile) {
      return { success: false, reason: 'no_tile_at_position' };
    }

    return { success: true, tile };
  }

  canUndo() {
    return this.inputHandler.canUndo();
  }

  undo() {
    if (!this.puzzleManager) {
      return { success: false, reason: 'no_puzzle_manager' };
    }

    if (!this.canUndo()) {
      return { 
        success: false, 
        reason: 'undo_limit_reached',
        remainingCount: 0
      };
    }

    const result = this.puzzleManager.undo();
    
    if (result) {
      this.inputHandler.incrementUndoCount();
      
      if (this.onUndoCallback) {
        this.onUndoCallback({
          remainingCount: this.inputHandler.getRemainingUndoCount()
        });
      }

      return { 
        success: true,
        remainingCount: this.inputHandler.getRemainingUndoCount()
      };
    }

    return { success: false, reason: 'no_history' };
  }

  getUndoState() {
    return {
      canUndo: this.canUndo(),
      usedCount: this.inputHandler.getUndoCount(),
      remainingCount: this.inputHandler.getRemainingUndoCount(),
      limit: this.undoLimit
    };
  }

  canReset() {
    return true;
  }

  reset(options = {}) {
    if (!this.puzzleManager) {
      return { success: false, reason: 'no_puzzle_manager' };
    }

    const skipConfirm = options.skipConfirm || !this.resetConfirmEnabled;

    if (!skipConfirm) {
      return { 
        success: false, 
        reason: 'confirmation_required',
        showConfirm: true
      };
    }

    this.puzzleManager.resetLevel();
    this.inputHandler.reset();

    if (this.onResetCallback) {
      this.onResetCallback({ animated: this.resetAnimationEnabled });
    }

    return { success: true, animated: this.resetAnimationEnabled };
  }

  confirmReset() {
    if (!this.puzzleManager) {
      return { success: false, reason: 'no_puzzle_manager' };
    }

    this.puzzleManager.resetLevel();
    this.inputHandler.reset();

    if (this.onResetCallback) {
      this.onResetCallback({ animated: this.resetAnimationEnabled });
    }

    return { success: true, animated: this.resetAnimationEnabled };
  }

  canShowHint() {
    return this.inputHandler.canShowHint();
  }

  getHint() {
    if (!this.puzzleManager) {
      return { success: false, reason: 'no_puzzle_manager' };
    }

    if (!this.canShowHint()) {
      return { 
        success: false, 
        reason: 'hint_limit_reached',
        remainingCount: 0
      };
    }

    const tiles = this.puzzleManager.getTiles();
    const hintTiles = this.inputHandler.findHintTiles(tiles, this.puzzleManager);

    if (hintTiles.length === 0) {
      return { success: false, reason: 'no_movable_tiles' };
    }

    this.inputHandler.incrementHintCount();
    const highlightedIds = this.inputHandler.highlightHintTiles(hintTiles);

    if (this.onHintCallback) {
      this.onHintCallback({
        tiles: hintTiles,
        highlightedIds,
        remainingCount: this.inputHandler.getRemainingHintCount()
      });
    }

    return { 
      success: true, 
      tiles: hintTiles,
      highlightedIds,
      remainingCount: this.inputHandler.getRemainingHintCount()
    };
  }

  getHintState() {
    return {
      canShowHint: this.canShowHint(),
      usedCount: this.inputHandler.getHintCount(),
      remainingCount: this.inputHandler.getRemainingHintCount(),
      limit: this.hintLimit
    };
  }

  getHighlightedTiles() {
    return this.inputHandler.getHintedTileIds();
  }

  isTileHighlighted(tileId) {
    return this.inputHandler.isTileHighlighted(tileId);
  }

  clearHintHighlight() {
    this.inputHandler.clearHintHighlight();
  }

  onUndo(callback) {
    this.onUndoCallback = callback;
  }

  onReset(callback) {
    this.onResetCallback = callback;
  }

  onHint(callback) {
    this.onHintCallback = callback;
  }

  onTileClick(callback) {
    this.onTileClickCallback = callback;
  }

  setScreenSize(width, height) {
    this.inputHandler.setScreenSize(width, height);
  }

  screenToGrid(x, y) {
    return this.inputHandler.screenToGrid(x, y);
  }

  gridToScreen(col, row) {
    return this.inputHandler.gridToScreen(col, row);
  }

  resetCounts() {
    this.inputHandler.reset();
  }

  destroy() {
    this.inputHandler.destroy();
    this.puzzleManager = null;
    this.onUndoCallback = null;
    this.onResetCallback = null;
    this.onHintCallback = null;
    this.onTileClickCallback = null;
  }
}

module.exports = {
  InputHandler,
  InteractionManager
};
