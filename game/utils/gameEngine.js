const { GameState, TILE_CONFIG, GAME_CONFIG } = require('./constants');
const PuzzleManager = require('./puzzleManager');

class GameEngine {
  constructor() {
    this.puzzleManager = new PuzzleManager();
    
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
    
    this.gameState = GameState.IDLE;
    this.elapsedTime = 0;
    
    this.onWin = null;
    this.onLose = null;
    this.onUpdate = null;
  }

  init(canvas, ctx, screenWidth, screenHeight) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.puzzleManager.setScreenSize(screenWidth, screenHeight);
    
    this.isInitialized = true;
  }

  startLevel(levelId) {
    if (!this.isInitialized) {
      console.error('GameEngine not initialized');
      return false;
    }

    const success = this.puzzleManager.setCurrentLevel(levelId);
    if (!success) {
      console.error('Failed to set current level');
      return false;
    }

    this.gameState = GameState.PLAYING;
    this.elapsedTime = 0;
    
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
    if (this.gameState === GameState.WIN || this.gameState === GameState.LOSE) {
      return;
    }

    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    this.elapsedTime += this.deltaTime;

    const tiles = this.puzzleManager.getTiles();
    for (const tile of tiles) {
      this.puzzleManager.updateTileAnimation(tile, this.deltaTime);
    }

    if (this.puzzleManager.checkWinCondition()) {
      this.handleWin();
    }

    if (this.onUpdate) {
      this.onUpdate(this.elapsedTime);
    }
  }

  handleWin() {
    const level = this.puzzleManager.getCurrentLevel();
    const timeUsed = this.elapsedTime;
    
    const stars = this.puzzleManager.calculateStars(level, timeUsed);
    const score = this.puzzleManager.calculateScore(level, timeUsed);
    
    this.puzzleManager.completeLevel(stars, score);
    this.gameState = GameState.WIN;
    
    if (this.onWin) {
      this.onWin();
    }
  }

  handleLose() {
    this.gameState = GameState.LOSE;
    
    if (this.onLose) {
      this.onLose();
    }
  }

  handleClick(x, y) {
    if (this.gameState !== GameState.PLAYING) {
      return false;
    }

    const tile = this.getTileAtPosition(x, y);
    
    if (tile) {
      const result = this.puzzleManager.slideTile(tile);
      return result.moved;
    }

    return false;
  }

  getTileAtPosition(screenX, screenY) {
    const tiles = this.puzzleManager.getTiles();
    
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
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    const localX = rotatedX + centerX;
    const localY = rotatedY + centerY;

    for (const tile of tiles) {
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
    if (this.gameState !== GameState.PLAYING) {
      return false;
    }

    return this.puzzleManager.undo();
  }

  reset() {
    if (this.gameState !== GameState.PLAYING) {
      return false;
    }

    this.puzzleManager.resetLevel();
    this.elapsedTime = 0;
    
    return true;
  }

  getHint() {
    if (this.gameState !== GameState.PLAYING) {
      return null;
    }

    const tiles = this.puzzleManager.getTiles();
    const dogTile = this.puzzleManager.getDogTile();
    
    if (!dogTile) return null;

    for (const tile of tiles) {
      const result = this.canSlideTile(tile);
      if (result.canSlide) {
        return {
          tile: tile,
          direction: tile.direction
        };
      }
    }

    return null;
  }

  canSlideTile(tile) {
    const direction = tile.direction;
    const vector = this.puzzleManager.DIRECTION_VECTORS?.[direction];
    
    if (!vector) {
      return { canSlide: false, reason: 'invalid_direction' };
    }

    let newCol = tile.gridCol;
    let newRow = tile.gridRow;

    while (true) {
      const nextCol = newCol + vector.col;
      const nextRow = newRow + vector.row;

      if (nextCol < 1 || nextCol > this.puzzleManager.gridSize || 
          nextRow < 1 || nextRow > this.puzzleManager.gridSize) {
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

  pause() {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    }
  }

  resume() {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();
    this.drawTiles();
    this.drawUI();
  }

  drawBackground() {
    this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const tileSize = Math.min(this.screenWidth, this.screenHeight) / TILE_CONFIG.gridSize;
    const offsetX = (this.screenWidth - tileSize * TILE_CONFIG.gridSize) / 2;
    const offsetY = (this.screenHeight - tileSize * TILE_CONFIG.gridSize) / 2;

    this.ctx.strokeStyle = TILE_CONFIG.gridColor;
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i <= TILE_CONFIG.gridSize; i++) {
      const x = offsetX + i * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, offsetY);
      this.ctx.lineTo(x, offsetY + tileSize * TILE_CONFIG.gridSize);
      this.ctx.stroke();

      const y = offsetY + i * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, y);
      this.ctx.lineTo(offsetX + tileSize * TILE_CONFIG.gridSize, y);
      this.ctx.stroke();
    }
  }

  drawTiles() {
    const tiles = this.puzzleManager.getTiles();
    
    const sqrt2 = Math.sqrt(2);
    const maxGridWidth = this.screenWidth / sqrt2;
    const maxGridHeight = this.screenHeight / sqrt2;
    
    const tileSize = Math.min(maxGridWidth, maxGridHeight) / TILE_CONFIG.gridSize;
    const gridWidth = tileSize * TILE_CONFIG.gridSize;
    const gridHeight = tileSize * TILE_CONFIG.gridSize;
    
    const offsetX = (this.screenWidth - gridWidth) / 2;
    const offsetY = (this.screenHeight - gridHeight) / 2;

    this.ctx.save();

    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;

    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(45 * Math.PI / 180);
    this.ctx.translate(-centerX, -centerY);

    console.log('Drawing tiles:', tiles.length);
    tiles.forEach((tile, index) => {
      const x = offsetX + (tile.gridCol - 1) * tileSize;
      const y = offsetY + (tile.gridRow - 1) * tileSize;
      const width = tile.gridColSpan * tileSize;
      const height = tile.gridRowSpan * tileSize;

      if (index < 5) {
        console.log(`Tile ${index}:`, tile, `size: ${width.toFixed(1)}x${height.toFixed(1)}`);
      }

      this.drawTile(tile, x, y, width, height);
    });

    this.ctx.restore();
  }

  drawTile(tile, x, y, width, height) {
    this.ctx.save();

    const isDog = tile.unitType === 'dog';
    const direction = tile.direction;

    let drawX = x;
    let drawY = y;

    if (tile.animating) {
      drawX = tile.currentX;
      drawY = tile.currentY;
    }

    this.ctx.fillStyle = isDog ? '#FFEB3B' : '#F5E6D3';
    this.ctx.fillRect(drawX, drawY, width, height);

    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(drawX, drawY, width, height);

    const directionAngle = this.getDirectionAngle(direction);

    this.ctx.save();
    this.ctx.translate(drawX + width / 2, drawY + height / 2);
    this.ctx.rotate(directionAngle * Math.PI / 180);

    this.ctx.fillStyle = '#333333';
    this.ctx.font = `${Math.min(width, height) * 0.5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(isDog ? '🐕' : '🐺', 0, 0);

    this.ctx.restore();
    this.ctx.restore();
  }

  getDirectionAngle(direction) {
    const angles = {
      'up_left': 225,
      'up_right': 315,
      'down_left': 135,
      'down_right': 45
    };
    return angles[direction] || 0;
  }

  drawUI() {
    const level = this.puzzleManager.getCurrentLevel();
    if (!level) return;

    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${level.name}`, 20, 30);

    if (level.type === 'timed' && level.timeLimit) {
      const timeRemaining = Math.max(0, level.timeLimit - this.elapsedTime);
      
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
    this.gameState = GameState.IDLE;
  }
}

module.exports = GameEngine;
