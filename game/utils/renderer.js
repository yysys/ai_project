const { 
  TILE_CONFIG, 
  GAME_CONFIG, 
  ANIMATION_CONFIG, 
  UnitType, 
  UnitState,
  Direction,
  DIRECTION_VECTORS 
} = require('./constants');

const logger = require('./logger');

class AnimationController {
  constructor() {
    this.animations = [];
    this.animationId = 0;
  }

  createAnimation(config) {
    const animation = {
      id: ++this.animationId,
      type: config.type,
      target: config.target,
      startValue: config.startValue,
      endValue: config.endValue,
      duration: config.duration,
      elapsed: 0,
      easing: config.easing || 'easeOutQuad',
      onComplete: config.onComplete,
      onUpdate: config.onUpdate
    };
    this.animations.push(animation);
    return animation.id;
  }

  update(deltaTime) {
    const completedAnimations = [];
    
    this.animations.forEach(animation => {
      animation.elapsed += deltaTime * 1000;
      const progress = Math.min(animation.elapsed / animation.duration, 1);
      const easedProgress = this.applyEasing(progress, animation.easing);
      
      const currentValue = animation.startValue + 
        (animation.endValue - animation.startValue) * easedProgress;
      
      if (animation.onUpdate) {
        animation.onUpdate(currentValue, easedProgress);
      }
      
      if (progress >= 1) {
        completedAnimations.push(animation);
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    });
    
    completedAnimations.forEach(animation => {
      const index = this.animations.indexOf(animation);
      if (index > -1) {
        this.animations.splice(index, 1);
      }
    });
  }

  applyEasing(t, easing) {
    switch (easing) {
      case 'easeOutQuad':
        return t * (2 - t);
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'easeOutElastic':
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
      case 'easeOutBounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }

  cancelAnimation(id) {
    const index = this.animations.findIndex(a => a.id === id);
    if (index > -1) {
      this.animations.splice(index, 1);
    }
  }

  clear() {
    this.animations = [];
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(config) {
    const count = config.count || 10;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: config.x,
        y: config.y,
        vx: (Math.random() - 0.5) * (config.speed || 100),
        vy: (Math.random() - 0.5) * (config.speed || 100),
        size: config.size || 5,
        color: config.color || '#FFD700',
        life: config.life || 1000,
        maxLife: config.life || 1000,
        gravity: config.gravity || 0
      });
    }
  }

  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime * 1000;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += p.gravity * deltaTime;
      return p.life > 0;
    });
  }

  render(ctx) {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  clear() {
    this.particles = [];
  }
}

class Renderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.screenWidth = 0;
    this.screenHeight = 0;
    
    this.gridSize = TILE_CONFIG.gridSize;
    this.rotation = TILE_CONFIG.rotation;
    
    this.tileSize = 0;
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.centerX = 0;
    this.centerY = 0;
    
    this.animationController = new AnimationController();
    this.particleSystem = new ParticleSystem();
    
    this.imageCache = new Map();
    this.imageLoadPromises = new Map();
    
    this.winAnimationActive = false;
    this.winAnimationProgress = 0;
    
    this.renderConfig = {
      backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
      gridColor: TILE_CONFIG.gridColor,
      dogColor: '#FFD700',
      wolfColor: '#64748b',
      dogEmoji: '🐕',
      wolfEmoji: '🐺',
      rotation: 45
    };
  }

  init(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    logger.log('Renderer initialized');
  }

  setScreenSize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
    this._calculateGridDimensions();
  }

  _calculateGridDimensions() {
    const sqrt2 = Math.sqrt(2);
    const maxGridWidth = this.screenWidth / sqrt2;
    const maxGridHeight = this.screenHeight / sqrt2;
    
    this.tileSize = Math.min(maxGridWidth, maxGridHeight) / this.gridSize;
    this.gridWidth = this.tileSize * this.gridSize;
    this.gridHeight = this.tileSize * this.gridSize;
    
    this.offsetX = (this.screenWidth - this.gridWidth) / 2;
    this.offsetY = (this.screenHeight - this.gridHeight) / 2;
    
    this.centerX = this.screenWidth / 2;
    this.centerY = this.screenHeight / 2;
  }

  render(renderState) {
    if (!this.ctx || !this.canvas) return;
    
    this.clear();
    this.drawBackground();
    
    this.ctx.save();
    this._applyRotation();
    this.drawGrid();
    
    if (renderState && renderState.tiles) {
      this.drawTiles(renderState.tiles);
    }
    
    this.ctx.restore();
    
    this.particleSystem.render(this.ctx);
    
    if (renderState) {
      this.drawUI(renderState);
    }
    
    if (this.winAnimationActive) {
      this._renderWinAnimation();
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _applyRotation() {
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotation * Math.PI / 180);
    this.ctx.translate(-this.centerX, -this.centerY);
  }

  drawBackground() {
    this.ctx.fillStyle = this.renderConfig.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this._drawDiamondBackground();
  }

  _drawDiamondBackground() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotation * Math.PI / 180);
    this.ctx.translate(-this.centerX, -this.centerY);
    
    const gradient = this.ctx.createLinearGradient(
      this.offsetX, this.offsetY,
      this.offsetX + this.gridWidth, this.offsetY + this.gridHeight
    );
    gradient.addColorStop(0, '#e8f5e9');
    gradient.addColorStop(0.5, '#c8e6c9');
    gradient.addColorStop(1, '#a5d6a7');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(this.offsetX, this.offsetY, this.gridWidth, this.gridHeight);
    
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.offsetX, this.offsetY, this.gridWidth, this.gridHeight);
    
    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.strokeStyle = this.renderConfig.gridColor;
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= this.gridSize; i++) {
      const x = this.offsetX + i * this.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.offsetY);
      this.ctx.lineTo(x, this.offsetY + this.gridHeight);
      this.ctx.stroke();
      
      const y = this.offsetY + i * this.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, y);
      this.ctx.lineTo(this.offsetX + this.gridWidth, y);
      this.ctx.stroke();
    }
    
    this._drawDiamondBoundary();
  }

  _drawDiamondBoundary() {
    const center = Math.ceil(this.gridSize / 2);
    
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 193, 7, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    
    for (let row = 1; row <= this.gridSize; row++) {
      const distanceFromCenter = Math.abs(row - center);
      const maxColInRow = this.gridSize - distanceFromCenter;
      const startCol = Math.ceil((this.gridSize - maxColInRow) / 2);
      
      const y = this.offsetY + (row - 1) * this.tileSize;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX + startCol * this.tileSize, y);
      this.ctx.lineTo(this.offsetX + (startCol + maxColInRow) * this.tileSize, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawTiles(tiles) {
    const sortedTiles = [...tiles].sort((a, b) => {
      if (a.unitType === UnitType.DOG) return 1;
      if (b.unitType === UnitType.DOG) return -1;
      return 0;
    });
    
    sortedTiles.forEach(tile => {
      if (tile.state === UnitState.DISAPPEARED) return;
      this.drawTile(tile);
    });
  }

  drawTile(tile, customX, customY, customWidth, customHeight) {
    let x, y, width, height;
    
    if (customX !== undefined && customY !== undefined) {
      x = customX;
      y = customY;
      width = customWidth || tile.gridColSpan * this.tileSize;
      height = customHeight || tile.gridRowSpan * this.tileSize;
    } else if (tile.animating && tile.state === UnitState.SLIDING) {
      x = tile.currentX - this.offsetX;
      y = tile.currentY - this.offsetY;
      width = tile.gridColSpan * this.tileSize;
      height = tile.gridRowSpan * this.tileSize;
    } else {
      x = this.offsetX + (tile.gridCol - 1) * this.tileSize;
      y = this.offsetY + (tile.gridRow - 1) * this.tileSize;
      width = tile.gridColSpan * this.tileSize;
      height = tile.gridRowSpan * this.tileSize;
    }
    
    this._drawTileBase(tile, x, y, width, height);
    this._drawTileContent(tile, x, y, width, height);
    this._drawTileDirection(tile, x, y, width, height);
  }

  _drawTileBase(tile, x, y, width, height) {
    this.ctx.save();
    
    const opacity = tile.opacity !== undefined ? tile.opacity : 1;
    this.ctx.globalAlpha = opacity;
    
    const isDog = tile.unitType === UnitType.DOG;
    
    if (isDog) {
      const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, '#FFD54F');
      gradient.addColorStop(0.5, '#FFEB3B');
      gradient.addColorStop(1, '#FFC107');
      this.ctx.fillStyle = gradient;
    } else {
      const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, '#ECEFF1');
      gradient.addColorStop(0.5, '#CFD8DC');
      gradient.addColorStop(1, '#B0BEC5');
      this.ctx.fillStyle = gradient;
    }
    
    const radius = Math.min(width, height) * 0.1;
    this._roundRect(x, y, width, height, radius);
    this.ctx.fill();
    
    this.ctx.strokeStyle = isDog ? '#FF8F00' : '#546E7A';
    this.ctx.lineWidth = 2;
    this._roundRect(x, y, width, height, radius);
    this.ctx.stroke();
    
    if (isDog) {
      this.ctx.shadowColor = 'rgba(255, 193, 7, 0.5)';
      this.ctx.shadowBlur = 10;
      this._roundRect(x, y, width, height, radius);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  _drawTileContent(tile, x, y, width, height) {
    this.ctx.save();
    
    const opacity = tile.opacity !== undefined ? tile.opacity : 1;
    this.ctx.globalAlpha = opacity;
    
    const isDog = tile.unitType === UnitType.DOG;
    const emoji = isDog ? this.renderConfig.dogEmoji : this.renderConfig.wolfEmoji;
    
    const fontSize = Math.min(width, height) * 0.5;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x + width / 2, y + height / 2);
    
    this.ctx.restore();
  }

  _drawTileDirection(tile, x, y, width, height) {
    this.ctx.save();
    
    const opacity = tile.opacity !== undefined ? tile.opacity : 1;
    this.ctx.globalAlpha = opacity * 0.8;
    
    const direction = tile.direction;
    const vector = DIRECTION_VECTORS[direction];
    
    if (!vector) {
      this.ctx.restore();
      return;
    }
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const arrowLength = Math.min(width, height) * 0.3;
    const arrowWidth = arrowLength * 0.4;
    
    const angle = vector.angle * Math.PI / 180;
    
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    
    this.ctx.beginPath();
    this.ctx.moveTo(arrowLength / 2, 0);
    this.ctx.lineTo(-arrowLength / 2, -arrowWidth);
    this.ctx.lineTo(-arrowLength / 3, 0);
    this.ctx.lineTo(-arrowLength / 2, arrowWidth);
    this.ctx.closePath();
    
    const isDog = tile.unitType === UnitType.DOG;
    this.ctx.fillStyle = isDog ? 'rgba(255, 152, 0, 0.6)' : 'rgba(84, 110, 122, 0.6)';
    this.ctx.fill();
    
    this.ctx.restore();
  }

  _roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  drawAnimatingTile(tile) {
    if (!tile.animating) return;
    this.drawTile(tile);
  }

  drawDisappearEffect(tile) {
    if (tile.state !== UnitState.FADING_OUT && tile.state !== UnitState.DISAPPEARED) return;
    
    const x = this.offsetX + (tile.gridCol - 1) * this.tileSize;
    const y = this.offsetY + (tile.gridRow - 1) * this.tileSize;
    const width = tile.gridColSpan * this.tileSize;
    const height = tile.gridRowSpan * this.tileSize;
    
    this.ctx.save();
    this.ctx.globalAlpha = tile.opacity || 1;
    
    const scale = 1 + (1 - (tile.opacity || 1)) * 0.3;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-centerX, -centerY);
    
    this.drawTile(tile, x, y, width, height);
    
    this.ctx.restore();
  }

  drawUI(renderState) {
    if (!renderState.level) return;
    
    this.ctx.save();
    
    this._drawUILevelInfo(renderState);
    this._drawUIMoveCount(renderState);
    this._drawUITimer(renderState);
    
    this.ctx.restore();
  }

  _drawUILevelInfo(renderState) {
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(renderState.level.name, 20, 30);
  }

  _drawUIMoveCount(renderState) {
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`步数: ${renderState.moveCount || 0}`, this.screenWidth / 2, 30);
  }

  _drawUITimer(renderState) {
    if (renderState.level.type === 'timed' && renderState.level.timeLimit) {
      const timeRemaining = Math.max(0, renderState.level.timeLimit - renderState.elapsedTime);
      
      this.ctx.fillStyle = timeRemaining < 10 ? '#ef4444' : '#1f2937';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`时间: ${timeRemaining.toFixed(1)}s`, this.screenWidth - 20, 30);
    }
  }

  updateAnimations(deltaTime) {
    this.animationController.update(deltaTime);
    this.particleSystem.update(deltaTime);
    
    if (this.winAnimationActive) {
      this.winAnimationProgress += deltaTime;
    }
  }

  startMoveAnimation(tile, startPos, endPos, duration, onComplete) {
    tile.animating = true;
    tile.state = UnitState.SLIDING;
    tile.animationProgress = 0;
    tile.startX = startPos.x;
    tile.startY = startPos.y;
    tile.currentX = startPos.x;
    tile.currentY = startPos.y;
    tile.targetX = endPos.x;
    tile.targetY = endPos.y;
    
    const animationId = this.animationController.createAnimation({
      type: 'move',
      target: tile,
      startValue: 0,
      endValue: 1,
      duration: duration || ANIMATION_CONFIG.MOVE_SPEED,
      easing: 'easeOutQuad',
      onUpdate: (progress) => {
        tile.animationProgress = progress;
        tile.currentX = tile.startX + (tile.targetX - tile.startX) * progress;
        tile.currentY = tile.startY + (tile.targetY - tile.startY) * progress;
      },
      onComplete: () => {
        tile.animating = false;
        tile.state = UnitState.IDLE;
        tile.currentX = tile.targetX;
        tile.currentY = tile.targetY;
        if (onComplete) onComplete();
      }
    });
    
    return animationId;
  }

  startDisappearAnimation(tile, duration, onComplete) {
    tile.state = UnitState.FADING_OUT;
    tile.animating = true;
    tile.animationProgress = 0;
    tile.opacity = 1;
    
    const centerX = this.offsetX + (tile.gridCol - 0.5) * this.tileSize;
    const centerY = this.offsetY + (tile.gridRow - 0.5) * this.tileSize;
    
    this.particleSystem.emit({
      x: centerX,
      y: centerY,
      count: 15,
      speed: 150,
      size: 6,
      color: tile.unitType === UnitType.DOG ? '#FFD700' : '#90A4AE',
      life: 600,
      gravity: 50
    });
    
    const animationId = this.animationController.createAnimation({
      type: 'fade',
      target: tile,
      startValue: 1,
      endValue: 0,
      duration: duration || ANIMATION_CONFIG.FADE_OUT_DURATION,
      easing: 'easeOutQuad',
      onUpdate: (value) => {
        tile.opacity = value;
        tile.animationProgress = 1 - value;
      },
      onComplete: () => {
        tile.opacity = 0;
        tile.state = UnitState.DISAPPEARED;
        tile.animating = false;
        if (onComplete) onComplete();
      }
    });
    
    return animationId;
  }

  startWinAnimation(onComplete) {
    this.winAnimationActive = true;
    this.winAnimationProgress = 0;
    
    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 2;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.particleSystem.emit({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
          count: 20,
          speed: 200,
          size: 8,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
          life: 1000,
          gravity: -30
        });
      }, i * 200);
    }
    
    setTimeout(() => {
      this.winAnimationActive = false;
      if (onComplete) onComplete();
    }, 1500);
  }

  _renderWinAnimation() {
    this.ctx.save();
    
    const progress = Math.min(this.winAnimationProgress, 1);
    const alpha = Math.sin(progress * Math.PI);
    
    this.ctx.globalAlpha = alpha * 0.3;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('恭喜过关!', this.screenWidth / 2, this.screenHeight / 2);
    
    this.ctx.restore();
  }

  async loadImage(url) {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url);
    }
    
    if (this.imageLoadPromises.has(url)) {
      return this.imageLoadPromises.get(url);
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        this.imageLoadPromises.delete(url);
        resolve(img);
      };
      img.onerror = (err) => {
        this.imageLoadPromises.delete(url);
        reject(err);
      };
      img.src = url;
    });
    
    this.imageLoadPromises.set(url, promise);
    return promise;
  }

  async preloadImages(urls) {
    const promises = urls.map(url => this.loadImage(url));
    await Promise.all(promises);
  }

  gridToScreen(col, row) {
    const localX = this.offsetX + (col - 1) * this.tileSize;
    const localY = this.offsetY + (row - 1) * this.tileSize;
    
    const dx = localX - this.centerX;
    const dy = localY - this.centerY;
    
    const angle = this.rotation * Math.PI / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
    
    return {
      x: rotatedX + this.centerX,
      y: rotatedY + this.centerY
    };
  }

  screenToGrid(screenX, screenY) {
    const dx = screenX - this.centerX;
    const dy = screenY - this.centerY;
    
    const angle = -this.rotation * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;
    
    const localX = rotatedX + this.centerX;
    const localY = rotatedY + this.centerY;
    
    const col = Math.floor((localX - this.offsetX) / this.tileSize) + 1;
    const row = Math.floor((localY - this.offsetY) / this.tileSize) + 1;
    
    return { col, row };
  }

  getTileScreenPosition(tile) {
    return this.gridToScreen(tile.gridCol, tile.gridRow);
  }

  clearCache() {
    this.imageCache.clear();
    this.imageLoadPromises.clear();
  }

  destroy() {
    this.animationController.clear();
    this.particleSystem.clear();
    this.clearCache();
    this.canvas = null;
    this.ctx = null;
  }
}

module.exports = Renderer;
module.exports.AnimationController = AnimationController;
module.exports.ParticleSystem = ParticleSystem;
