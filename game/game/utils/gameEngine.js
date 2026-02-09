const { GAME_CONFIG } = require('./constants');
const UnitManager = require('./unitManager');
const LevelManager = require('./levelManager');
const GameStateManager = require('./gameStateManager');

class GameEngine {
  constructor() {
    this.unitManager = new UnitManager();
    this.levelManager = new LevelManager();
    this.gameStateManager = new GameStateManager();
    
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
  }

  init(canvas, ctx, screenWidth, screenHeight) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.unitManager.setScreenSize(screenWidth, screenHeight);
    this.isInitialized = true;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.gameStateManager.addListener((newState, oldState) => {
      if (newState === GameState.WIN && this.onWin) {
        this.onWin();
      } else if (newState === GameState.LOSE && this.onLose) {
        this.onLose();
      }
    });
  }

  startLevel(levelId) {
    if (!this.isInitialized) {
      console.error('GameEngine not initialized');
      return false;
    }

    const success = this.levelManager.setCurrentLevel(levelId);
    if (!success) {
      console.error('Failed to set current level');
      return false;
    }

    this.unitManager.clear();
    this.unitManager.createVegetableDog();
    
    const level = this.levelManager.getCurrentLevel();
    this.unitManager.createWolves(level.wolfCount);
    
    this.gameStateManager.reset();
    this.gameStateManager.start();
    
    this.startGameLoop();
    
    return true;
  }

  startGameLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
  }

  gameLoop(timestamp) {
    if (this.gameStateManager.isGameOver()) {
      return;
    }

    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    if (this.gameStateManager.isPaused() || this.gameStateManager.isGameOver()) {
      return;
    }

    this.unitManager.update(this.deltaTime);
    
    const disappearedUnits = this.unitManager.checkBoundaries();
    
    if (this.unitManager.isDogDisappeared()) {
      this.handleWin();
    } else if (this.checkLoseCondition()) {
      this.handleLose();
    }

    if (this.onUpdate) {
      this.onUpdate(this.gameStateManager.getElapsedTime());
    }
  }

  checkLoseCondition() {
    const level = this.levelManager.getCurrentLevel();
    if (!level) return false;

    if (level.type === 'timed' && level.timeLimit) {
      const elapsedTime = this.gameStateManager.getElapsedTime();
      return elapsedTime >= level.timeLimit && !this.unitManager.isDogDisappeared();
    }

    return false;
  }

  handleWin() {
    const level = this.levelManager.getCurrentLevel();
    const timeUsed = this.gameStateManager.getElapsedTime();
    
    const stars = this.levelManager.calculateStars(level, timeUsed);
    const score = this.levelManager.calculateScore(level, timeUsed);
    
    this.levelManager.completeLevel(stars, score);
    this.gameStateManager.win();
  }

  handleLose() {
    this.gameStateManager.lose();
  }

  handleClick(x, y) {
    if (!this.gameStateManager.isRunning()) {
      return false;
    }

    const unit = this.unitManager.getUnitAtPosition(x, y);
    if (unit) {
      return this.unitManager.clickUnit(unit);
    }
    return false;
  }

  pause() {
    this.gameStateManager.pause();
  }

  resume() {
    this.gameStateManager.resume();
  }

  reset() {
    this.unitManager.reset();
    this.levelManager.resetLevel();
    this.gameStateManager.reset();
  }

  render() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBackground();
    this.drawUnits();
    this.drawUI();
  }

  drawBackground() {
    this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate(GAME_CONFIG.BOARD_ROTATION * Math.PI / 180);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    
    const gridSize = GAME_CONFIG.GRID_SIZE;
    const cellSize = GAME_CONFIG.CELL_SIZE;
    
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, gridSize * cellSize);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(gridSize * cellSize, pos);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawUnits() {
    const units = this.unitManager.getActiveUnits();
    
    units.forEach(unit => {
      this.drawUnit(unit);
    });
  }

  drawUnit(unit) {
    this.ctx.save();
    this.ctx.globalAlpha = unit.opacity;
    this.ctx.translate(unit.x, unit.y);
    this.ctx.scale(unit.scale, unit.scale);
    
    if (unit.type === 'vegetable_dog') {
      this.drawVegetableDog(unit);
    } else if (unit.type === 'wolf') {
      this.drawWolf(unit);
    }
    
    this.ctx.restore();
  }

  drawVegetableDog(unit) {
    const size = unit.size;
    
    this.ctx.fillStyle = '#52C41A';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    this.ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    this.ctx.shadowBlur = 20;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${size / 3}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐕', 0, 0);
  }

  drawWolf(unit) {
    const size = unit.size;
    
    this.ctx.fillStyle = '#64748b';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${size / 3}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐺', 0, 0);
  }

  drawUI() {
    const level = this.levelManager.getCurrentLevel();
    if (!level) return;
    
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${level.name}`, 20, 30);
    
    if (level.type === 'timed' && level.timeLimit) {
      const elapsedTime = this.gameStateManager.getElapsedTime();
      const timeRemaining = Math.max(0, level.timeLimit - elapsedTime);
      
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`时间: ${timeRemaining.toFixed(1)}s`, this.screenWidth - 20, 30);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
  }
}

module.exports = GameEngine;
