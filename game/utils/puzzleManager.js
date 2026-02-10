const { TileType, UnitType, UnitState, GameState, Direction, DIRECTION_VECTORS, generateId } = require('./constants');

const logger = require('./logger');
let fileLogger = null;
try {
  fileLogger = require('./fileLogger');
  console.log('fileLogger 加载成功');
} catch (e) {
  console.error('fileLogger 加载失败，将只使用控制台日志:', e);
}

class Tile {
  constructor(config) {
    this.id = generateId();
    this.type = config.type;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.UP_RIGHT;
    this.state = UnitState.IDLE;
    this.imageUrl = config.imageUrl;
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

    const localX = offsetX + (tile.gridCol - 1) * tileSize;
    const localY = offsetY + (tile.gridRow - 1) * tileSize;

    const dx = localX - centerX;
    const dy = localY - centerY;

    const angle = 45 * Math.PI / 180;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY
    };
  }

  initLevels() {
    const level1Tiles = this.generateLevel1Tiles();
    console.log('Level 1 tiles generated:', level1Tiles.length);
    console.log('Level 1 dog tiles:', level1Tiles.filter(t => t.unitType === 'dog').length);

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
    const gridSize = 14;
    const center = Math.ceil(gridSize / 2);

    const directions = [Direction.UP_RIGHT, Direction.UP_LEFT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];

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
      const distanceFromCenter = Math.abs(row - center);
      const maxColInRow = gridSize - distanceFromCenter;
      const startCol = Math.ceil((gridSize - maxColInRow) / 2);

      for (let col = startCol; col < startCol + maxColInRow; col++) {
        if (usedPositions.has(posKey(col, row))) continue;

        const direction = directions[tileId % 4];
        const isHorizontal = tileId % 2 === 0;

        const canPlaceHorizontal = col + 1 <= gridSize && !usedPositions.has(posKey(col + 1, row)) && (col + 1 - startCol) < maxColInRow;
        const canPlaceVertical = row + 1 <= gridSize && !usedPositions.has(posKey(col, row + 1));

        if (isHorizontal && canPlaceHorizontal) {
          tiles.push(createTile(col, row, 2, 1, UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (!isHorizontal && canPlaceVertical) {
          tiles.push(createTile(col, row, 1, 2, UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        } else if (canPlaceHorizontal) {
          tiles.push(createTile(col, row, 2, 1, UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else {
          tiles.push(createTile(col, row, 1, 2, UnitType.WOLF, direction));
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
      console.log('Center tile found and set to DOG:', tiles[centerTileIndex]);
    } else {
      console.error('No tile found covering center position', center, center);
    }

    console.log('Total tiles generated:', tiles.length);
    console.log('Dog tiles count:', tiles.filter(t => t.unitType === 'dog').length);

    return tiles;
  }

  generateLevel2Tiles() {
    const tiles = [];
    const gridSize = 14;
    const center = Math.ceil(gridSize / 2);

    const directions = [Direction.UP_RIGHT, Direction.UP_LEFT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];

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
      const distanceFromCenter = Math.abs(row - center);
      const maxColInRow = gridSize - distanceFromCenter;
      const startCol = Math.ceil((gridSize - maxColInRow) / 2);

      for (let i = 0; i < maxColInRow; i++) {
        const col = startCol + i;

        if (usedPositions.has(posKey(col, row))) continue;

        const direction = directions[tileId % 4];
        const isHorizontal = tileId % 2 === 0;
        const isCenter = (col === center && row === center);

        if (isHorizontal && col + 1 <= gridSize && !usedPositions.has(posKey(col + 1, row))) {
          tiles.push(createTile(col, row, 2, 1, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (!isHorizontal && row + 1 <= gridSize && !usedPositions.has(posKey(col, row + 1))) {
          tiles.push(createTile(col, row, 1, 2, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        } else {
          tiles.push(createTile(col, row, 1, 1, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          tileId++;
        }
      }
    }

    return tiles;
  }

  generateLevel3Tiles() {
    const tiles = [];
    const gridSize = 14;
    const center = Math.ceil(gridSize / 2);

    const directions = [Direction.UP_RIGHT, Direction.UP_LEFT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];

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
      const distanceFromCenter = Math.abs(row - center);
      const maxColInRow = gridSize - distanceFromCenter;
      const startCol = Math.ceil((gridSize - maxColInRow) / 2);

      for (let i = 0; i < maxColInRow; i++) {
        const col = startCol + i;

        if (usedPositions.has(posKey(col, row))) continue;

        const direction = directions[tileId % 4];
        const isHorizontal = tileId % 2 === 0;
        const isCenter = (col === center && row === center);

        if (isHorizontal && col + 1 <= gridSize && !usedPositions.has(posKey(col + 1, row))) {
          tiles.push(createTile(col, row, 2, 1, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col + 1, row));
          tileId++;
        } else if (!isHorizontal && row + 1 <= gridSize && !usedPositions.has(posKey(col, row + 1))) {
          tiles.push(createTile(col, row, 1, 2, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          usedPositions.add(posKey(col, row + 1));
          tileId++;
        } else {
          tiles.push(createTile(col, row, 1, 1, isCenter ? UnitType.DOG : UnitType.WOLF, direction));
          usedPositions.add(posKey(col, row));
          tileId++;
        }
      }
    }

    return tiles;
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
    if (!this.slideTileLogShown) {
      logger.log('=== slideTile 方法被调用 ===');
      if (fileLogger) fileLogger.log('=== slideTile 方法被调用 ===');
      this.slideTileLogShown = true;
    }
    
    if (fileLogger) {
      fileLogger.log('=== slideTile 开始 ===');
      fileLogger.log('格子 ID:', tile.id);
      fileLogger.log('格子类型:', tile.unitType);
      fileLogger.log('格子状态:', tile.state);
    }
    
    if (tile.state !== UnitState.IDLE) {
      logger.log('格子不是 IDLE 状态:', tile.state);
      if (fileLogger) fileLogger.log('格子不是 IDLE 状态:', tile.state);
      return { moved: false, reason: 'tile_not_idle' };
    }

    const direction = tile.direction;
    const vector = DIRECTION_VECTORS[direction];
    
    if (fileLogger) {
      fileLogger.log('格子方向:', direction);
      fileLogger.log('方向向量:', JSON.stringify(vector));
    }
    
    if (!vector) {
      logger.log('无效的方向:', direction);
      if (fileLogger) fileLogger.log('无效的方向:', direction);
      return { moved: false, reason: 'invalid_direction' };
    }

    logger.log('=== slideTile 开始 ===');
    logger.log('格子 ID:', tile.id);
    logger.log('格子类型:', tile.unitType);
    logger.log('格子方向:', direction);
    logger.log('方向向量:', vector);
    logger.log('初始位置:', tile.gridCol, tile.gridRow);
    logger.log('格子大小:', tile.gridColSpan, 'x', tile.gridRowSpan);
    logger.log('格子占据区域: [', tile.gridCol, ',', tile.gridRow, '] 到 [', tile.gridCol + tile.gridColSpan - 1, ',', tile.gridRow + tile.gridRowSpan - 1, ']');
    
    if (fileLogger) {
      fileLogger.log('初始位置:', tile.gridCol, tile.gridRow);
      fileLogger.log('格子大小:', tile.gridColSpan, 'x', tile.gridRowSpan);
      fileLogger.log('格子占据区域: [', tile.gridCol, ',', tile.gridRow, '] 到 [', tile.gridCol + tile.gridColSpan - 1, ',', tile.gridRow + tile.gridRowSpan - 1, ']');
    }

    let newCol = tile.gridCol;
    let newRow = tile.gridRow;
    let moved = false;
    let disappeared = false;

    let stepCount = 0;
    while (true) {
      const nextCol = newCol + vector.col;
      const nextRow = newRow + vector.row;
      stepCount++;

      const stepLog = `步骤 ${stepCount}: 当前位置 (${newCol}, ${newRow}) -> 尝试移动到 (${nextCol}, ${nextRow})`;
      console.log(stepLog);
      if (fileLogger) fileLogger.log(stepLog);
      
      const spanLog = `格子 span: ${tile.gridColSpan}x${tile.gridRowSpan}, 方向: ${direction}`;
      console.log(spanLog);
      if (fileLogger) fileLogger.log(spanLog);

      const nextRight = nextCol + tile.gridColSpan - 1;
      const nextBottom = nextRow + tile.gridRowSpan - 1;
      
      const areaLog = `格子将占据区域: [${nextCol}, ${nextRow}] 到 [${nextRight}, ${nextBottom}]`;
      console.log(areaLog);
      if (fileLogger) fileLogger.log(areaLog);

      newCol = nextCol;
      newRow = nextRow;

      const hasCollision = this.checkCollision(tile, newCol, newRow);
      if (hasCollision) {
        const collisionLog = `碰到障碍！停止在当前位置 (${tile.gridCol}, ${tile.gridRow})`;
        console.log(collisionLog);
        if (fileLogger) fileLogger.log(collisionLog);
        newCol = tile.gridCol;
        newRow = tile.gridRow;
        moved = true;
        break;
      }

      if (newCol < 1 || nextRight > this.gridSize || 
          newRow < 1 || nextBottom > this.gridSize) {
        const boundaryLog = `⚠️ 超出边界！gridSize=${this.gridSize}, 区域=[${newCol},${newRow}]-[${nextRight},${nextBottom}]`;
        console.log(boundaryLog);
        if (fileLogger) fileLogger.log(boundaryLog);
        const disappearLog = `超出边界！格子将消失，最终位置: (${newCol}, ${newRow})`;
        console.log(disappearLog);
        if (fileLogger) fileLogger.log(disappearLog);
        disappeared = true;
        moved = true;
        break;
      }
    }

    if (moved) {
      tile.gridCol = newCol;
      tile.gridRow = newRow;
      
      if (disappeared) {
        tile.state = UnitState.DISAPPEARED;
        const disappearMsg = '格子消失！最终位置: (' + newCol + ', ' + newRow + ')';
        console.log(disappearMsg);
        if (fileLogger) fileLogger.log(disappearMsg);
      } else {
        tile.state = UnitState.IDLE;
        const stopMsg = '格子停止！最终位置: (' + newCol + ', ' + newRow + ')';
        console.log(stopMsg);
        if (fileLogger) fileLogger.log(stopMsg);
      }
    } else {
      const noMoveMsg = '格子没有移动！';
      console.log(noMoveMsg);
      if (fileLogger) fileLogger.log(noMoveMsg);
    }

    const endMsg = '=== slideTile 结束 === 返回: moved=' + moved + ', disappeared=' + disappeared;
    console.log('=== slideTile 结束 ===');
    if (fileLogger) fileLogger.log(endMsg);

    return { moved, disappeared, tile };
  }

  updateTileAnimation(tile, deltaTime) {
    if (!tile.animating) return;

    tile.animationProgress += deltaTime * 3;

    if (tile.animationProgress >= 1) {
      tile.animationProgress = 1;
      tile.animating = false;

      if (tile.targetGridCol < 1 || tile.targetGridCol > this.gridSize ||
          tile.targetGridRow < 1 || tile.targetGridRow > this.gridSize) {
        tile.state = UnitState.DISAPPEARED;
      } else {
        tile.state = UnitState.IDLE;
        tile.gridCol = tile.targetGridCol;
        tile.gridRow = tile.targetGridRow;
      }
    } else {
      const progress = tile.animationProgress;
      tile.currentX = tile.startX + (tile.targetX - tile.startX) * progress;
      tile.currentY = tile.startY + (tile.targetY - tile.startY) * progress;
    }
  }

  checkCollision(tile, col, row) {
    const tiles = this.currentLevel.tiles.filter(t => 
      t.id !== tile.id && t.state !== UnitState.DISAPPEARED
    );

    const tileLeft = col;
    const tileRight = col + tile.gridColSpan - 1;
    const tileTop = row;
    const tileBottom = row + tile.gridRowSpan - 1;

    const collisionStart = '--- 碰撞检测开始 ---';
    console.log(collisionStart);
    fileLogger.log(collisionStart);
    
    const tileInfo = `移动的格子: ${tile.id} 位置: (${col}, ${row}) span: ${tile.gridColSpan}x${tile.gridRowSpan}`;
    console.log('移动的格子:', tile.id, '位置:', col, row, 'span:', tile.gridColSpan, tile.gridRowSpan);
    fileLogger.log(tileInfo);
    
    const boundaryInfo = `检测边界: [${tileLeft}, ${tileTop}] 到 [${tileRight}, ${tileBottom}]`;
    console.log('检测边界:', tileLeft, tileTop, tileRight, tileBottom);
    fileLogger.log(boundaryInfo);

    for (const other of tiles) {
      const otherLeft = other.gridCol;
      const otherRight = other.gridCol + other.gridColSpan - 1;
      const otherTop = other.gridRow;
      const otherBottom = other.gridRow + other.gridRowSpan - 1;

      const checkInfo = `  检查格子: ${other.id} 位置: (${otherLeft}, ${otherTop}) span: ${other.gridColSpan}x${other.gridRowSpan}`;
      console.log('  检查格子:', other.id, '位置:', otherLeft, otherTop, 'span:', other.gridColSpan, other.gridRowSpan);
      fileLogger.log(checkInfo);

      if (tileLeft < otherRight && tileRight > otherLeft &&
          tileTop < otherBottom && tileBottom > otherTop) {
        const collisionFound = `  *** 碰撞！与格子 ${other.id} 相交`;
        const collisionDetail = `  *** 碰撞详情: [${tileLeft}, ${tileTop}] - [${tileRight}, ${tileBottom}] 与 [${otherLeft}, ${otherTop}] - [${otherRight}, ${otherBottom}]`;
        console.log('  *** 碰撞！与格子', other.id, '相交');
        console.log('  *** 碰撞详情: [', tileLeft, ',', tileTop, '] - [', tileRight, ',', tileBottom, '] 与 [', otherLeft, ',', otherTop, '] - [', otherRight, ',', otherBottom, ']');
        fileLogger.log(collisionFound);
        fileLogger.log(collisionDetail);
        return true;
      }
    }

    const collisionEnd = '--- 碰撞检测结束：无碰撞 ---';
    console.log(collisionEnd);
    fileLogger.log(collisionEnd);

    return false;
  }

  saveState() {
    if (!this.currentLevel) return;

    const state = {
      tiles: this.currentLevel.tiles.map(tile => ({
        id: tile.id,
        gridCol: tile.gridCol,
        gridRow: tile.gridRow,
        state: tile.state
      }))
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

    previousState.tiles.forEach(savedTile => {
      const tile = this.currentLevel.tiles.find(t => t.id === savedTile.id);
      if (tile) {
        tile.gridCol = savedTile.gridCol;
        tile.gridRow = savedTile.gridRow;
        tile.state = savedTile.state;
      }
    });

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

    this.history = [];
    const originalTiles = this.getLevel(this.currentLevel.id).tiles;
    
    this.currentLevel.tiles.forEach((tile, index) => {
      if (originalTiles[index]) {
        tile.gridCol = originalTiles[index].gridCol;
        tile.gridRow = originalTiles[index].gridRow;
        tile.state = UnitState.IDLE;
      }
    });

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
