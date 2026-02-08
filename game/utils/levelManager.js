const {
  LevelType,
  UnitState,
  GameState,
  getRandomDirection,
  generateId
} = require('./constants');

class Level {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || LevelType.NORMAL;
    this.wolfCount = config.wolfCount || 3;
    this.timeLimit = config.timeLimit;
    this.targetScore = config.targetScore;
    this.dog = null;
    this.wolves = [];
    this.stars = 0;
    this.score = 0;
    this.completed = false;
    this.unlocked = false;
  }
}

class LevelManager {
  constructor() {
    this.levels = [];
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.initLevels();
  }

  initLevels() {
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

    chapter1.forEach(config => {
      this.levels.push(new Level(config));
    });

    this.levels[0].unlocked = true;
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
      return true;
    }
    return false;
  }

  unlockNextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < this.levels.length) {
      this.levels[nextIndex].unlocked = true;
      return this.levels[nextIndex];
    }
    return null;
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

  resetLevel() {
    if (this.currentLevel) {
      this.currentLevel.completed = false;
      this.currentLevel.stars = 0;
      this.currentLevel.score = 0;
    }
  }

  getTotalStars() {
    return this.levels.reduce((sum, level) => sum + level.stars, 0);
  }

  getMaxStars() {
    return this.levels.length * 3;
  }

  getUnlockedLevels() {
    return this.levels.filter(level => level.unlocked);
  }

  getCompletedLevels() {
    return this.levels.filter(level => level.completed);
  }

  calculateStars(level, timeUsed) {
    let stars = 1;

    if (level.type === LevelType.TIMED && level.timeLimit) {
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

    if (level.type === LevelType.TIMED && level.timeLimit) {
      const timeRemaining = level.timeLimit - timeUsed;
      score += Math.floor(timeRemaining * 5);
    }

    return score;
  }
}

module.exports = LevelManager;
