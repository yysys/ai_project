const LevelManager = require('../utils/levelManager');
const { Level, Tile, LevelLoader, LevelValidator } = require('../utils/levelManager');
const { LevelType, UnitType, UnitState, TileType, Direction } = require('../utils/constants');

describe('LevelManager Refactored', () => {
  let levelManager;

  beforeEach(() => {
    levelManager = new LevelManager();
    levelManager.initDefaultLevels();
  });

  describe('Tile Class', () => {
    test('should create tile with default values', () => {
      const tile = new Tile({
        gridCol: 5,
        gridRow: 5
      });
      
      expect(tile.gridCol).toBe(5);
      expect(tile.gridRow).toBe(5);
      expect(tile.type).toBe(TileType.HORIZONTAL);
      expect(tile.unitType).toBe(UnitType.WOLF);
      expect(tile.direction).toBe(Direction.DOWN_RIGHT);
      expect(tile.state).toBe(UnitState.IDLE);
      expect(tile.animating).toBe(false);
      expect(tile.opacity).toBe(1);
    });

    test('should create tile with custom values', () => {
      const tile = new Tile({
        id: 'test_tile',
        type: TileType.VERTICAL,
        unitType: UnitType.DOG,
        gridCol: 7,
        gridRow: 7,
        gridColSpan: 1,
        gridRowSpan: 2,
        direction: Direction.UP_LEFT
      });
      
      expect(tile.id).toBe('test_tile');
      expect(tile.type).toBe(TileType.VERTICAL);
      expect(tile.unitType).toBe(UnitType.DOG);
      expect(tile.gridColSpan).toBe(1);
      expect(tile.gridRowSpan).toBe(2);
      expect(tile.direction).toBe(Direction.UP_LEFT);
    });

    test('should clone tile correctly', () => {
      const tile = new Tile({
        id: 'original',
        gridCol: 5,
        gridRow: 5,
        unitType: UnitType.DOG
      });
      tile.state = UnitState.SLIDING;
      tile.opacity = 0.5;
      
      const cloned = tile.clone();
      
      expect(cloned.id).toBe('original');
      expect(cloned.gridCol).toBe(5);
      expect(cloned.unitType).toBe(UnitType.DOG);
      expect(cloned.state).toBe(UnitState.SLIDING);
      expect(cloned.opacity).toBe(0.5);
      expect(cloned).not.toBe(tile);
    });
  });

  describe('Level Class', () => {
    test('should create level with tiles', () => {
      const tiles = [
        new Tile({ gridCol: 3, gridRow: 3, unitType: UnitType.WOLF }),
        new Tile({ gridCol: 7, gridRow: 7, unitType: UnitType.DOG })
      ];
      
      const level = new Level({
        id: 1,
        name: 'Test Level',
        tiles: tiles
      });
      
      expect(level.id).toBe(1);
      expect(level.name).toBe('Test Level');
      expect(level.tiles.length).toBe(2);
      expect(level.getWolfCount()).toBe(1);
      expect(level.getDogTile()).toBe(tiles[1]);
    });

    test('should create level with default name', () => {
      const level = new Level({ id: 5 });
      expect(level.name).toBe('第5关');
    });

    test('should clone level correctly', () => {
      const level = new Level({
        id: 1,
        name: 'Test',
        tiles: [new Tile({ gridCol: 5, gridRow: 5, unitType: UnitType.DOG })]
      });
      level.stars = 3;
      level.completed = true;
      
      const cloned = level.clone();
      
      expect(cloned.id).toBe(1);
      expect(cloned.stars).toBe(3);
      expect(cloned.completed).toBe(true);
      expect(cloned.tiles.length).toBe(1);
      expect(cloned.tiles[0]).not.toBe(level.tiles[0]);
    });
  });

  describe('LevelValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new LevelValidator();
    });

    describe('validateLevel', () => {
      test('should validate correct level', () => {
        const level = new Level({
          id: 1,
          name: 'Test Level',
          tiles: [
            new Tile({ id: 'wolf1', gridCol: 3, gridRow: 3, unitType: UnitType.WOLF }),
            new Tile({ id: 'dog1', gridCol: 7, gridRow: 7, unitType: UnitType.DOG })
          ]
        });
        
        const result = validator.validateLevel(level);
        
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
      });

      test('should detect missing dog tile', () => {
        const level = new Level({
          id: 1,
          name: 'Test Level',
          tiles: [
            new Tile({ gridCol: 3, gridRow: 3, unitType: UnitType.WOLF })
          ]
        });
        
        const result = validator.validateLevel(level);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Level must have exactly one dog tile');
      });

      test('should detect multiple dog tiles', () => {
        const level = new Level({
          id: 1,
          name: 'Test Level',
          tiles: [
            new Tile({ gridCol: 3, gridRow: 3, unitType: UnitType.DOG }),
            new Tile({ gridCol: 5, gridRow: 5, unitType: UnitType.DOG })
          ]
        });
        
        const result = validator.validateLevel(level);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Level must have exactly one dog tile');
      });

      test('should detect empty tiles', () => {
        const level = new Level({
          id: 1,
          name: 'Test Level',
          tiles: []
        });
        
        const result = validator.validateLevel(level);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Level must have at least one tile');
      });
    });

    describe('validateTile', () => {
      test('should detect out of bounds tile', () => {
        const tile = new Tile({ gridCol: 20, gridRow: 5 });
        const errors = validator.validateTile(tile);
        
        expect(errors.some(e => e.includes('gridCol out of bounds'))).toBe(true);
      });

      test('should detect tile exceeding grid', () => {
        const tile = new Tile({ gridCol: 13, gridRow: 5, gridColSpan: 2 });
        const errors = validator.validateTile(tile);
        
        expect(errors.some(e => e.includes('exceeds grid width'))).toBe(true);
      });
    });

    describe('checkTileOverlaps', () => {
      test('should detect overlapping tiles', () => {
        const tiles = [
          new Tile({ id: 'tile1', gridCol: 5, gridRow: 5, gridColSpan: 2, gridRowSpan: 2 }),
          new Tile({ id: 'tile2', gridCol: 6, gridRow: 6, gridColSpan: 2, gridRowSpan: 2 })
        ];
        
        const errors = validator.checkTileOverlaps(tiles);
        
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('overlap');
      });

      test('should pass non-overlapping tiles', () => {
        const tiles = [
          new Tile({ id: 'tile1', gridCol: 2, gridRow: 2, gridColSpan: 2, gridRowSpan: 2 }),
          new Tile({ id: 'tile2', gridCol: 6, gridRow: 6, gridColSpan: 2, gridRowSpan: 2 })
        ];
        
        const errors = validator.checkTileOverlaps(tiles);
        
        expect(errors.length).toBe(0);
      });
    });

    describe('checkSolvability', () => {
      test('should return false for level without dog', () => {
        const level = new Level({
          id: 1,
          name: 'Test',
          tiles: [new Tile({ gridCol: 5, gridRow: 5, unitType: UnitType.WOLF })]
        });
        level.dogTile = null;
        
        const result = validator.checkSolvability(level);
        
        expect(result.solvable).toBe(false);
        expect(result.reason).toBe('No dog tile found');
      });

      test('should return true for solvable level', () => {
        const level = new Level({
          id: 1,
          name: 'Test',
          tiles: [
            new Tile({ gridCol: 7, gridRow: 7, unitType: UnitType.DOG, direction: Direction.DOWN_LEFT })
          ]
        });
        level.dogTile = level.getDogTile();
        
        const result = validator.checkSolvability(level);
        
        expect(result.solvable).toBe(true);
      });

      test('should return false when dog is blocked', () => {
        const level = new Level({
          id: 1,
          name: 'Test',
          tiles: [
            new Tile({ gridCol: 7, gridRow: 7, unitType: UnitType.DOG, direction: Direction.DOWN_LEFT }),
            new Tile({ gridCol: 6, gridRow: 8, unitType: UnitType.WOLF })
          ]
        });
        level.dogTile = level.getDogTile();
        
        const result = validator.checkSolvability(level);
        
        expect(result.solvable).toBe(false);
        expect(result.reason).toBe('Dog cannot reach the edge');
      });
    });
  });

  describe('LevelLoader', () => {
    let loader;

    beforeEach(() => {
      loader = new LevelLoader();
    });

    describe('parseJSONLevel', () => {
      test('should parse valid JSON level data', () => {
        const levelData = {
          id: 1,
          name: 'Test Level',
          type: 'normal',
          timeLimit: 0,
          tiles: [
            {
              id: 'wolf1',
              type: 'horizontal',
              unitType: 'wolf',
              gridCol: 3,
              gridRow: 3,
              gridColSpan: 2,
              gridRowSpan: 1,
              direction: 'up_right'
            },
            {
              id: 'dog1',
              type: 'horizontal',
              unitType: 'dog',
              gridCol: 7,
              gridRow: 7,
              gridColSpan: 2,
              gridRowSpan: 1,
              direction: 'down_left'
            }
          ]
        };
        
        const level = loader.parseJSONLevel(levelData);
        
        expect(level).not.toBeNull();
        expect(level.id).toBe(1);
        expect(level.name).toBe('Test Level');
        expect(level.tiles.length).toBe(2);
        expect(level.dogTile).not.toBeNull();
        expect(level.dogTile.unitType).toBe(UnitType.DOG);
      });

      test('should return null for invalid data', () => {
        const level = loader.parseJSONLevel(null);
        expect(level).toBeNull();
      });

      test('should return null for data without tiles', () => {
        const level = loader.parseJSONLevel({ id: 1, name: 'Test' });
        expect(level).toBeNull();
      });
    });

    describe('clearCache', () => {
      test('should clear loaded levels cache', () => {
        loader.loadedLevels.set(1, { id: 1 });
        loader.loadedLevels.set(2, { id: 2 });
        
        loader.clearCache();
        
        expect(loader.loadedLevels.size).toBe(0);
      });
    });
  });

  describe('LevelManager Basic Operations', () => {
    test('should initialize with default levels', () => {
      const levels = levelManager.getLevels();
      expect(levels.length).toBe(10);
    });

    test('should unlock first level by default', () => {
      const levels = levelManager.getLevels();
      expect(levels[0].unlocked).toBe(true);
    });

    test('should lock other levels by default', () => {
      const levels = levelManager.getLevels();
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].unlocked).toBe(false);
      }
    });

    test('should get level by id', () => {
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
      levelManager.setCurrentLevel(1);
      levelManager.levels[9].unlocked = true;
      levelManager.currentLevelIndex = 9;
      const nextLevel = levelManager.unlockNextLevel();
      
      expect(nextLevel).toBeNull();
    });

    test('should add to unlocked levels in progress', () => {
      levelManager.setCurrentLevel(1);
      levelManager.unlockNextLevel();
      
      expect(levelManager.progress.unlockedLevels).toContain(2);
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

    test('should keep best stars score', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(2, 1000);
      levelManager.completeLevel(3, 1500);
      
      const level = levelManager.getCurrentLevel();
      expect(level.stars).toBe(3);
      expect(level.score).toBe(1500);
    });

    test('should update progress', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      expect(levelManager.progress.levelStars[1]).toBe(3);
      expect(levelManager.progress.levelScores[1]).toBe(1500);
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

    test('should clear progress data', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      levelManager.resetLevel();
      
      expect(levelManager.progress.levelStars[1]).toBeUndefined();
      expect(levelManager.progress.levelScores[1]).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    test('should calculate total stars', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      levelManager.setCurrentLevel(2);
      levelManager.levels[1].unlocked = true;
      levelManager.completeLevel(2, 1000);
      
      expect(levelManager.getTotalStars()).toBe(5);
    });

    test('should calculate max stars', () => {
      expect(levelManager.getMaxStars()).toBe(30);
    });

    test('should calculate total score', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      levelManager.setCurrentLevel(2);
      levelManager.levels[1].unlocked = true;
      levelManager.completeLevel(2, 1000);
      
      expect(levelManager.getTotalScore()).toBe(2500);
    });

    test('should get unlocked levels', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const unlocked = levelManager.getUnlockedLevels();
      expect(unlocked.length).toBe(2);
      expect(unlocked[0].id).toBe(1);
      expect(unlocked[1].id).toBe(2);
    });

    test('should get completed levels', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const completed = levelManager.getCompletedLevels();
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe(1);
    });
  });

  describe('calculateStars', () => {
    test('should return 3 stars for fast timed completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 10);
      
      expect(stars).toBe(3);
    });

    test('should return 2 stars for medium timed completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 20);
      
      expect(stars).toBe(2);
    });

    test('should return 1 star for slow timed completion', () => {
      const level = levelManager.getLevel(5);
      const stars = levelManager.calculateStars(level, 28);
      
      expect(stars).toBe(1);
    });

    test('should return 0 stars for null level', () => {
      const stars = levelManager.calculateStars(null, 10);
      expect(stars).toBe(0);
    });
  });

  describe('calculateScore', () => {
    test('should calculate base score', () => {
      const level = new Level({
        id: 1,
        tiles: [new Tile({ gridCol: 5, gridRow: 5, unitType: UnitType.WOLF })]
      });
      const score = levelManager.calculateScore(level, 10);
      
      expect(score).toBe(550);
    });

    test('should add time bonus for timed level', () => {
      const level = new Level({
        id: 1,
        type: LevelType.TIMED,
        timeLimit: 30,
        tiles: [new Tile({ gridCol: 5, gridRow: 5, unitType: UnitType.WOLF })]
      });
      const score = levelManager.calculateScore(level, 10);
      
      expect(score).toBe(650);
    });

    test('should return 0 for null level', () => {
      const score = levelManager.calculateScore(null, 10);
      expect(score).toBe(0);
    });
  });

  describe('Progress Management', () => {
    test('should load progress', () => {
      const progressData = {
        currentLevel: 2,
        unlockedLevels: [1, 2, 3],
        levelStars: { 1: 3, 2: 2 },
        levelScores: { 1: 1500, 2: 1000 },
        totalScore: 2500
      };
      
      levelManager.loadProgress(progressData);
      
      expect(levelManager.levels[0].unlocked).toBe(true);
      expect(levelManager.levels[1].unlocked).toBe(true);
      expect(levelManager.levels[2].unlocked).toBe(true);
      expect(levelManager.levels[0].stars).toBe(3);
      expect(levelManager.levels[1].stars).toBe(2);
      expect(levelManager.levels[0].completed).toBe(true);
    });

    test('should save progress', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const progress = levelManager.saveProgress();
      
      expect(progress.currentLevel).toBe(1);
      expect(progress.unlockedLevels).toContain(1);
      expect(progress.unlockedLevels).toContain(2);
      expect(progress.levelStars[1]).toBe(3);
      expect(progress.levelScores[1]).toBe(1500);
    });
  });

  describe('Level Status Queries', () => {
    test('should check if level is unlocked', () => {
      expect(levelManager.isLevelUnlocked(1)).toBe(true);
      expect(levelManager.isLevelUnlocked(2)).toBe(false);
      expect(levelManager.isLevelUnlocked(999)).toBe(false);
    });

    test('should check if level is completed', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      expect(levelManager.isLevelCompleted(1)).toBe(true);
      expect(levelManager.isLevelCompleted(2)).toBe(false);
    });

    test('should check if level is solvable', () => {
      expect(levelManager.isLevelSolvable(1)).toBe(true);
    });

    test('should get level stats', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);
      
      const stats = levelManager.getLevelStats(1);
      
      expect(stats.id).toBe(1);
      expect(stats.unlocked).toBe(true);
      expect(stats.completed).toBe(true);
      expect(stats.stars).toBe(3);
      expect(stats.score).toBe(1500);
      expect(stats.solvable).toBe(true);
    });

    test('should get all level stats', () => {
      const allStats = levelManager.getAllLevelStats();
      
      expect(allStats.length).toBe(10);
      expect(allStats[0].id).toBe(1);
    });
  });

  describe('Solvable Levels', () => {
    test('should get solvable levels', () => {
      const solvable = levelManager.getSolvableLevels();
      expect(solvable.length).toBe(10);
    });

    test('should get unsolvable levels', () => {
      levelManager.levels[0].solvable = false;
      
      const unsolvable = levelManager.getUnsolvableLevels();
      expect(unsolvable.length).toBe(1);
    });
  });
});
