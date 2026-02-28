const {
  LevelType,
  UnitState,
  UnitType,
  TileType,
  Direction,
  DIRECTION_VECTORS,
  generateId
} = require('./constants');

class Tile {
  constructor(config) {
    this.id = config.id || generateId();
    this.type = config.type || TileType.HORIZONTAL;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.DOWN_RIGHT;
    this.state = UnitState.IDLE;
    
    this.animating = false;
    this.animationProgress = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetGridCol = config.gridCol;
    this.targetGridRow = config.gridRow;
    this.opacity = 1;
  }

  clone() {
    const tile = new Tile({
      id: this.id,
      type: this.type,
      unitType: this.unitType,
      gridCol: this.gridCol,
      gridRow: this.gridRow,
      gridColSpan: this.gridColSpan,
      gridRowSpan: this.gridRowSpan,
      direction: this.direction
    });
    tile.state = this.state;
    tile.animating = this.animating;
    tile.animationProgress = this.animationProgress;
    tile.opacity = this.opacity;
    return tile;
  }
}

class Level {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || `第${config.id}关`;
    this.type = config.type || LevelType.NORMAL;
    this.timeLimit = config.timeLimit || 0;
    this.targetScore = config.targetScore || 0;
    this.tiles = config.tiles || [];
    this.dogTile = config.dogTile || null;
    this.stars = 0;
    this.score = 0;
    this.completed = false;
    this.unlocked = config.unlocked || false;
    this.solvable = true;
    this.validated = false;
  }

  getWolfCount() {
    return this.tiles.filter(t => t.unitType === UnitType.WOLF).length;
  }

  getDogTile() {
    return this.tiles.find(t => t.unitType === UnitType.DOG) || null;
  }

  clone() {
    const level = new Level({
      id: this.id,
      name: this.name,
      type: this.type,
      timeLimit: this.timeLimit,
      targetScore: this.targetScore,
      tiles: this.tiles.map(t => t.clone()),
      unlocked: this.unlocked
    });
    level.stars = this.stars;
    level.score = this.score;
    level.completed = this.completed;
    level.solvable = this.solvable;
    level.validated = this.validated;
    level.dogTile = level.getDogTile();
    return level;
  }
}

class LevelLoader {
  constructor() {
    this.jsonLevelsPath = '../../simulation_json/';
    this.loadedLevels = new Map();
  }

  async loadLevelFromJSON(levelId) {
    if (this.loadedLevels.has(levelId)) {
      return this.loadedLevels.get(levelId);
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const levelPath = path.join(__dirname, this.jsonLevelsPath, `level_${levelId}.json`);
      
      if (!fs.existsSync(levelPath)) {
        return null;
      }

      const data = fs.readFileSync(levelPath, 'utf8');
      const levelData = JSON.parse(data);
      
      this.loadedLevels.set(levelId, levelData);
      return levelData;
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      return null;
    }
  }

  async loadAllLevels() {
    try {
      const fs = require('fs');
      const path = require('path');
      const levelsPath = path.join(__dirname, this.jsonLevelsPath, 'levels.json');
      
      if (!fs.existsSync(levelsPath)) {
        return [];
      }

      const data = fs.readFileSync(levelsPath, 'utf8');
      const levelsData = JSON.parse(data);
      
      return levelsData;
    } catch (error) {
      console.error('Failed to load all levels:', error);
      return [];
    }
  }

  parseJSONLevel(levelData) {
    if (!levelData || !Array.isArray(levelData.tiles)) {
      return null;
    }

    const tiles = levelData.tiles.map(tileData => new Tile({
      id: tileData.id,
      type: tileData.type,
      unitType: tileData.unitType,
      gridCol: tileData.gridCol,
      gridRow: tileData.gridRow,
      gridColSpan: tileData.gridColSpan,
      gridRowSpan: tileData.gridRowSpan,
      direction: tileData.direction
    }));

    const level = new Level({
      id: levelData.id,
      name: levelData.name,
      type: levelData.type || LevelType.NORMAL,
      timeLimit: levelData.timeLimit || 0,
      targetScore: levelData.targetScore || 0,
      tiles: tiles,
      unlocked: levelData.unlocked || false
    });

    level.dogTile = level.getDogTile();
    
    return level;
  }

  clearCache() {
    this.loadedLevels.clear();
  }
}

class LevelValidator {
  constructor() {
    this.GRID_SIZE = 14;
  }

  validateLevel(level) {
    const errors = [];
    
    if (!level.id || typeof level.id !== 'number') {
      errors.push('Invalid level ID');
    }

    if (!level.name || typeof level.name !== 'string') {
      errors.push('Invalid level name');
    }

    if (!Array.isArray(level.tiles) || level.tiles.length === 0) {
      errors.push('Level must have at least one tile');
      return { valid: false, errors };
    }

    const dogTiles = level.tiles.filter(t => t.unitType === UnitType.DOG);
    if (dogTiles.length !== 1) {
      errors.push('Level must have exactly one dog tile');
    }

    for (const tile of level.tiles) {
      const tileErrors = this.validateTile(tile);
      errors.push(...tileErrors);
    }

    const overlapErrors = this.checkTileOverlaps(level.tiles);
    errors.push(...overlapErrors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateTile(tile) {
    const errors = [];

    if (tile.gridCol < 0 || tile.gridCol >= this.GRID_SIZE) {
      errors.push(`Tile ${tile.id}: gridCol out of bounds`);
    }

    if (tile.gridRow < 0 || tile.gridRow >= this.GRID_SIZE) {
      errors.push(`Tile ${tile.id}: gridRow out of bounds`);
    }

    const endCol = tile.gridCol + tile.gridColSpan;
    const endRow = tile.gridRow + tile.gridRowSpan;

    if (endCol > this.GRID_SIZE) {
      errors.push(`Tile ${tile.id}: exceeds grid width`);
    }

    if (endRow > this.GRID_SIZE) {
      errors.push(`Tile ${tile.id}: exceeds grid height`);
    }

    if (!Object.values(TileType).includes(tile.type)) {
      errors.push(`Tile ${tile.id}: invalid tile type`);
    }

    if (!Object.values(UnitType).includes(tile.unitType)) {
      errors.push(`Tile ${tile.id}: invalid unit type`);
    }

    if (!Object.values(Direction).includes(tile.direction)) {
      errors.push(`Tile ${tile.id}: invalid direction`);
    }

    return errors;
  }

  checkTileOverlaps(tiles) {
    const errors = [];
    const occupiedCells = new Map();

    for (const tile of tiles) {
      for (let c = tile.gridCol; c < tile.gridCol + tile.gridColSpan; c++) {
        for (let r = tile.gridRow; r < tile.gridRow + tile.gridRowSpan; r++) {
          const key = `${c},${r}`;
          if (occupiedCells.has(key)) {
            errors.push(`Tiles ${occupiedCells.get(key)} and ${tile.id} overlap at (${c}, ${r})`);
          } else {
            occupiedCells.set(key, tile.id);
          }
        }
      }
    }

    return errors;
  }

  checkSolvability(level) {
    if (!level.dogTile) {
      return { solvable: false, reason: 'No dog tile found' };
    }

    const hasValidDirection = this.hasValidDogDirection(level);
    if (!hasValidDirection) {
      return { solvable: false, reason: 'Dog has no valid escape direction' };
    }

    const canReachEdge = this.canDogReachEdge(level);
    if (!canReachEdge) {
      return { solvable: false, reason: 'Dog cannot reach the edge' };
    }

    return { solvable: true, reason: null };
  }

  hasValidDogDirection(level) {
    const dog = level.dogTile;
    if (!dog) return false;

    const vector = DIRECTION_VECTORS[dog.direction];
    if (!vector) return false;

    return true;
  }

  canDogReachEdge(level) {
    const dog = level.dogTile;
    if (!dog) return false;

    const vector = DIRECTION_VECTORS[dog.direction];
    if (!vector) return false;

    let col = dog.gridCol;
    let row = dog.gridRow;

    while (true) {
      col += vector.col;
      row += vector.row;

      if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) {
        return true;
      }

      const blockingTile = this.findBlockingTile(level.tiles, col, row, dog);
      if (blockingTile) {
        return false;
      }
    }
  }

  findBlockingTile(tiles, col, row, excludeTile) {
    for (const tile of tiles) {
      if (tile.id === excludeTile.id) continue;
      
      if (col >= tile.gridCol && col < tile.gridCol + tile.gridColSpan &&
          row >= tile.gridRow && row < tile.gridRow + tile.gridRowSpan) {
        return tile;
      }
    }
    return null;
  }
}

class LevelManager {
  constructor() {
    this.levels = [];
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.levelLoader = new LevelLoader();
    this.levelValidator = new LevelValidator();
    this.initialized = false;
    this.progress = {
      currentLevel: 1,
      unlockedLevels: [1],
      levelStars: {},
      levelScores: {},
      totalScore: 0
    };
  }

  async init() {
    if (this.initialized) {
      return;
    }

    await this.loadLevelsFromJSON();
    this.initialized = true;
  }

  async loadLevelsFromJSON() {
    try {
      const levelsData = await this.levelLoader.loadAllLevels();
      
      if (levelsData && levelsData.length > 0) {
        this.levels = [];
        
        for (const levelData of levelsData) {
          const level = this.levelLoader.parseJSONLevel(levelData);
          
          if (level) {
            const validation = this.levelValidator.validateLevel(level);
            const solvability = this.levelValidator.checkSolvability(level);
            
            level.validated = validation.valid;
            level.solvable = solvability.solvable;
            
            if (!level.solvable) {
              console.warn(`Level ${level.id} may not be solvable: ${solvability.reason}`);
            }
            
            if (this.progress.unlockedLevels.includes(level.id)) {
              level.unlocked = true;
            }
            
            if (this.progress.levelStars[level.id]) {
              level.stars = this.progress.levelStars[level.id];
            }
            
            if (this.progress.levelScores[level.id]) {
              level.score = this.progress.levelScores[level.id];
            }
            
            if (level.stars > 0) {
              level.completed = true;
            }
            
            this.levels.push(level);
          }
        }
      }

      if (this.levels.length === 0) {
        this.initDefaultLevels();
      }

      if (this.levels.length > 0 && !this.levels[0].unlocked) {
        this.levels[0].unlocked = true;
      }

    } catch (error) {
      console.error('Failed to load levels from JSON:', error);
      this.initDefaultLevels();
    }
  }

  initDefaultLevels() {
    const chapter1 = [
      { id: 1, name: '第1关', wolfCount: 2, type: LevelType.NORMAL },
      { id: 2, name: '第2关', wolfCount: 3, type: LevelType.NORMAL },
      { id: 3, name: '第3关', wolfCount: 4, type: LevelType.NORMAL },
      { id: 4, name: '第4关', wolfCount: 5, type: LevelType.NORMAL },
      { id: 5, name: '第5关', wolfCount: 3, type: LevelType.TIMED, timeLimit: 30 },
      { id: 6, name: '第6关', wolfCount: 4, type: LevelType.NORMAL },
      { id: 7, name: '第7关', wolfCount: 5, type: LevelType.NORMAL },
      { id: 8, name: '第8关', wolfCount: 6, type: LevelType.NORMAL },
      { id: 9, name: '第9关', wolfCount: 4, type: LevelType.TIMED, timeLimit: 25 },
      { id: 10, name: '第10关', wolfCount: 6, type: LevelType.NORMAL }
    ];

    this.levels = [];
    
    chapter1.forEach(config => {
      const level = new Level({
        id: config.id,
        name: config.name,
        type: config.type,
        timeLimit: config.timeLimit,
        tiles: [],
        unlocked: false
      });
      level.validated = true;
      level.solvable = true;
      this.levels.push(level);
    });

    if (this.levels.length > 0) {
      this.levels[0].unlocked = true;
    }
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
      this.progress.currentLevel = id;
      return true;
    }
    return false;
  }

  unlockNextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < this.levels.length) {
      const nextLevel = this.levels[nextIndex];
      nextLevel.unlocked = true;
      
      if (!this.progress.unlockedLevels.includes(nextLevel.id)) {
        this.progress.unlockedLevels.push(nextLevel.id);
      }
      
      return nextLevel;
    }
    return null;
  }

  completeLevel(stars, score) {
    if (this.currentLevel) {
      this.currentLevel.completed = true;
      this.currentLevel.stars = Math.max(this.currentLevel.stars, stars);
      this.currentLevel.score = Math.max(this.currentLevel.score, score);
      
      this.progress.levelStars[this.currentLevel.id] = this.currentLevel.stars;
      this.progress.levelScores[this.currentLevel.id] = this.currentLevel.score;
      this.progress.totalScore = this.getTotalScore();
      
      return this.unlockNextLevel();
    }
    return null;
  }

  resetLevel() {
    if (this.currentLevel) {
      this.currentLevel.completed = false;
      this.currentLevel.stars = 0;
      this.currentLevel.score = 0;
      
      delete this.progress.levelStars[this.currentLevel.id];
      delete this.progress.levelScores[this.currentLevel.id];
    }
  }

  getTotalStars() {
    return this.levels.reduce((sum, level) => sum + level.stars, 0);
  }

  getMaxStars() {
    return this.levels.length * 3;
  }

  getTotalScore() {
    return this.levels.reduce((sum, level) => sum + level.score, 0);
  }

  getUnlockedLevels() {
    return this.levels.filter(level => level.unlocked);
  }

  getCompletedLevels() {
    return this.levels.filter(level => level.completed);
  }

  getSolvableLevels() {
    return this.levels.filter(level => level.solvable);
  }

  getUnsolvableLevels() {
    return this.levels.filter(level => !level.solvable);
  }

  calculateStars(level, timeUsed) {
    if (!level) return 0;

    let stars = 1;

    if (level.type === LevelType.TIMED && level.timeLimit) {
      const timeRatio = timeUsed / level.timeLimit;
      if (timeRatio < 0.5) {
        stars = 3;
      } else if (timeRatio < 0.75) {
        stars = 2;
      }
    } else if (level.type === LevelType.CHALLENGE) {
      const wolfCount = level.getWolfCount();
      if (wolfCount <= 3) {
        stars = 3;
      } else if (wolfCount <= 5) {
        stars = 2;
      }
    } else {
      const wolfCount = level.getWolfCount();
      if (wolfCount <= 3) {
        stars = 3;
      } else if (wolfCount <= 5) {
        stars = 2;
      }
    }

    return stars;
  }

  calculateScore(level, timeUsed) {
    if (!level) return 0;

    let score = 500;

    if (level.type === LevelType.TIMED && level.timeLimit) {
      const timeRemaining = level.timeLimit - timeUsed;
      if (timeRemaining > 0) {
        score += Math.floor(timeRemaining * 5);
      }
    }

    const wolfCount = level.getWolfCount();
    score += wolfCount * 50;

    return score;
  }

  loadProgress(progressData) {
    if (!progressData) return;

    this.progress = {
      currentLevel: progressData.currentLevel || 1,
      unlockedLevels: progressData.unlockedLevels || [1],
      levelStars: progressData.levelStars || {},
      levelScores: progressData.levelScores || {},
      totalScore: progressData.totalScore || 0
    };

    this.levels.forEach(level => {
      if (this.progress.unlockedLevels.includes(level.id)) {
        level.unlocked = true;
      }
      
      if (this.progress.levelStars[level.id]) {
        level.stars = this.progress.levelStars[level.id];
        level.completed = true;
      }
      
      if (this.progress.levelScores[level.id]) {
        level.score = this.progress.levelScores[level.id];
      }
    });
  }

  saveProgress() {
    return {
      currentLevel: this.progress.currentLevel,
      unlockedLevels: this.progress.unlockedLevels,
      levelStars: this.progress.levelStars,
      levelScores: this.progress.levelScores,
      totalScore: this.getTotalScore()
    };
  }

  isLevelUnlocked(levelId) {
    const level = this.getLevel(levelId);
    return level ? level.unlocked : false;
  }

  isLevelCompleted(levelId) {
    const level = this.getLevel(levelId);
    return level ? level.completed : false;
  }

  isLevelSolvable(levelId) {
    const level = this.getLevel(levelId);
    return level ? level.solvable : false;
  }

  getLevelStats(levelId) {
    const level = this.getLevel(levelId);
    if (!level) return null;

    return {
      id: level.id,
      name: level.name,
      type: level.type,
      unlocked: level.unlocked,
      completed: level.completed,
      stars: level.stars,
      score: level.score,
      solvable: level.solvable,
      validated: level.validated,
      wolfCount: level.getWolfCount()
    };
  }

  getAllLevelStats() {
    return this.levels.map(level => this.getLevelStats(level.id));
  }
}

module.exports = LevelManager;
module.exports.Level = Level;
module.exports.Tile = Tile;
module.exports.LevelLoader = LevelLoader;
module.exports.LevelValidator = LevelValidator;
