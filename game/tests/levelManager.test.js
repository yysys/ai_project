const LevelManager = require('../utils/levelManager');
const { LevelType, UnitType, UnitState, DIRECTION_VECTORS } = require('../utils/constants');

describe('LevelManager', () => {
  let levelManager;

  beforeEach(() => {
    levelManager = new LevelManager();
  });

  describe('initLevels', () => {
    test('should initialize with 10 levels', () => {
      const levels = levelManager.getLevels();
      expect(levels.length).toBe(10);
    });

    test('should unlock first level', () => {
      const levels = levelManager.getLevels();
      expect(levels[0].unlocked).toBe(true);
    });

    test('should lock other levels', () => {
      const levels = levelManager.getLevels();
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].unlocked).toBe(false);
      }
    });
  });

  describe('getLevel', () => {
    test('should return level by id', () => {
      const level = levelManager.getLevel(1);
      expect(level).toBeDefined();
      expect(level.id).toBe(1);
    });

    test('should return undefined for non-existent level', () => {
      const level = levelManager.getLevel(999);
      expect(level).toBeUndefined();
    });
  });

  describe('setCurrentLevel', () => {
    test('should set current level when unlocked', () => {
      const success = levelManager.setCurrentLevel(1);
      expect(success).toBe(true);
      expect(levelManager.getCurrentLevel().id).toBe(1);
    });

    test('should not set current level when locked', () => {
      const success = levelManager.setCurrentLevel(2);
      expect(success).toBe(false);
      expect(levelManager.getCurrentLevel()).toBeNull();
    });
  });

  describe('unlockNextLevel', () => {
    test('should unlock next level', () => {
      levelManager.setCurrentLevel(1);
      const nextLevel = levelManager.unlockNextLevel();
      
      expect(nextLevel).toBeDefined();
      expect(nextLevel.id).toBe(2);
      expect(nextLevel.unlocked).toBe(true);
    });

    test('should return null when no next level', () => {
      levelManager.setCurrentLevel(10);
      levelManager.levels[9].unlocked = true;
      levelManager.currentLevelIndex = 9;
      const nextLevel = levelManager.unlockNextLevel();
      
      expect(nextLevel).toBeNull();
    });
  });

  describe('completeLevel', () => {
    test('should mark level as completed', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const level = levelManager.getCurrentLevel();
      expect(level.completed).toBe(true);
      expect(level.stars).toBe(3);
      expect(level.score).toBe(1500);
    });

    test('should unlock next level on completion', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const nextLevel = levelManager.getLevel(2);
      expect(nextLevel.unlocked).toBe(true);
    });
  });

  describe('resetLevel', () => {
    test('should reset current level', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      levelManager.resetLevel();
      
      const level = levelManager.getCurrentLevel();
      expect(level.completed).toBe(false);
      expect(level.stars).toBe(0);
      expect(level.score).toBe(0);
    });
  });

  describe('getTotalStars', () => {
    test('should return total stars across all levels', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      levelManager.setCurrentLevel(2);
      levelManager.completeLevel(2, 1000);
      
      expect(levelManager.getTotalStars()).toBe(5);
    });
  });

  describe('getMaxStars', () => {
    test('should return maximum possible stars', () => {
      expect(levelManager.getMaxStars()).toBe(30);
    });
  });

  describe('getUnlockedLevels', () => {
    test('should return only unlocked levels', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const unlocked = levelManager.getUnlockedLevels();
      expect(unlocked.length).toBe(2);
      expect(unlocked[0].id).toBe(1);
      expect(unlocked[1].id).toBe(2);
    });
  });

  describe('getCompletedLevels', () => {
    test('should return only completed levels', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const completed = levelManager.getCompletedLevels();
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe(1);
    });
  });

  describe('calculateStars', () => {
    test('should return 3 stars for fast completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 10);
      
      expect(stars).toBe(3);
    });

    test('should return 2 stars for medium completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 20);
      
      expect(stars).toBe(2);
    });

    test('should return 1 star for slow completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 28);
      
      expect(stars).toBe(1);
    });

    test('should return 2 stars for normal level', () => {
      const level = levelManager.getLevel(1);
      const stars = levelManager.calculateStars(level, 10);
      
      expect(stars).toBe(2);
    });
  });

  describe('calculateScore', () => {
    test('should calculate base score', () => {
      const level = levelManager.getLevel(1);
      const score = levelManager.calculateScore(level, 10);
      
      expect(score).toBe(500);
    });

    test('should add time bonus for timed level', () => {
      const level = levelManager.getLevel(5);
      const score = levelManager.calculateScore(level, 10);
      
      expect(score).toBeGreaterThan(500);
    });
  });
});
