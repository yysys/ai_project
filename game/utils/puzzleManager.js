/**
 * 拼图游戏管理模块
 * 包含 Tile、PuzzleLevel、PuzzleManager 类
 * @module puzzleManager
 */

const { TileType, UnitType, UnitState, GameState, Direction, DIRECTION_VECTORS, generateId, getRandomHorizontalDirection, getRandomVerticalDirection } = require('./constants');

const logger = require('./logger');

class Tile {
  constructor(config) {
    this.id = config.id || generateId();
    this.type = config.type;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.RIGHT;
    this.state = UnitState.IDLE;
    this.imageUrl = config.imageUrl;
    
    this.animating = false;
    this.animationProgress = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetGridCol = 0;
    this.targetGridRow = 0;
    this.opacity = 1;
    this.shakeOffset = 0;
  }

  clone() {
    const cloned = new Tile({
      id: this.id,
      type: this.type,
      unitType: this.unitType,
      gridCol: this.gridCol,
      gridRow: this.gridRow,
      gridColSpan: this.gridColSpan,
      gridRowSpan: this.gridRowSpan,
      direction: this.direction,
      imageUrl: this.imageUrl
    });
    cloned.state = this.state;
    cloned.animating = this.animating;
    cloned.animationProgress = this.animationProgress;
    cloned.startX = this.startX;
    cloned.startY = this.startY;
    cloned.currentX = this.currentX;
    cloned.currentY = this.currentY;
    cloned.targetX = this.targetX;
    cloned.targetY = this.targetY;
    cloned.targetGridCol = this.targetGridCol;
    cloned.targetGridRow = this.targetGridRow;
    cloned.opacity = this.opacity;
    return cloned;
  }

  restoreFrom(saved) {
    this.gridCol = saved.gridCol;
    this.gridRow = saved.gridRow;
    this.state = saved.state;
    this.animating = saved.animating;
    this.animationProgress = saved.animationProgress;
    this.startX = saved.startX;
    this.startY = saved.startY;
    this.currentX = saved.currentX;
    this.currentY = saved.currentY;
    this.targetX = saved.targetX;
    this.targetY = saved.targetY;
    this.targetGridCol = saved.targetGridCol;
    this.targetGridRow = saved.targetGridRow;
    this.opacity = saved.opacity;
    this.shakeOffset = saved.shakeOffset || 0;
  }

  getStateSnapshot() {
    return {
      id: this.id,
      gridCol: this.gridCol,
      gridRow: this.gridRow,
      gridColSpan: this.gridColSpan,
      gridRowSpan: this.gridRowSpan,
      state: this.state,
      animating: this.animating,
      animationProgress: this.animationProgress,
      startX: this.startX,
      startY: this.startY,
      currentX: this.currentX,
      currentY: this.currentY,
      targetX: this.targetX,
      targetY: this.targetY,
      targetGridCol: this.targetGridCol,
      targetGridRow: this.targetGridRow,
      opacity: this.opacity,
      shakeOffset: this.shakeOffset
    };
  }
}

class PuzzleLevel {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || 'normal';
    this.timeLimit = config.timeLimit;
    this.tiles = [];
    this.dogTile = null;
    this.completed = false;
    this.stars = 0;
    this.score = 0;
    this.unlocked = config.unlocked || false;
    
    if (config.tiles) {
      config.tiles.forEach(tileConfig => {
        const tile = new Tile(tileConfig);
        this.tiles.push(tile);
        if (tile.unitType === UnitType.DOG) {
          this.dogTile = tile;
        }
      });
    }
  }

  getTileSnapshots() {
    return this.tiles.map(tile => tile.getStateSnapshot());
  }

  restoreFromSnapshots(snapshots) {
    snapshots.forEach(snapshot => {
      const tile = this.tiles.find(t => t.id === snapshot.id);
      if (tile) {
        tile.restoreFrom(snapshot);
      }
    });
  }
}

class PuzzleManager {
  constructor() {
    this.levels = [];
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.gridSize = 14;
    this.tileSize = 18;
    this.history = [];
    this.maxHistory = 50;
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.initialLevelStates = new Map();
    this.initLevels();
  }

  setScreenSize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  getTileScreenPosition(tile) {
    if (this.screenWidth === 0 || this.screenHeight === 0) {
      return null;
    }

    const tileSize = this.tileSize;
    const gridWidth = tileSize * this.gridSize;
    const gridHeight = tileSize * this.gridSize;
    const offsetX = (this.screenWidth - gridWidth) / 2;
    const offsetY = (this.screenHeight - gridHeight) / 2;

    const x = offsetX + (tile.currentX || (tile.gridCol - 1)) * tileSize;
    const y = offsetY + (tile.currentY || (tile.gridRow - 1)) * tileSize;

    return { x, y };
  }

  isValidPosition(col, row, colSpan, rowSpan) {
    return col >= 1 && row >= 1 && 
           col + colSpan - 1 <= this.gridSize && 
           row + rowSpan - 1 <= this.gridSize;
  }

  initLevels() {
    const level1Tiles = this.generateLevel1Tiles();

    const levels = [
      {
        id: 1,
        name: '第1关',
        type: 'normal',
        unlocked: true,
        tiles: level1Tiles
      },
      {
        id: 2,
        name: '第2关',
        type: 'normal',
        unlocked: false,
        tiles: this.generateLevel2Tiles()
      },
      {
        id: 3,
        name: '第3关',
        type: 'normal',
        unlocked: false,
        tiles: this.generateLevel3Tiles()
      }
    ];

    levels.forEach(config => {
      this.levels.push(new PuzzleLevel(config));
    });
  }

  generateLevel1Tiles() {
    const tiles = [];
    const gridSize = this.gridSize;
    const center = Math.ceil(gridSize / 2);

    const createTile = (col, row, colSpan, rowSpan, unitType, direction) => ({
      type: colSpan > 1 ? TileType.HORIZONTAL : TileType.VERTICAL,
      unitType: unitType,
      gridCol: col,
      gridRow: row,
      gridColSpan: colSpan,
      gridRowSpan: rowSpan,
      direction: direction
    });

    const usedPositions = new Set();
    const posKey = (c, r) => `${c},${r}`;

    let tileId = 0;

    for (let row = 1; row <= gridSize; row++) {
      for (let col = 1; col <= gridSize; col++) {
        if (usedPositions.has(posKey(col, row))) continue;

        const isHorizontal = tileId % 2 === 0;

        const canPlaceHorizontal = col + 1 <= gridSize && !usedPositions.has(posKey(col + 1, row));
        const canPlaceVertical = row + 1 <= gridSize && !usedPositions.has(posKey(col, row + 1));

        if (isHorizontal && canPlaceHorizontal) {
          tiles.push(createTile(col, row, 2, 1, UnitType.WOLF, getRandomHorizontalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (!isHorizontal && canPlaceVertical) {
          tiles.push(createTile(col, row, 1, 2, UnitType.WOLF, getRandomVerticalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        } else if (canPlaceHorizontal) {
          tiles.push(createTile(col, row, 2, 1, UnitType.WOLF, getRandomHorizontalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (canPlaceVertical) {
          tiles.push(createTile(col, row, 1, 2, UnitType.WOLF, getRandomVerticalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        }
      }
    }

    const centerTileIndex = tiles.findIndex(tile => 
      tile.gridCol <= center && 
      tile.gridCol + tile.gridColSpan - 1 >= center &&
      tile.gridRow <= center && 
      tile.gridRow + tile.gridRowSpan - 1 >= center
    );

    if (centerTileIndex !== -1) {
      tiles[centerTileIndex].unitType = UnitType.DOG;
    }

    return tiles;
  }

  generateLevel2Tiles() {
    const tiles = [];
    const gridSize = this.gridSize;
    const center = Math.ceil(gridSize / 2);

    const createTile = (col, row, colSpan, rowSpan, unitType, direction) => ({
      type: colSpan > 1 ? TileType.HORIZONTAL : (rowSpan > 1 ? TileType.VERTICAL : TileType.SINGLE),
      unitType: unitType,
      gridCol: col,
      gridRow: row,
      gridColSpan: colSpan,
      gridRowSpan: rowSpan,
      direction: direction
    });

    const usedPositions = new Set();
    const posKey = (c, r) => `${c},${r}`;

    let tileId = 0;

    for (let row = 1; row <= gridSize; row++) {
      for (let col = 1; col <= gridSize; col++) {
        if (usedPositions.has(posKey(col, row))) continue;

        const isHorizontal = tileId % 2 === 0;
        const isCenter = (col === center && row === center);

        if (isHorizontal && col + 1 <= gridSize && !usedPositions.has(posKey(col + 1, row))) {
          tiles.push(createTile(col, row, 2, 1, isCenter ? UnitType.DOG : UnitType.WOLF, getRandomHorizontalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (!isHorizontal && row + 1 <= gridSize && !usedPositions.has(posKey(col, row + 1))) {
          tiles.push(createTile(col, row, 1, 2, isCenter ? UnitType.DOG : UnitType.WOLF, getRandomVerticalDirection()));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        } else {
          tiles.push(createTile(col, row, 1, 1, isCenter ? UnitType.DOG : UnitType.WOLF, getRandomHorizontalDirection()));
          usedPositions.add(posKey(col, row));
          tileId++;
        }
      }
    }

    return tiles;
  }

  generateLevel3Tiles() {
    return this.generateLevel2Tiles();
  }

  getLevel(id) {
    return this.levels.find(level => level.id === id);
  }

  getLevels() {
    return this.levels;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  setCurrentLevel(id) {
    const level = this.getLevel(id);
    if (level && level.unlocked) {
      this.currentLevel = level;
      this.currentLevelIndex = this.levels.findIndex(l => l.id === id);
      this.history = [];
      
      if (!this.initialLevelStates.has(id)) {
        this.initialLevelStates.set(id, this.currentLevel.getTileSnapshots());
      }
      
      this.saveState();
      return true;
    }
    return false;
  }

  getTiles() {
    return this.currentLevel ? this.currentLevel.tiles.filter(t => t.state !== UnitState.DISAPPEARED) : [];
  }

  getDogTile() {
    return this.currentLevel ? this.currentLevel.dogTile : null;
  }

  slideTile(tile) {
    if (tile.state !== UnitState.IDLE) {
      logger.log('[移动] 格子不是IDLE状态:', tile.id, '状态:', tile.state);
      return { moved: false, disappeared: false, reason: 'tile_not_idle' };
    }

    const direction = tile.direction;
    const vector = DIRECTION_VECTORS[direction];
    
    if (!vector) {
      logger.log('[移动] 无效的方向:', direction);
      return { moved: false, disappeared: false, reason: 'invalid_direction' };
    }

    const targetPosition = this.calculateTargetPosition(tile, vector);
    
    logger.log('[移动] 格子:', tile.id, 
               '方向:', direction,
               '起点:(', tile.gridCol, ',', tile.gridRow, ')',
               '终点:(', targetPosition.gridCol, ',', targetPosition.gridRow, ')',
               '可移动:', targetPosition.canMove,
               '将消失:', targetPosition.willDisappear);
    
    if (!targetPosition.canMove) {
      if (targetPosition.reason === 'blocked_by_collision') {
        const { ANIMATION_CONFIG } = require('./constants');
        tile.shakeOffset = ANIMATION_CONFIG.shakeAmplitude;
        tile.shakeEndTime = Date.now() + ANIMATION_CONFIG.shakeDuration;
        tile.flashCount = ANIMATION_CONFIG.flashCount;
        tile.flashColor = ANIMATION_CONFIG.flashColor;
      }
      return { moved: false, disappeared: false, reason: targetPosition.reason || 'cannot_move' };
    }

    const startPos = this.getTileScreenPosition(tile);
    
    const { ANIMATION_CONFIG } = require('./constants');
    const distance = targetPosition.distance;
    const slideDuration = Math.min(
      ANIMATION_CONFIG.maxSlideDuration,
      ANIMATION_CONFIG.minSlideDuration + distance * ANIMATION_CONFIG.durationPerTile
    );
    
    tile.state = UnitState.SLIDING;
    tile.animating = true;
    tile.animationProgress = 0;
    tile.slideDuration = slideDuration;
    tile.startX = startPos ? startPos.x : 0;
    tile.startY = startPos ? startPos.y : 0;
    tile.currentX = tile.gridCol - 1;
    tile.currentY = tile.gridRow - 1;
    tile.targetGridCol = targetPosition.gridCol;
    tile.targetGridRow = targetPosition.gridRow;
    
    logger.log('[动画] 格子:', tile.id, '距离:', distance, '动画时间:', slideDuration, 'ms');
    
    const tempTile = { ...tile, gridCol: targetPosition.gridCol, gridRow: targetPosition.gridRow };
    const endPos = this.getTileScreenPosition(tempTile);
    tile.targetX = endPos ? endPos.x : 0;
    tile.targetY = endPos ? endPos.y : 0;

    if (targetPosition.collided) {
      const { ANIMATION_CONFIG } = require('./constants');
      tile.shakeOffset = ANIMATION_CONFIG.shakeAmplitude;
      tile.shakeEndTime = Date.now() + ANIMATION_CONFIG.shakeDuration;
      tile.flashCount = ANIMATION_CONFIG.flashCount;
      tile.flashColor = ANIMATION_CONFIG.flashColor;
      logger.log('[碰撞] 格子:', tile.id, '碰到格子:', targetPosition.collisionTileId, '位置:(', targetPosition.gridCol, ',', targetPosition.gridRow, ')');
    }

    return { 
      moved: true, 
      disappeared: targetPosition.willDisappear, 
      tile,
      distance: targetPosition.distance,
      collided: targetPosition.collided
    };
  }

  calculateTargetPosition(tile, vector) {
    let currentCol = tile.gridCol;
    let currentRow = tile.gridRow;
    let distance = 0;
    const originalCol = tile.gridCol;
    const originalRow = tile.gridRow;
    let lastValidCol = currentCol;
    let lastValidRow = currentRow;
    const EXTRA_MOVE_DISTANCE = 10;
    
    while (true) {
      const nextCol = currentCol + vector.col;
      const nextRow = currentRow + vector.row;
      
      const collision = this.checkCollisionWithDetail(tile, nextCol, nextRow);
      if (collision.hasCollision) {
        if (distance === 0) {
          return {
            gridCol: originalCol,
            gridRow: originalRow,
            willDisappear: false,
            distance: 0,
            canMove: false,
            reason: 'blocked_by_collision',
            collided: false
          };
        }
        return {
          gridCol: lastValidCol,
          gridRow: lastValidRow,
          willDisappear: false,
          distance,
          canMove: true,
          collided: true,
          collisionTileId: collision.tileId
        };
      }
      
      const isValid = this.isValidPosition(nextCol, nextRow, tile.gridColSpan, tile.gridRowSpan);
      if (!isValid) {
        distance++;
        if (distance >= EXTRA_MOVE_DISTANCE) {
          return {
            gridCol: nextCol,
            gridRow: nextRow,
            willDisappear: true,
            distance: distance,
            canMove: true,
            collided: false
          };
        }
      }
      
      lastValidCol = nextCol;
      lastValidRow = nextRow;
      currentCol = nextCol;
      currentRow = nextRow;
      distance++;
    }
  }

  checkCollisionWithDetail(tile, col, row) {
    const tiles = this.currentLevel.tiles.filter(t => 
      t.id !== tile.id && t.state !== UnitState.DISAPPEARED
    );

    const tileLeft = col;
    const tileRight = col + tile.gridColSpan - 1;
    const tileTop = row;
    const tileBottom = row + tile.gridRowSpan - 1;

    for (const other of tiles) {
      const otherLeft = other.gridCol;
      const otherRight = other.gridCol + other.gridColSpan - 1;
      const otherTop = other.gridRow;
      const otherBottom = other.gridRow + other.gridRowSpan - 1;

      if (tileLeft <= otherRight && tileRight >= otherLeft &&
          tileTop <= otherBottom && tileBottom >= otherTop) {
        return { hasCollision: true, tileId: other.id };
      }
    }

    return { hasCollision: false, tileId: null };
  }

  updateTileAnimation(tile, deltaTime) {
    if (!tile.animating) return;

    const { ANIMATION_CONFIG } = require('./constants');
    const slideDuration = tile.slideDuration || ANIMATION_CONFIG.minSlideDuration;
    const fadeOutDuration = ANIMATION_CONFIG.FADE_OUT_DURATION;

    if (tile.state === UnitState.SLIDING) {
      const totalDistance = Math.sqrt(
        Math.pow(tile.targetX - tile.startX, 2) + 
        Math.pow(tile.targetY - tile.startY, 2)
      );
      
      if (totalDistance === 0) {
        tile.currentX = tile.targetGridCol - 1;
        tile.currentY = tile.targetGridRow - 1;
        tile.animationProgress = 1;
        
        if (tile.targetGridCol > 0 && tile.targetGridRow > 0) {
          tile.gridCol = tile.targetGridCol;
          tile.gridRow = tile.targetGridRow;
        }
        
        const isOutside = !this.isValidPosition(tile.gridCol, tile.gridRow, tile.gridColSpan, tile.gridRowSpan);
        if (isOutside) {
          tile.state = UnitState.FADING_OUT;
          tile.animationProgress = 0;
          logger.log('[消失] 格子:', tile.id, '移出边界，位置:(', tile.gridCol, ',', tile.gridRow, ')');
        } else {
          tile.animating = false;
          tile.state = UnitState.IDLE;
        }
        return;
      }
      
      const progressStep = deltaTime * 1000 / slideDuration;
      tile.animationProgress += progressStep;
      
      if (tile.animationProgress >= 1) {
        logger.log('[动画完成] 格子:', tile.id, '总进度:', tile.animationProgress);
        tile.animationProgress = 1;
        tile.currentX = tile.targetGridCol - 1;
        tile.currentY = tile.targetGridRow - 1;
        
        tile.gridCol = tile.targetGridCol;
        tile.gridRow = tile.targetGridRow;
        
        const isOutside = !this.isValidPosition(tile.gridCol, tile.gridRow, tile.gridColSpan, tile.gridRowSpan);
        if (isOutside) {
          tile.state = UnitState.FADING_OUT;
          tile.animationProgress = 0;
          logger.log('[消失] 格子:', tile.id, '移出边界，位置:(', tile.gridCol, ',', tile.gridRow, ')');
        } else {
          tile.animating = false;
          tile.state = UnitState.IDLE;
        }
      } else {
        const clampedProgress = Math.min(tile.animationProgress, 1);
        const easedProgress = this.easeInOutCubic(clampedProgress);
        tile.currentX = (tile.gridCol - 1) + (tile.targetGridCol - tile.gridCol) * easedProgress;
        tile.currentY = (tile.gridRow - 1) + (tile.targetGridRow - tile.gridRow) * easedProgress;
      }
    } else if (tile.state === UnitState.FADING_OUT) {
      tile.animationProgress += deltaTime * 1000 / fadeOutDuration;
      
      if (tile.animationProgress >= 1) {
        tile.animationProgress = 1;
        tile.opacity = 0;
        tile.state = UnitState.DISAPPEARED;
        tile.animating = false;
        logger.log('[消失完成] 格子:', tile.id, tile.unitType === UnitType.DOG ? '- 菜狗胜利!' : '');
      } else {
        tile.opacity = 1 - tile.animationProgress;
      }
    }
    
    if (tile.shakeOffset > 0) {
      tile.shakeOffset = Math.max(0, tile.shakeOffset - deltaTime * 50);
    }
  }

  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  checkCollision(tile, col, row) {
    return this.checkCollisionWithDetail(tile, col, row).hasCollision;
  }

  saveState() {
    if (!this.currentLevel) return;

    const state = {
      tiles: this.currentLevel.tiles.map(tile => tile.getStateSnapshot())
    };

    this.history.push(state);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  undo() {
    if (this.history.length <= 1) return false;

    this.history.pop();
    const previousState = this.history[this.history.length - 1];

    if (previousState && previousState.tiles) {
      previousState.tiles.forEach(savedTile => {
        const tile = this.currentLevel.tiles.find(t => t.id === savedTile.id);
        if (tile) {
          tile.restoreFrom(savedTile);
        }
      });
    }

    return true;
  }

  checkWinCondition() {
    const dogTile = this.getDogTile();
    if (!dogTile) return false;

    return dogTile.state === UnitState.DISAPPEARED;
  }

  completeLevel(stars, score) {
    if (this.currentLevel) {
      this.currentLevel.completed = true;
      this.currentLevel.stars = stars;
      this.currentLevel.score = score;
      return this.unlockNextLevel();
    }
    return null;
  }

  unlockNextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < this.levels.length) {
      this.levels[nextIndex].unlocked = true;
      return this.levels[nextIndex];
    }
    return null;
  }

  resetLevel() {
    if (!this.currentLevel) return;

    const levelId = this.currentLevel.id;
    const initialSnapshots = this.initialLevelStates.get(levelId);
    
    if (initialSnapshots) {
      initialSnapshots.forEach(snapshot => {
        const tile = this.currentLevel.tiles.find(t => t.id === snapshot.id);
        if (tile) {
          tile.restoreFrom(snapshot);
        }
      });
    } else {
      const originalLevel = this.getLevel(levelId);
      if (originalLevel) {
        this.currentLevel.tiles.forEach((tile, index) => {
          if (originalLevel.tiles[index]) {
            tile.gridCol = originalLevel.tiles[index].gridCol;
            tile.gridRow = originalLevel.tiles[index].gridRow;
            tile.state = UnitState.IDLE;
            tile.animating = false;
            tile.animationProgress = 0;
            tile.opacity = 1;
          }
        });
      }
    }

    this.history = [];
    this.saveState();
  }

  calculateStars(level, timeUsed) {
    let stars = 1;

    if (level.type === 'timed' && level.timeLimit) {
      const timeRatio = timeUsed / level.timeLimit;
      if (timeRatio < 0.5) stars = 3;
      else if (timeRatio < 0.75) stars = 2;
    } else {
      stars = 2;
    }

    return stars;
  }

  calculateScore(level, timeUsed) {
    let score = 0;

    score += 500;

    if (level.type === 'timed' && level.timeLimit) {
      const timeRemaining = level.timeLimit - timeUsed;
      score += Math.floor(timeRemaining * 5);
    }

    return score;
  }
}

module.exports = PuzzleManager;
module.exports.PuzzleLevel = PuzzleLevel;
module.exports.Tile = Tile;
