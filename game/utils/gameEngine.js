const { GameState, TILE_CONFIG, GAME_CONFIG, ANIMATION_CONFIG, UnitState } = require('./constants');
const PuzzleManager = require('./puzzleManager');
const Renderer = require('./renderer');
const logger = require('./logger');

const requestAnimationFrame = (typeof tt !== 'undefined' && tt.requestAnimationFrame) 
  ? tt.requestAnimationFrame.bind(tt) 
  : (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (cb) => setTimeout(cb, 16));

const cancelAnimationFrame = (typeof tt !== 'undefined' && tt.cancelAnimationFrame)
  ? tt.cancelAnimationFrame.bind(tt)
  : (typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout);

class EventSystem {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.events.get(event)?.delete(callback);
  }

  emit(event, data) {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        logger.error('Event callback error:', e);
      }
    });
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear() {
    this.events.clear();
  }
}

class StateManager {
  constructor(initialState = {}) {
    this.state = {
      status: GameState.IDLE,
      currentLevelId: null,
      elapsedTime: 0,
      score: 0,
      stars: 0,
      isPaused: false,
      moveCount: 0,
      ...initialState
    };
    this.listeners = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(partial) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partial };
    this.notifyListeners(oldState, this.state);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners(oldState, newState) {
    this.listeners.forEach(listener => {
      try {
        listener(oldState, newState);
      } catch (e) {
        logger.error('State listener error:', e);
      }
    });
  }

  reset() {
    this.setState({
      status: GameState.IDLE,
      currentLevelId: null,
      elapsedTime: 0,
      score: 0,
      stars: 0,
      isPaused: false,
      moveCount: 0
    });
  }
}

class GameEngine {
  constructor() {
    this.puzzleManager = new PuzzleManager();
    this.renderer = new Renderer();
    this.eventSystem = new EventSystem();
    this.stateManager = new StateManager();
    
    this.lastTimestamp = 0;
    this.deltaTime = 0;
    this.targetFPS = GAME_CONFIG.TARGET_FPS;
    this.frameTime = 1000 / this.targetFPS;
    
    this.canvas = null;
    this.ctx = null;
    this.screenWidth = 0;
    this.screenHeight = 0;
    
    this.isInitialized = false;
    this.animationId = null;
    
    this.onWin = null;
    this.onLose = null;
    this.onUpdate = null;

    this._setupStateListener();
  }

  _setupStateListener() {
    this.stateManager.subscribe((oldState, newState) => {
      if (oldState.status !== newState.status) {
        this.eventSystem.emit('stateChange', {
          oldStatus: oldState.status,
          newStatus: newState.status,
          state: newState
        });
      }
    });
  }

  on(event, callback) {
    return this.eventSystem.on(event, callback);
  }

  off(event, callback) {
    this.eventSystem.off(event, callback);
  }

  emit(event, data) {
    this.eventSystem.emit(event, data);
  }

  init(canvas, ctx, screenWidth, screenHeight) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.renderer.init(canvas, ctx);
    this.renderer.setScreenSize(screenWidth, screenHeight);
    
    this.puzzleManager.setScreenSize(screenWidth, screenHeight);
    
    this.isInitialized = true;
    this.stateManager.setState({ status: GameState.IDLE });
    
    this.emit('init', { screenWidth, screenHeight });
  }

  startLevel(levelId) {
    if (!this.isInitialized) {
      logger.error('GameEngine not initialized');
      return false;
    }

    const success = this.puzzleManager.setCurrentLevel(levelId);
    if (!success) {
      logger.error('Failed to set current level');
      return false;
    }

    this.stateManager.setState({
      status: GameState.PLAYING,
      currentLevelId: levelId,
      elapsedTime: 0,
      moveCount: 0
    });

    this.emit('levelStart', { levelId });
    
    this.startGameLoop();
    
    return true;
  }

  startGameLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.lastTimestamp = performance.now();
    this._gameLoop(this.lastTimestamp);
  }

  _gameLoop(timestamp) {
    const currentState = this.stateManager.getState();
    
    if (currentState.status === GameState.WIN || currentState.status === GameState.LOSE) {
      return;
    }

    if (currentState.status === GameState.PAUSED) {
      this.animationId = requestAnimationFrame(this._gameLoop.bind(this));
      return;
    }

    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this._update();
    this._render();

    this.animationId = requestAnimationFrame(this._gameLoop.bind(this));
  }

  _update() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status !== GameState.PLAYING) {
      return;
    }

    const newElapsedTime = currentState.elapsedTime + this.deltaTime;
    this.stateManager.setState({ elapsedTime: newElapsedTime });

    const tiles = this.puzzleManager.getTiles();
    
    tiles.forEach(tile => {
      if (tile.animating) {
        this.puzzleManager.updateTileAnimation(tile, this.deltaTime);
      }
    });

    this.renderer.updateAnimations(this.deltaTime);

    if (this.puzzleManager.checkWinCondition()) {
      this._handleWin();
    }

    if (this.onUpdate) {
      this.onUpdate(newElapsedTime);
    }
  }

  _handleWin() {
    const level = this.puzzleManager.getCurrentLevel();
    const currentState = this.stateManager.getState();
    const timeUsed = currentState.elapsedTime;
    
    const stars = this.puzzleManager.calculateStars(level, timeUsed);
    const score = this.puzzleManager.calculateScore(level, timeUsed);
    
    this.puzzleManager.completeLevel(stars, score);
    
    this.renderer.startWinAnimation(() => {
      this.stateManager.setState({
        status: GameState.WIN,
        stars,
        score
      });

      this.emit('win', {
        levelId: level.id,
        stars,
        score,
        timeUsed,
        moveCount: currentState.moveCount
      });
      
      if (this.onWin) {
        this.onWin({ stars, score, timeUsed });
      }
    });
  }

  _handleLose() {
    this.stateManager.setState({ status: GameState.LOSE });
    
    this.emit('lose', {
      timeUsed: this.stateManager.getState().elapsedTime
    });
    
    if (this.onLose) {
      this.onLose();
    }
  }

  handleClick(x, y) {
    const currentState = this.stateManager.getState();
    
    if (currentState.status !== GameState.PLAYING) {
      logger.log('点击事件：游戏不在 PLAYING 状态', currentState.status);
      return false;
    }

    const tile = this.getTileAtPosition(x, y);

    if (tile) {
      if (tile.animating || tile.state !== UnitState.IDLE) {
        return false;
      }
      
      const result = this.puzzleManager.slideTile(tile);
      
      if (result.moved) {
        this.stateManager.setState({
          moveCount: currentState.moveCount + 1
        });
        
        this.emit('tileSlide', {
          tile,
          result,
          moveCount: currentState.moveCount + 1
        });
      }
      
      return result.moved;
    }

    return false;
  }

  getTileAtPosition(screenX, screenY) {
    const tiles = this.puzzleManager.getTiles();
    
    const gridPos = this.renderer.screenToGrid(screenX, screenY);
    
    const sqrt2 = Math.sqrt(2);
    const maxGridWidth = this.screenWidth / sqrt2;
    const maxGridHeight = this.screenHeight / sqrt2;
    const tileSize = Math.min(maxGridWidth, maxGridHeight) / TILE_CONFIG.gridSize;
    const gridWidth = tileSize * TILE_CONFIG.gridSize;
    const gridHeight = tileSize * TILE_CONFIG.gridSize;
    const offsetX = (this.screenWidth - gridWidth) / 2;
    const offsetY = (this.screenHeight - gridHeight) / 2;

    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;

    const dx = screenX - centerX;
    const dy = screenY - centerY;

    const angle = -45 * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    const localX = rotatedX + centerX;
    const localY = rotatedY + centerY;

    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i];
      
      if (tile.state === UnitState.DISAPPEARED) continue;
      
      const tileX = offsetX + (tile.gridCol - 1) * tileSize;
      const tileY = offsetY + (tile.gridRow - 1) * tileSize;
      const tileWidth = tile.gridColSpan * tileSize;
      const tileHeight = tile.gridRowSpan * tileSize;

      if (localX >= tileX && localX < tileX + tileWidth &&
          localY >= tileY && localY < tileY + tileHeight) {
        return tile;
      }
    }

    return null;
  }

  undo() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status !== GameState.PLAYING) {
      return false;
    }

    const result = this.puzzleManager.undo();
    
    if (result) {
      this.emit('undo', { moveCount: currentState.moveCount - 1 });
    }
    
    return result;
  }

  reset() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status !== GameState.PLAYING) {
      return false;
    }

    this.puzzleManager.resetLevel();
    this.stateManager.setState({
      elapsedTime: 0,
      moveCount: 0
    });
    
    this.emit('levelReset', { levelId: currentState.currentLevelId });
    
    return true;
  }

  getHint() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status !== GameState.PLAYING) {
      return null;
    }

    const tiles = this.puzzleManager.getTiles();
    const dogTile = this.puzzleManager.getDogTile();
    
    if (!dogTile) return null;

    for (const tile of tiles) {
      const result = this._canSlideTile(tile);
      if (result.canSlide) {
        return {
          tile: tile,
          direction: tile.direction
        };
      }
    }

    return null;
  }

  _canSlideTile(tile) {
    const direction = tile.direction;
    const vector = this.puzzleManager.getDirectionVector ? 
      this.puzzleManager.getDirectionVector(direction) :
      null;
    
    if (!vector) {
      return { canSlide: false, reason: 'invalid_direction' };
    }

    let newCol = tile.gridCol;
    let newRow = tile.gridRow;

    while (true) {
      const nextCol = newCol + vector.col;
      const nextRow = newRow + vector.row;

      const boundaryCheck = this._checkBoundary(tile, nextCol, nextRow);
      
      if (boundaryCheck.outOfBounds) {
        return { canSlide: true, willDisappear: true };
      }

      if (!boundaryCheck.insideDiamond) {
        return { canSlide: true, willDisappear: true };
      }

      const hasCollision = this.puzzleManager.checkCollision(tile, nextCol, nextRow);
      if (hasCollision) {
        return { canSlide: nextCol !== tile.gridCol || nextRow !== tile.gridRow };
      }

      newCol = nextCol;
      newRow = nextRow;
    }
  }

  _checkBoundary(tile, col, row) {
    const gridSize = this.puzzleManager.gridSize;
    const nextRight = col + tile.gridColSpan - 1;
    const nextBottom = row + tile.gridRowSpan - 1;
    
    const outOfBounds = col < 1 || nextRight > gridSize || 
                        row < 1 || nextBottom > gridSize;
    
    const insideDiamond = this.puzzleManager.isPositionInDiamond(
      col, row, tile.gridColSpan, tile.gridRowSpan
    );
    
    return { outOfBounds, insideDiamond };
  }

  pause() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status === GameState.PLAYING) {
      this.stateManager.setState({
        status: GameState.PAUSED,
        isPaused: true
      });
      
      this.emit('pause', { elapsedTime: currentState.elapsedTime });
    }
  }

  resume() {
    const currentState = this.stateManager.getState();
    
    if (currentState.status === GameState.PAUSED) {
      this.stateManager.setState({
        status: GameState.PLAYING,
        isPaused: false
      });
      
      this.lastTimestamp = performance.now();
      
      this.emit('resume', { elapsedTime: currentState.elapsedTime });
    }
  }

  getState() {
    return this.stateManager.getState();
  }

  getElapsedTime() {
    return this.stateManager.getState().elapsedTime;
  }

  getCurrentLevel() {
    return this.puzzleManager.getCurrentLevel();
  }

  _render() {
    const currentState = this.stateManager.getState();
    const level = this.puzzleManager.getCurrentLevel();
    const tiles = this.puzzleManager.getTiles();
    
    const renderState = {
      tiles: tiles,
      level: level,
      elapsedTime: currentState.elapsedTime,
      moveCount: currentState.moveCount,
      status: currentState.status
    };
    
    this.renderer.render(renderState);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.renderer.destroy();
    
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
    
    this.stateManager.reset();
    this.eventSystem.clear();
    
    this.emit('destroy', {});
  }
}

module.exports = GameEngine;
module.exports.EventSystem = EventSystem;
module.exports.StateManager = StateManager;
