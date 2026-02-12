const { Direction, UnitType, UnitState, TileType, generateId } = require('../game/utils/constants');
const PuzzleManager = require('../game/utils/puzzleManager');
const GameEngine = require('../game/utils/gameEngine');

describe('Grid Cell Click Movement - Comprehensive Test Suite', () => {
  let puzzleManager;
  let gameEngine;
  let gridSize = 14;
  let screenWidth = 800;
  let screenHeight = 800;

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.gridSize = gridSize;
    
    const levelConfig = {
      id: 1,
      name: 'Test Level',
      type: 'normal',
      unlocked: true,
      tiles: [
        {
          id: generateId(),
          type: TileType.VERTICAL,
          unitType: UnitType.WOLF,
          gridCol: 7,
          gridRow: 7,
          gridColSpan: 1,
          gridRowSpan: 1,
          direction: Direction.UP_RIGHT
        },
        {
          id: generateId(),
          type: TileType.HORIZONTAL,
          unitType: UnitType.WOLF,
          gridCol: 5,
          gridRow: 5,
          gridColSpan: 2,
          gridRowSpan: 1,
          direction: Direction.DOWN_RIGHT
        },
        {
          id: generateId(),
          type: TileType.VERTICAL,
          unitType: UnitType.WOLF,
          gridCol: 9,
          gridRow: 9,
          gridColSpan: 1,
          gridRowSpan: 2,
          direction: Direction.UP_LEFT
        }
      ]
    };
    
    const { PuzzleLevel } = require('../game/utils/puzzleManager');
    puzzleManager.currentLevel = new PuzzleLevel(levelConfig);
    
    gameEngine = new GameEngine();
    gameEngine.init({
      width: screenWidth,
      height: screenHeight
    }, {
      clearRect: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      font: '',
      textAlign: '',
      textBaseline: ''
    }, screenWidth, screenHeight);
    
    gameEngine.puzzleManager = puzzleManager;
  });

  describe('Test 1: Click on unobstructed outer grid cell', () => {
    test('should move tile when clicking on unobstructed outer cell', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 2;
      tile.gridRow = 2;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(3);
      expect(tile.gridRow).toBe(1);
    });

    test('should move tile multiple steps when clicking', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 3;
      tile.gridRow = 3;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBeGreaterThan(3);
      expect(tile.gridRow).toBeLessThan(3);
    });
  });

  describe('Test 2: Click on grid cells blocked by obstacles', () => {
    test('should prevent movement when obstacle exists', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 4;
      tile1.gridRow = 4;
      tile1.direction = Direction.DOWN_RIGHT;

      tile2.gridCol = 5;
      tile2.gridRow = 5;

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('collision');
      expect(tile1.gridCol).toBe(4);
      expect(tile1.gridRow).toBe(4);
    });

    test('should detect collision correctly with multi-span tiles', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 5;
      tile1.gridRow = 4;
      tile1.direction = Direction.DOWN_RIGHT;

      tile2.gridCol = 5;
      tile2.gridRow = 5;
      tile2.gridColSpan = 2;

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('collision');
    });
  });

  describe('Test 3: Click on grid cells at extreme edges', () => {
    test('should handle top-left corner tile correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 1;
      tile.gridRow = 1;
      tile.direction = Direction.UP_LEFT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(tile.gridCol).toBe(1);
      expect(tile.gridRow).toBe(1);
    });

    test('should handle top-right corner tile correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = gridSize;
      tile.gridRow = 1;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(tile.gridCol).toBe(gridSize);
      expect(tile.gridRow).toBe(1);
    });

    test('should handle bottom-left corner tile correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 1;
      tile.gridRow = gridSize;
      tile.direction = Direction.DOWN_LEFT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(tile.gridCol).toBe(1);
      expect(tile.gridRow).toBe(gridSize);
    });

    test('should handle bottom-right corner tile correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = gridSize;
      tile.gridRow = gridSize;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
      expect(tile.gridCol).toBe(gridSize);
      expect(tile.gridRow).toBe(gridSize);
    });
  });

  describe('Test 4: Click on grid cells adjacent to current position', () => {
    test('should move to adjacent cell without obstacles', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
    });

    test('should move to all four diagonal directions', () => {
      const directions = [
        Direction.UP_RIGHT,
        Direction.UP_LEFT,
        Direction.DOWN_RIGHT,
        Direction.DOWN_LEFT
      ];

      directions.forEach(dir => {
        const tile = puzzleManager.currentLevel.tiles[0];
        tile.gridCol = 5;
        tile.gridRow = 5;
        tile.direction = dir;

        const result = puzzleManager.slideTile(tile);
        const vector = { col: 1, row: -1 };
        
        if (dir === Direction.UP_LEFT) vector.col = -1;
        if (dir === Direction.DOWN_RIGHT) vector.row = 1;
        if (dir === Direction.DOWN_LEFT) { vector.col = -1; vector.row = 1; }

        expect(result.moved).toBe(true);
        expect(tile.gridCol).toBe(5 + vector.col);
        expect(tile.gridRow).toBe(5 + vector.row);
      });
    });
  });

  describe('Test 5: Click on grid cells multiple steps away', () => {
    test('should move multiple steps in one click', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 3;
      tile.gridRow = 3;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBeGreaterThan(3);
      expect(tile.gridRow).toBeGreaterThan(3);
    });

    test('should stop before reaching boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = gridSize - 1;
      tile.gridRow = gridSize - 1;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBeLessThanOrEqual(gridSize);
      expect(tile.gridRow).toBeLessThanOrEqual(gridSize);
    });
  });

  describe('Test 6: Click on currently occupied grid cell', () => {
    test('should not move when clicking on occupied cell', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.direction = Direction.UP_RIGHT;

      const result1 = puzzleManager.slideTile(tile);
      expect(result1.moved).toBe(true);

      const initialCol = tile.gridCol;
      const initialRow = tile.gridRow;

      const result2 = puzzleManager.slideTile(tile);

      expect(result2.moved).toBe(true);
      expect(tile.gridCol).toBeGreaterThan(initialCol);
      expect(tile.gridRow).toBeLessThan(initialRow);
    });
  });

  describe('Test 7: Click on grid cells outside valid boundaries', () => {
    test('should prevent movement when next position is out of bounds', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = gridSize;
      tile.gridRow = 5;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
    });

    test('should handle negative grid positions', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 1;
      tile.gridRow = 5;
      tile.direction = Direction.UP_LEFT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
    });
  });

  describe('getTileAtPosition - Click Detection', () => {
    test('should detect tile at correct screen position', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;

      const sqrt2 = Math.sqrt(2);
      const maxGridWidth = screenWidth / sqrt2;
      const maxGridHeight = screenHeight / sqrt2;
      const tileSize = Math.min(maxGridWidth, maxGridHeight) / gridSize;
      const gridWidth = tileSize * gridSize;
      const gridHeight = tileSize * gridSize;
      const offsetX = (screenWidth - gridWidth) / 2;
      const offsetY = (screenHeight - gridHeight) / 2;

      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      const tileLocalX = offsetX + (tile.gridCol - 1) * tileSize;
      const tileLocalY = offsetY + (tile.gridRow - 1) * tileSize;

      const angle = 45 * Math.PI / 180;
      const tileScreenX = (tileLocalX - centerX) * Math.cos(angle) - (tileLocalY - centerY) * Math.sin(angle) + centerX;
      const tileScreenY = (tileLocalX - centerX) * Math.sin(angle) + (tileLocalY - centerY) * Math.cos(angle) + centerY;

      const foundTile = gameEngine.getTileAtPosition(tileScreenX + tileSize / 2, tileScreenY + tileSize / 2);

      expect(foundTile).toBeDefined();
      expect(foundTile.id).toBe(tile.id);
    });

    test('should return null when clicking on empty space', () => {
      const foundTile = gameEngine.getTileAtPosition(0, 0);

      expect(foundTile).toBeNull();
    });
  });

  describe('handleClick - Integration Test', () => {
    test('should process click and move tile correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;

      const sqrt2 = Math.sqrt(2);
      const maxGridWidth = screenWidth / sqrt2;
      const maxGridHeight = screenHeight / sqrt2;
      const tileSize = Math.min(maxGridWidth, maxGridHeight) / gridSize;
      const gridWidth = tileSize * gridSize;
      const gridHeight = tileSize * gridSize;
      const offsetX = (screenWidth - gridWidth) / 2;
      const offsetY = (screenHeight - gridHeight) / 2;

      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      const tileLocalX = offsetX + (tile.gridCol - 1) * tileSize;
      const tileLocalY = offsetY + (tile.gridRow - 1) * tileSize;

      const angle = 45 * Math.PI / 180;
      const tileScreenX = (tileLocalX - centerX) * Math.cos(angle) - (tileLocalY - centerY) * Math.sin(angle) + centerX;
      const tileScreenY = (tileLocalX - centerX) * Math.sin(angle) + (tileLocalY - centerY) * Math.cos(angle) + centerY;

      gameEngine.gameState = 'playing';

      const result = gameEngine.handleClick(tileScreenX + tileSize / 2, tileScreenY + tileSize / 2);

      expect(result).toBe(true);
    });
  });

  describe('State Management After Movement', () => {
    test('should maintain IDLE state after successful movement', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.IDLE;

      puzzleManager.slideTile(tile);

      expect(tile.state).toBe(UnitState.IDLE);
    });

    test('should not allow movement when not in IDLE state', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.SLIDING;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('tile_not_idle');
    });
  });

  describe('Multi-Span Tiles Movement', () => {
    test('should correctly move 2x1 horizontal tiles', () => {
      const tile = puzzleManager.currentLevel.tiles[1];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.gridColSpan = 2;
      tile.gridRowSpan = 1;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBeGreaterThan(5);
    });

    test('should correctly move 1x2 vertical tiles', () => {
      const tile = puzzleManager.currentLevel.tiles[2];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.gridColSpan = 1;
      tile.gridRowSpan = 2;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridRow).toBeGreaterThan(5);
    });
  });

  describe('Boundary Checking Logic', () => {
    test('should correctly check boundary for multi-span tiles', () => {
      const tile = puzzleManager.currentLevel.tiles[1];
      tile.gridCol = gridSize - 1;
      tile.gridRow = 5;
      tile.gridColSpan = 2;
      tile.gridRowSpan = 1;
      tile.direction = Direction.UP_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('out_of_bounds');
    });
  });

  describe('Collision Detection Edge Cases', () => {
    test('should detect partial overlap', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 4;
      tile1.gridRow = 5;
      tile1.direction = Direction.RIGHT;

      tile2.gridCol = 5;
      tile2.gridRow = 5;
      tile2.gridColSpan = 2;

      const hasCollision = puzzleManager.checkCollision(tile1, 5, 5);

      expect(hasCollision).toBe(true);
    });

    test('should ignore disappeared tiles in collision check', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile2.gridCol = 5;
      tile2.gridRow = 5;
      tile2.state = UnitState.DISAPPEARED;

      const hasCollision = puzzleManager.checkCollision(tile1, 5, 5);

      expect(hasCollision).toBe(false);
    });
  });
});
