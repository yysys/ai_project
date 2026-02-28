/**
 * 拼图游戏管理模块
 * 包含 Tile、PuzzleLevel、PuzzleManager 类
 * @module puzzleManager
 */

const { TileType, UnitType, UnitState, GameState, Direction, DIRECTION_VECTORS, generateId } = require('./constants');

const logger = require('./logger');

/**
 * 方块类
 * 表示游戏中的一个可滑动方块
 */
class Tile {
  /**
   * 创建一个方块
   * @param {Object} config - 方块配置
   * @param {string} [config.id] - 方块ID
   * @param {string} config.type - 方块类型
   * @param {string} [config.unitType] - 单位类型
   * @param {number} config.gridCol - 网格列位置
   * @param {number} config.gridRow - 网格行位置
   * @param {number} [config.gridColSpan=1] - 列跨度
   * @param {number} [config.gridRowSpan=1] - 行跨度
   * @param {string} [config.direction] - 滑动方向
   * @param {string} [config.imageUrl] - 图片URL
   */
  constructor(config) {
    this.id = config.id || generateId();
    this.type = config.type;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.UP_RIGHT;
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
  }

  /**
   * 克隆当前方块
   * @returns {Tile} 克隆的方块实例
   */
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

  /**
   * 从保存的状态恢复方块
   * @param {Object} saved - 保存的状态对象
   */
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
  }

  /**
   * 获取方块状态快照
   * @returns {Object} 状态快照对象
   */
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
      opacity: this.opacity
    };
  }
}

/**
 * 关卡类
 * 表示游戏中的一个关卡
 */
class PuzzleLevel {
  /**
   * 创建一个关卡
   * @param {Object} config - 关卡配置
   * @param {number} config.id - 关卡ID
   * @param {string} config.name - 关卡名称
   * @param {string} [config.type='normal'] - 关卡类型
   * @param {number} [config.timeLimit] - 时间限制
   * @param {Array} [config.tiles] - 方块配置数组
   * @param {boolean} [config.unlocked=false] - 是否解锁
   */
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

  /**
   * 获取所有方块的状态快照
   * @returns {Array} 方块状态快照数组
   */
  getTileSnapshots() {
    return this.tiles.map(tile => tile.getStateSnapshot());
  }

  /**
   * 从快照恢复关卡状态
   * @param {Array} snapshots - 方块状态快照数组
   */
  restoreFromSnapshots(snapshots) {
    snapshots.forEach(snapshot => {
      const tile = this.tiles.find(t => t.id === snapshot.id);
      if (tile) {
        tile.restoreFrom(snapshot);
      }
    });
  }
}

/**
 * 拼图管理器类
 * 管理游戏关卡、方块滑动、状态历史等
 */
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

  /**
   * 设置屏幕尺寸
   * @param {number} width - 屏幕宽度
   * @param {number} height - 屏幕高度
   */
  setScreenSize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  /**
   * 获取方块的屏幕位置
   * @param {Tile} tile - 方块实例
   * @returns {Object|null} 屏幕坐标 {x, y} 或 null
   */
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

  /**
   * 检查位置是否在菱形区域内
   * @param {number} col - 列位置
   * @param {number} row - 行位置
   * @param {number} colSpan - 列跨度
   * @param {number} rowSpan - 行跨度
   * @returns {boolean} 是否在菱形区域内
   */
  isPositionInDiamond(col, row, colSpan, rowSpan) {
    const gridSize = this.gridSize;
    const center = Math.ceil(gridSize / 2);

    for (let r = row; r < row + rowSpan; r++) {
      const distanceFromCenter = Math.abs(r - center);
      const maxColInRow = gridSize - distanceFromCenter;
      const startCol = Math.ceil((gridSize - maxColInRow) / 2);

      for (let c = col; c < col + colSpan; c++) {
        if (c < startCol || c >= startCol + maxColInRow) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 获取指定位置的菱形边界
   * @param {number} row - 行位置
   * @param {number} colSpan - 列跨度
   * @returns {Object} 边界信息 {startCol, endCol, maxColInRow}
   */
  getDiamondBoundaryForPosition(row, colSpan) {
    const gridSize = this.gridSize;
    const center = Math.ceil(gridSize / 2);
    const distanceFromCenter = Math.abs(row - center);
    const maxColInRow = gridSize - distanceFromCenter;
    const startCol = Math.ceil((gridSize - maxColInRow) / 2);
    const endCol = startCol + maxColInRow - 1;
    
    return { startCol, endCol, maxColInRow };
  }

  /**
   * 初始化所有关卡
   * @private
   */
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

  /**
   * 生成第1关的方块
   * @returns {Array} 方块配置数组
   * @private
   */
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
    }

    return tiles;
  }

  /**
   * 生成第2关的方块
   * @returns {Array} 方块配置数组
   * @private
   */
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

  /**
   * 生成第3关的方块
   * @returns {Array} 方块配置数组
   * @private
   */
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

  /**
   * 根据ID获取关卡
   * @param {number} id - 关卡ID
   * @returns {PuzzleLevel|undefined} 关卡实例
   */
  getLevel(id) {
    return this.levels.find(level => level.id === id);
  }

  /**
   * 获取所有关卡
   * @returns {Array<PuzzleLevel>} 关卡数组
   */
  getLevels() {
    return this.levels;
  }

  /**
   * 获取当前关卡
   * @returns {PuzzleLevel|null} 当前关卡实例
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * 设置当前关卡
   * @param {number} id - 关卡ID
   * @returns {boolean} 是否设置成功
   */
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

  /**
   * 获取当前关卡的所有可见方块
   * @returns {Array<Tile>} 方块数组
   */
  getTiles() {
    return this.currentLevel ? this.currentLevel.tiles.filter(t => t.state !== UnitState.DISAPPEARED) : [];
  }

  /**
   * 获取狗方块
   * @returns {Tile|null} 狗方块实例
   */
  getDogTile() {
    return this.currentLevel ? this.currentLevel.dogTile : null;
  }

  /**
   * 滑动方块
   * @param {Tile} tile - 要滑动的方块
   * @returns {Object} 滑动结果 {moved, disappeared, tile, distance, reason}
   */
  slideTile(tile) {
    if (tile.state !== UnitState.IDLE) {
      logger.debug('格子不是 IDLE 状态:', tile.state);
      return { moved: false, disappeared: false, reason: 'tile_not_idle' };
    }

    const direction = tile.direction;
    const vector = DIRECTION_VECTORS[direction];
    
    if (!vector) {
      logger.warn('无效的方向:', direction);
      return { moved: false, disappeared: false, reason: 'invalid_direction' };
    }

    const targetPosition = this.calculateTargetPosition(tile, vector);
    
    if (!targetPosition.canMove) {
      return { moved: false, disappeared: false, reason: targetPosition.reason || 'cannot_move' };
    }

    const startPos = this.getTileScreenPosition(tile);
    
    tile.state = UnitState.SLIDING;
    tile.animating = true;
    tile.animationProgress = 0;
    tile.startX = startPos ? startPos.x : 0;
    tile.startY = startPos ? startPos.y : 0;
    tile.currentX = tile.startX;
    tile.currentY = tile.startY;
    tile.targetGridCol = targetPosition.gridCol;
    tile.targetGridRow = targetPosition.gridRow;
    
    const tempTile = { ...tile, gridCol: targetPosition.gridCol, gridRow: targetPosition.gridRow };
    const endPos = this.getTileScreenPosition(tempTile);
    tile.targetX = endPos ? endPos.x : 0;
    tile.targetY = endPos ? endPos.y : 0;

    logger.debug('slideTile:', tile.id, '方向:', direction, '目标:', tile.targetGridCol, tile.targetGridRow);

    return { 
      moved: true, 
      disappeared: targetPosition.willDisappear, 
      tile,
      distance: targetPosition.distance
    };
  }

  /**
   * 计算方块的目标位置
   * @param {Tile} tile - 方块实例
   * @param {Object} vector - 方向向量
   * @returns {Object} 目标位置信息
   * @private
   */
  calculateTargetPosition(tile, vector) {
    let currentCol = tile.gridCol;
    let currentRow = tile.gridRow;
    let distance = 0;
    const originalCol = tile.gridCol;
    const originalRow = tile.gridRow;
    
    while (true) {
      const nextCol = currentCol + vector.col;
      const nextRow = currentRow + vector.row;
      
      const isInsideDiamond = this.isPositionInDiamond(
        nextCol, nextRow, 
        tile.gridColSpan, tile.gridRowSpan
      );
      
      if (!isInsideDiamond) {
        if (distance === 0) {
          return {
            gridCol: originalCol,
            gridRow: originalRow,
            willDisappear: false,
            distance: 0,
            canMove: false,
            reason: 'blocked_by_boundary'
          };
        }
        return {
          gridCol: currentCol,
          gridRow: currentRow,
          willDisappear: false,
          distance,
          canMove: true
        };
      }
      
      if (this.checkCollision(tile, nextCol, nextRow)) {
        if (distance === 0) {
          return {
            gridCol: originalCol,
            gridRow: originalRow,
            willDisappear: false,
            distance: 0,
            canMove: false,
            reason: 'blocked_by_collision'
          };
        }
        return {
          gridCol: currentCol,
          gridRow: currentRow,
          willDisappear: false,
          distance,
          canMove: true
        };
      }
      
      currentCol = nextCol;
      currentRow = nextRow;
      distance++;
    }
  }

  /**
   * 更新方块动画
   * @param {Tile} tile - 方块实例
   * @param {number} deltaTime - 时间增量（秒）
   */
  updateTileAnimation(tile, deltaTime) {
    if (!tile.animating) return;

    const { ANIMATION_CONFIG } = require('./constants');
    const moveSpeed = ANIMATION_CONFIG.MOVE_SPEED;
    const fadeOutDuration = ANIMATION_CONFIG.FADE_OUT_DURATION;

    if (tile.state === UnitState.SLIDING) {
      const totalDistance = Math.sqrt(
        Math.pow(tile.targetX - tile.startX, 2) + 
        Math.pow(tile.targetY - tile.startY, 2)
      );
      
      if (totalDistance === 0) {
        tile.currentX = tile.targetX;
        tile.currentY = tile.targetY;
        tile.animationProgress = 1;
        tile.animating = false;
        
        if (tile.targetGridCol > 0 && tile.targetGridRow > 0) {
          tile.gridCol = tile.targetGridCol;
          tile.gridRow = tile.targetGridRow;
        }
        tile.state = UnitState.IDLE;
        return;
      }
      
      const moveStep = moveSpeed * deltaTime;
      tile.animationProgress += moveStep / totalDistance;
      
      if (tile.animationProgress >= 1) {
        tile.animationProgress = 1;
        tile.currentX = tile.targetX;
        tile.currentY = tile.targetY;
        
        tile.gridCol = tile.targetGridCol;
        tile.gridRow = tile.targetGridRow;
        tile.animating = false;
        tile.state = UnitState.IDLE;
      } else {
        const clampedProgress = Math.min(tile.animationProgress, 1);
        tile.currentX = tile.startX + (tile.targetX - tile.startX) * clampedProgress;
        tile.currentY = tile.startY + (tile.targetY - tile.startY) * clampedProgress;
      }
    } else if (tile.state === UnitState.FADING_OUT) {
      tile.animationProgress += deltaTime * 1000 / fadeOutDuration;
      
      if (tile.animationProgress >= 1) {
        tile.animationProgress = 1;
        tile.opacity = 0;
        tile.state = UnitState.DISAPPEARED;
        tile.animating = false;
      } else {
        tile.opacity = 1 - tile.animationProgress;
      }
    }
  }

  /**
   * 检查碰撞
   * @param {Tile} tile - 方块实例
   * @param {number} col - 列位置
   * @param {number} row - 行位置
   * @returns {boolean} 是否发生碰撞
   */
  checkCollision(tile, col, row) {
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
        return true;
      }
    }

    return false;
  }

  /**
   * 保存当前状态到历史记录
   */
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

  /**
   * 撤销上一步操作
   * @returns {boolean} 是否撤销成功
   */
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

  /**
   * 检查是否满足胜利条件
   * @returns {boolean} 是否胜利
   */
  checkWinCondition() {
    const dogTile = this.getDogTile();
    if (!dogTile) return false;

    return dogTile.state === UnitState.DISAPPEARED;
  }

  /**
   * 完成当前关卡
   * @param {number} stars - 获得的星星数
   * @param {number} score - 获得的分数
   * @returns {PuzzleLevel|null} 解锁的下一关
   */
  completeLevel(stars, score) {
    if (this.currentLevel) {
      this.currentLevel.completed = true;
      this.currentLevel.stars = stars;
      this.currentLevel.score = score;
      return this.unlockNextLevel();
    }
    return null;
  }

  /**
   * 解锁下一关
   * @returns {PuzzleLevel|null} 解锁的关卡
   */
  unlockNextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < this.levels.length) {
      this.levels[nextIndex].unlocked = true;
      return this.levels[nextIndex];
    }
    return null;
  }

  /**
   * 重置当前关卡
   */
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

  /**
   * 计算星星数
   * @param {PuzzleLevel} level - 关卡实例
   * @param {number} timeUsed - 使用时间
   * @returns {number} 星星数
   */
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

  /**
   * 计算分数
   * @param {PuzzleLevel} level - 关卡实例
   * @param {number} timeUsed - 使用时间
   * @returns {number} 分数
   */
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
