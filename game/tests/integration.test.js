const { Direction, UnitType, UnitState, TileType, GameState, generateId } = require('../utils/constants');
const PuzzleManager = require('../utils/puzzleManager');
const GameEngine = require('../utils/gameEngine');
const LevelManager = require('../utils/levelManager');

describe('Integration Tests - Core Game Flow', () => {
  describe('Game Initialization Flow', () => {
    test('should initialize game engine with puzzle manager', () => {
      const gameEngine = new GameEngine();
      const mockCanvas = { width: 375, height: 667 };
      const mockCtx = {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        stroke: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        save: jest.fn(),
        restore: jest.fn()
      };

      gameEngine.init(mockCanvas, mockCtx, 375, 667);

      expect(gameEngine.isInitialized).toBe(true);
      expect(gameEngine.puzzleManager).toBeDefined();
      expect(gameEngine.getState().status).toBe(GameState.IDLE);
    });

    test('should load levels from puzzle manager', () => {
      const puzzleManager = new PuzzleManager();
      const levels = puzzleManager.getLevels();

      expect(levels.length).toBeGreaterThan(0);
      expect(levels[0].unlocked).toBe(true);
    });
  });

  describe('Level Selection Flow', () => {
    let puzzleManager;

    beforeEach(() => {
      puzzleManager = new PuzzleManager();
    });

    test('should select and initialize a level', () => {
      const result = puzzleManager.setCurrentLevel(1);

      expect(result).toBe(true);
      expect(puzzleManager.getCurrentLevel()).toBeDefined();
      expect(puzzleManager.getCurrentLevel().id).toBe(1);
    });

    test('should not select locked level', () => {
      const result = puzzleManager.setCurrentLevel(2);

      expect(result).toBe(false);
      expect(puzzleManager.getCurrentLevel()).toBeNull();
    });

    test('should get tiles after level selection', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();

      expect(tiles.length).toBeGreaterThan(0);
    });

    test('should find dog tile after level selection', () => {
      puzzleManager.setCurrentLevel(1);
      const dogTile = puzzleManager.getDogTile();

      expect(dogTile).toBeDefined();
      expect(dogTile.unitType).toBe(UnitType.DOG);
    });
  });

  describe('Tile Movement Flow', () => {
    let puzzleManager;

    beforeEach(() => {
      puzzleManager = new PuzzleManager();
      puzzleManager.gridSize = 14;
    });

    test('should move tile and update state', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();
      const tile = tiles.find(t => t.state === UnitState.IDLE);

      if (tile) {
        const result = puzzleManager.slideTile(tile);

        expect(result).toBeDefined();
        expect(result.disappeared).toBe(false);
      }
    });

    test('should handle collision during movement', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();

      if (tiles.length >= 2) {
        const tile1 = tiles[0];
        const tile2 = tiles[1];

        tile1.gridCol = 5;
        tile1.gridRow = 5;
        tile1.direction = Direction.DOWN_RIGHT;
        tile1.state = UnitState.IDLE;

        tile2.gridCol = 6;
        tile2.gridRow = 6;
        tile2.state = UnitState.IDLE;

        const result = puzzleManager.slideTile(tile1);

        expect(result.moved).toBe(false);
        expect(result.reason).toBe('blocked_by_collision');
      }
    });

    test('should handle boundary during movement', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];

      tile.gridCol = 1;
      tile.gridRow = 1;
      tile.direction = Direction.UP_LEFT;
      tile.state = UnitState.IDLE;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('blocked_by_boundary');
    });
  });

  describe('Undo/Reset Flow', () => {
    let puzzleManager;

    beforeEach(() => {
      puzzleManager = new PuzzleManager();
      puzzleManager.setCurrentLevel(1);
    });

    test('should save and restore state during undo', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;

      puzzleManager.slideTile(tile);
      puzzleManager.saveState();

      if (tile.targetGridCol && tile.targetGridRow) {
        tile.gridCol = tile.targetGridCol;
        tile.gridRow = tile.targetGridRow;
        tile.state = UnitState.IDLE;
        tile.animating = false;

        const undoResult = puzzleManager.undo();

        expect(undoResult).toBe(true);
      }
    });

    test('should reset level to initial state', () => {
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;

      puzzleManager.slideTile(tile);
      puzzleManager.saveState();

      puzzleManager.resetLevel();

      expect(tile.gridCol).toBe(originalCol);
      expect(tile.gridRow).toBe(originalRow);
    });
  });

  describe('Level Completion Flow', () => {
    let puzzleManager;
    let levelManager;

    beforeEach(() => {
      puzzleManager = new PuzzleManager();
      levelManager = new LevelManager();
      levelManager.initDefaultLevels();
    });

    test('should calculate stars correctly', () => {
      const level = puzzleManager.getLevel(1);
      const stars = puzzleManager.calculateStars(level, 10);

      expect(stars).toBeGreaterThanOrEqual(1);
      expect(stars).toBeLessThanOrEqual(3);
    });

    test('should calculate score correctly', () => {
      const level = puzzleManager.getLevel(1);
      const score = puzzleManager.calculateScore(level, 10);

      expect(score).toBeGreaterThan(0);
    });

    test('should complete level and unlock next', () => {
      puzzleManager.setCurrentLevel(1);
      const result = puzzleManager.completeLevel(3, 1500);

      expect(result).toBeDefined();
      expect(result.unlocked).toBe(true);
    });
  });

  describe('Game Engine Integration', () => {
    let gameEngine;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
      gameEngine = new GameEngine();
      mockCanvas = { width: 375, height: 667 };
      mockCtx = {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        stroke: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        save: jest.fn(),
        restore: jest.fn()
      };
      gameEngine.init(mockCanvas, mockCtx, 375, 667);
    });

    afterEach(() => {
      gameEngine.destroy();
    });

    test('should start level and change state', () => {
      const result = gameEngine.startLevel(1);

      expect(result).toBe(true);
      expect(gameEngine.getState().status).toBe(GameState.PLAYING);
    });

    test('should pause and resume game', () => {
      gameEngine.startLevel(1);
      gameEngine.pause();

      expect(gameEngine.getState().status).toBe(GameState.PAUSED);

      gameEngine.resume();

      expect(gameEngine.getState().status).toBe(GameState.PLAYING);
    });

    test('should reset game state', () => {
      gameEngine.startLevel(1);
      gameEngine.stateManager.setState({ moveCount: 5, elapsedTime: 10 });

      gameEngine.reset();

      expect(gameEngine.getState().moveCount).toBe(0);
      expect(gameEngine.getState().elapsedTime).toBe(0);
    });

    test('should handle click events', () => {
      gameEngine.startLevel(1);

      const result = gameEngine.handleClick(0, 0);

      expect(result).toBe(false);
    });
  });

  describe('Level Manager Integration', () => {
    let levelManager;

    beforeEach(() => {
      levelManager = new LevelManager();
      levelManager.initDefaultLevels();
    });

    test('should manage level progress', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);

      const stats = levelManager.getLevelStats(1);

      expect(stats.completed).toBe(true);
      expect(stats.stars).toBe(3);
      expect(stats.score).toBe(1500);
    });

    test('should unlock next level after completion', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);

      expect(levelManager.isLevelUnlocked(2)).toBe(true);
    });

    test('should track total stars and score', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);

      expect(levelManager.getTotalStars()).toBe(3);
      expect(levelManager.getTotalScore()).toBe(1500);
    });

    test('should save and load progress', () => {
      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);

      const progress = levelManager.saveProgress();

      const newManager = new LevelManager();
      newManager.initDefaultLevels();
      newManager.loadProgress(progress);

      expect(newManager.isLevelCompleted(1)).toBe(true);
      expect(newManager.getTotalStars()).toBe(3);
    });
  });

  describe('Error Handling Integration', () => {
    let puzzleManager;

    beforeEach(() => {
      puzzleManager = new PuzzleManager();
    });

    test('should handle invalid level selection', () => {
      const result = puzzleManager.setCurrentLevel(999);

      expect(result).toBe(false);
    });

    test('should handle movement of non-idle tile', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      tile.state = UnitState.SLIDING;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('tile_not_idle');
    });

    test('should handle invalid direction', () => {
      puzzleManager.setCurrentLevel(1);
      const tiles = puzzleManager.getTiles();
      const tile = tiles[0];
      tile.direction = 'invalid_direction';

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('invalid_direction');
    });

    test('should handle undo with no history', () => {
      puzzleManager.setCurrentLevel(1);
      puzzleManager.history = [];
      puzzleManager.saveState();

      const result = puzzleManager.undo();

      expect(result).toBe(false);
    });
  });

  describe('Performance Integration', () => {
    test('should handle multiple rapid tile movements', () => {
      const puzzleManager = new PuzzleManager();
      puzzleManager.setCurrentLevel(1);

      const tiles = puzzleManager.getTiles();

      for (let i = 0; i < 10; i++) {
        const tile = tiles[i % tiles.length];
        if (tile && tile.state === UnitState.IDLE) {
          puzzleManager.slideTile(tile);
          tile.state = UnitState.IDLE;
          tile.animating = false;
        }
      }

      expect(puzzleManager.history.length).toBeLessThanOrEqual(puzzleManager.maxHistory);
    });

    test('should handle level switching efficiently', () => {
      const levelManager = new LevelManager();
      levelManager.initDefaultLevels();

      levelManager.setCurrentLevel(1);
      levelManager.completeLevel(3, 1500);

      levelManager.setCurrentLevel(2);

      expect(levelManager.getCurrentLevel().id).toBe(2);
    });
  });
});
