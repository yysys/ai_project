const { Direction, UnitType, UnitState, TileType, generateId } = require('../game/utils/constants');
const PuzzleManager = require('../game/utils/puzzleManager');

describe('PuzzleManager - Tile Movement and Collision', () => {
  let puzzleManager;
  let gridSize = 14;

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
          gridCol: 5,
          gridRow: 5,
          gridColSpan: 1,
          gridRowSpan: 1,
          direction: Direction.UP
        },
        {
          id: generateId(),
          type: TileType.VERTICAL,
          unitType: UnitType.WOLF,
          gridCol: 10,
          gridRow: 10,
          gridColSpan: 1,
          gridRowSpan: 1,
          direction: Direction.UP
        }
      ]
    };
    
    const { PuzzleLevel } = require('../game/utils/puzzleManager');
    puzzleManager.currentLevel = new PuzzleLevel(levelConfig);
  });

  describe('slideTile - Basic Movement', () => {
    test('should move tile without obstacles', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      const initialCol = tile.gridCol;
      const initialRow = tile.gridRow;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      if (result.moved) {
        expect(tile.state).toBe(UnitState.IDLE);
      }
    });

    test('should move tile until hitting boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.RIGHT;
      tile.gridCol = gridSize - 1;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(gridSize - 1);
    });
  });

  describe('slideTile - Collision Detection', () => {
    test('should stop when colliding with another tile', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.direction = Direction.RIGHT;
      tile2.gridCol = 6;
      tile2.gridRow = 5;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile1.gridCol).toBe(5);
    });

    test('should not move if initial position is blocked', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.gridCol = 6;
      tile2.gridRow = 5;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile1.gridCol).toBe(5);
    });
  });

  describe('slideTile - Boundary Conditions', () => {
    test('should stop at top boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP;
      tile.gridCol = 5;
      tile.gridRow = 2;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.gridRow).toBe(1);
    });

    test('should stop at bottom boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.DOWN;
      tile.gridCol = 5;
      tile.gridRow = gridSize;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile.gridRow).toBe(gridSize);
    });

    test('should stop at left boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.LEFT;
      tile.gridCol = 2;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(1);
    });

    test('should stop at right boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.RIGHT;
      tile.gridCol = gridSize;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile.gridCol).toBe(gridSize);
    });
  });

  describe('slideTile - Diagonal Movement', () => {
    test('should move diagonally without obstacles', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_RIGHT;
      tile.gridCol = 5;
      tile.gridRow = 10;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(9);
    });

    test('should stop when diagonal movement hits obstacle', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.UP_RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.gridCol = 6;
      tile2.gridRow = 4;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile1.gridCol).toBe(5);
      expect(tile1.gridRow).toBe(5);
    });
  });

  describe('slideTile - Multi-Span Tiles', () => {
    test('should handle 2x1 tiles correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridColSpan = 2;
      tile.gridRowSpan = 1;
      tile.direction = Direction.RIGHT;
      tile.gridCol = 3;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBeGreaterThan(3);
    });

    test('should handle 1x2 tiles correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridColSpan = 1;
      tile.gridRowSpan = 2;
      tile.direction = Direction.UP;
      tile.gridCol = 5;
      tile.gridRow = 4;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.gridRow).toBeLessThan(4);
    });

    test('should handle 2x2 tiles correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridColSpan = 2;
      tile.gridRowSpan = 2;
      tile.direction = Direction.UP_RIGHT;
      tile.gridCol = 3;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
    });
  });

  describe('checkCollision', () => {
    test('should detect collision with adjacent tile', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.gridCol = 5;
      tile2.gridRow = 5;

      const hasCollision = puzzleManager.checkCollision(tile1, 5, 5);

      expect(hasCollision).toBe(true);
    });

    test('should detect no collision when far apart', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 2;
      tile1.gridRow = 2;

      tile2.gridCol = 8;
      tile2.gridRow = 8;

      const hasCollision = puzzleManager.checkCollision(tile1, 6, 6);

      expect(hasCollision).toBe(false);
    });

    test('should ignore disappeared tiles in collision check', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 3;
      tile1.gridRow = 3;

      tile2.gridCol = 4;
      tile2.gridRow = 3;
      tile2.state = UnitState.DISAPPEARED;

      const hasCollision = puzzleManager.checkCollision(tile1, 4, 3);

      expect(hasCollision).toBe(false);
    });
  });

  describe('slideTile - State Management', () => {
    test('should not move tile if not in IDLE state', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.RUNNING;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('tile_not_idle');
    });

    test('should maintain IDLE state after successful move', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.IDLE;

      puzzleManager.slideTile(tile);

      expect(tile.state).toBe(UnitState.IDLE);
    });

    test('should maintain IDLE state when no move possible', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.RIGHT;
      tile.gridCol = gridSize;

      puzzleManager.slideTile(tile);

      expect(tile.state).toBe(UnitState.IDLE);
    });
  });

  describe('slideTile - Multiple Tiles Interaction', () => {
    test('should handle chain movement of multiple tiles', () => {
      const tiles = puzzleManager.currentLevel.tiles.slice(0, 2);

      tiles[0].direction = Direction.RIGHT;
      tiles[0].gridCol = 2;
      tiles[0].gridRow = 5;

      tiles[1].direction = Direction.DOWN;
      tiles[1].gridCol = 10;
      tiles[1].gridRow = 2;

      const result1 = puzzleManager.slideTile(tiles[0]);
      const result2 = puzzleManager.slideTile(tiles[1]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.moved).toBe(true);
      expect(result2.moved).toBe(true);
    });

    test('should handle tiles moving towards each other', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.RIGHT;
      tile1.gridCol = 2;
      tile1.gridRow = 5;

      tile2.direction = Direction.LEFT;
      tile2.gridCol = 12;
      tile2.gridRow = 5;

      const result1 = puzzleManager.slideTile(tile1);
      const result2 = puzzleManager.slideTile(tile2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.moved).toBe(true);
      expect(result2.moved).toBe(true);
      expect(tile1.gridCol).toBeLessThan(tile2.gridCol);
    });
  });

  describe('slideTile - Edge Cases', () => {
    test('should handle tile at (1,1) moving UP_LEFT', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 1;
      tile.gridRow = 1;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(1);
      expect(tile.gridRow).toBe(1);
    });

    test('should handle tile at (gridSize,gridSize) moving DOWN_RIGHT', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = gridSize;
      tile.gridRow = gridSize;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(gridSize);
      expect(tile.gridRow).toBe(gridSize);
    });

    test('should handle tile with invalid direction', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = 'INVALID_DIRECTION';

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('invalid_direction');
    });
  });

  describe('slideTile - No Disappearance', () => {
    test('should never set tile to DISAPPEARED state', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.RIGHT;
      tile.gridCol = gridSize - 2;

      const result = puzzleManager.slideTile(tile);

      expect(result.disappeared).toBe(false);
      expect(tile.state).not.toBe(UnitState.DISAPPEARED);
      expect(tile.state).toBe(UnitState.IDLE);
    });

    test('should stop before going out of bounds', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.RIGHT;
      tile.gridCol = gridSize;

      const result = puzzleManager.slideTile(tile);

      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(gridSize);
      expect(tile.state).toBe(UnitState.IDLE);
    });
  });
});
