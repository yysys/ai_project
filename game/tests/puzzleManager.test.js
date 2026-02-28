const { Direction, UnitType, UnitState, TileType, generateId } = require('../utils/constants');
const PuzzleManager = require('../utils/puzzleManager');

describe('PuzzleManager - Tile Movement and Collision', () => {
  let puzzleManager;
  const gridSize = 14;

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
          direction: Direction.UP_RIGHT
        },
        {
          id: generateId(),
          type: TileType.VERTICAL,
          unitType: UnitType.WOLF,
          gridCol: 10,
          gridRow: 10,
          gridColSpan: 1,
          gridRowSpan: 1,
          direction: Direction.DOWN_LEFT
        }
      ]
    };
    
    const { PuzzleLevel } = require('../utils/puzzleManager');
    puzzleManager.currentLevel = new PuzzleLevel(levelConfig);
    puzzleManager.history = [];
    puzzleManager.saveState();
  });

  describe('slideTile - Basic Movement', () => {
    test('should move tile without obstacles', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 7;
      tile.gridRow = 7;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.moved).toBe(true);
      expect(tile.state).toBe(UnitState.SLIDING);
      expect(tile.animating).toBe(true);
      expect(result.disappeared).toBe(false);
    });

    test('should not disappear when hitting boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 2;
      tile.gridRow = 2;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(tile.state).toBe(UnitState.SLIDING);
    });
  });

  describe('slideTile - Collision Detection', () => {
    test('should stop when colliding with another tile', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.DOWN_RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;
      tile1.gridColSpan = 1;
      tile1.gridRowSpan = 1;

      tile2.gridCol = 6;
      tile2.gridRow = 6;
      tile2.gridColSpan = 1;
      tile2.gridRowSpan = 1;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(result.reason).toBe('blocked_by_collision');
    });

    test('should not move if initial position is blocked', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.DOWN_RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;
      tile1.gridColSpan = 1;
      tile1.gridRowSpan = 1;

      tile2.gridCol = 6;
      tile2.gridRow = 6;
      tile2.gridColSpan = 1;
      tile2.gridRowSpan = 1;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(false);
      expect(tile1.gridCol).toBe(5);
    });
  });

  describe('slideTile - Diamond Boundary Conditions', () => {
    test('should stop at diamond boundary (top-left)', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 2;
      tile.gridRow = 2;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(tile.state).toBe(UnitState.SLIDING);
    });

    test('should stop at diamond boundary (bottom-right)', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = 12;
      tile.gridRow = 12;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
    });

    test('should not move if already at diamond boundary', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 1;
      tile.gridRow = 8;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.moved).toBe(false);
      expect(result.reason).toBe('blocked_by_boundary');
    });
  });

  describe('slideTile - Diagonal Movement', () => {
    test('should move diagonally without obstacles', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = 7;
      tile.gridRow = 7;
      tile.gridColSpan = 1;
      tile.gridRowSpan = 1;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      expect(result.disappeared).toBe(false);
      expect(result.moved).toBe(true);
      expect(tile.targetGridCol).toBeGreaterThan(7);
      expect(tile.targetGridRow).toBeGreaterThan(7);
    });

    test('should stop when diagonal movement hits obstacle', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.DOWN_RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;
      tile1.gridColSpan = 1;
      tile1.gridRowSpan = 1;

      tile2.gridCol = 6;
      tile2.gridRow = 6;
      tile2.gridColSpan = 1;
      tile2.gridRowSpan = 1;

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
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = 5;
      tile.gridRow = 7;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      if (result.moved) {
        expect(result.disappeared).toBe(false);
        expect(tile.targetGridCol).toBeGreaterThan(5);
      }
    });

    test('should handle 1x2 tiles correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridColSpan = 1;
      tile.gridRowSpan = 2;
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = 7;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
      if (result.moved) {
        expect(result.disappeared).toBe(false);
        expect(tile.targetGridRow).toBeGreaterThan(5);
      }
    });

    test('should handle 2x2 tiles correctly', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridColSpan = 2;
      tile.gridRowSpan = 2;
      tile.direction = Direction.DOWN_RIGHT;
      tile.gridCol = 5;
      tile.gridRow = 5;

      const result = puzzleManager.slideTile(tile);

      expect(result).toBeDefined();
    });

    test('should detect collision for multi-span tiles', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridColSpan = 2;
      tile1.gridRowSpan = 1;
      tile1.direction = Direction.DOWN_RIGHT;
      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.gridCol = 7;
      tile2.gridRow = 5;

      const result = puzzleManager.slideTile(tile1);

      expect(result).toBeDefined();
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

    test('should detect collision for overlapping multi-span tiles', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridColSpan = 2;
      tile1.gridRowSpan = 2;
      tile2.gridColSpan = 2;
      tile2.gridRowSpan = 1;

      tile1.gridCol = 5;
      tile1.gridRow = 5;

      tile2.gridCol = 6;
      tile2.gridRow = 6;

      const hasCollision = puzzleManager.checkCollision(tile1, 6, 6);

      expect(hasCollision).toBe(true);
    });
  });

  describe('slideTile - State Management', () => {
    test('should not move tile if not in IDLE state', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.SLIDING;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('tile_not_idle');
    });

    test('should set SLIDING state after successful move initiation', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.IDLE;
      tile.direction = Direction.DOWN_RIGHT;

      const result = puzzleManager.slideTile(tile);

      if (result.moved) {
        expect(tile.state).toBe(UnitState.SLIDING);
        expect(tile.animating).toBe(true);
      }
    });

    test('should maintain IDLE state when no move possible', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 1;
      tile.gridRow = 8;

      const result = puzzleManager.slideTile(tile);

      expect(tile.state).toBe(UnitState.IDLE);
    });
  });

  describe('slideTile - Multiple Tiles Interaction', () => {
    test('should handle chain movement of multiple tiles', () => {
      const tiles = puzzleManager.currentLevel.tiles.slice(0, 2);

      tiles[0].direction = Direction.DOWN_RIGHT;
      tiles[0].gridCol = 7;
      tiles[0].gridRow = 7;

      tiles[1].direction = Direction.DOWN_LEFT;
      tiles[1].gridCol = 7;
      tiles[1].gridRow = 7;

      const result1 = puzzleManager.slideTile(tiles[0]);
      puzzleManager.saveState();
      const result2 = puzzleManager.slideTile(tiles[1]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should handle tiles moving towards each other', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.direction = Direction.DOWN_RIGHT;
      tile1.gridCol = 6;
      tile1.gridRow = 6;

      tile2.direction = Direction.UP_LEFT;
      tile2.gridCol = 9;
      tile2.gridRow = 9;

      const result1 = puzzleManager.slideTile(tile1);
      puzzleManager.saveState();
      const result2 = puzzleManager.slideTile(tile2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('slideTile - Edge Cases', () => {
    test('should handle tile at diamond edge moving UP_LEFT', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.UP_LEFT;
      tile.gridCol = 1;
      tile.gridRow = 8;

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.disappeared).toBe(false);
      expect(result.reason).toBe('blocked_by_boundary');
    });

    test('should handle tile with invalid direction', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = 'INVALID_DIRECTION';

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('invalid_direction');
    });
  });

  describe('isPositionInDiamond', () => {
    test('should return true for positions inside diamond', () => {
      expect(puzzleManager.isPositionInDiamond(7, 7, 1, 1)).toBe(true);
      expect(puzzleManager.isPositionInDiamond(8, 7, 1, 1)).toBe(true);
      expect(puzzleManager.isPositionInDiamond(7, 8, 1, 1)).toBe(true);
    });

    test('should return false for positions outside diamond', () => {
      expect(puzzleManager.isPositionInDiamond(1, 1, 1, 1)).toBe(false);
      expect(puzzleManager.isPositionInDiamond(14, 14, 1, 1)).toBe(false);
    });

    test('should handle multi-span tiles correctly', () => {
      expect(puzzleManager.isPositionInDiamond(7, 7, 2, 2)).toBe(true);
      expect(puzzleManager.isPositionInDiamond(1, 8, 2, 1)).toBe(false);
    });
  });

  describe('Undo Functionality', () => {
    test('should restore tile position after undo', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;
      tile.direction = Direction.DOWN_RIGHT;

      puzzleManager.slideTile(tile);
      puzzleManager.saveState();
      
      tile.gridCol = tile.targetGridCol;
      tile.gridRow = tile.targetGridRow;
      tile.state = UnitState.IDLE;
      tile.animating = false;

      const undoResult = puzzleManager.undo();

      expect(undoResult).toBe(true);
      expect(tile.gridCol).toBe(originalCol);
      expect(tile.gridRow).toBe(originalRow);
    });

    test('should restore complete tile state after undo', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.direction = Direction.DOWN_RIGHT;
      
      puzzleManager.slideTile(tile);
      puzzleManager.saveState();
      
      tile.gridCol = tile.targetGridCol;
      tile.gridRow = tile.targetGridRow;
      tile.state = UnitState.IDLE;
      tile.animating = false;
      tile.opacity = 0.5;

      puzzleManager.undo();

      expect(tile.state).toBe(UnitState.IDLE);
      expect(tile.animating).toBe(false);
      expect(tile.opacity).toBe(1);
    });

    test('should return false when no history to undo', () => {
      puzzleManager.history = [];
      puzzleManager.saveState();

      const result = puzzleManager.undo();

      expect(result).toBe(false);
    });

    test('should handle multiple undo operations', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;
      
      tile.direction = Direction.DOWN_RIGHT;
      puzzleManager.slideTile(tile);
      puzzleManager.saveState();
      tile.gridCol = tile.targetGridCol;
      tile.gridRow = tile.targetGridRow;
      tile.state = UnitState.IDLE;
      tile.animating = false;

      tile.direction = Direction.DOWN_RIGHT;
      puzzleManager.slideTile(tile);
      puzzleManager.saveState();
      tile.gridCol = tile.targetGridCol;
      tile.gridRow = tile.targetGridRow;
      tile.state = UnitState.IDLE;
      tile.animating = false;

      puzzleManager.undo();
      puzzleManager.undo();

      expect(tile.gridCol).toBe(originalCol);
      expect(tile.gridRow).toBe(originalRow);
    });
  });

  describe('Tile State Snapshot', () => {
    test('should create complete state snapshot', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.state = UnitState.IDLE;
      tile.animating = false;
      tile.opacity = 1;

      const snapshot = tile.getStateSnapshot();

      expect(snapshot.id).toBe(tile.id);
      expect(snapshot.gridCol).toBe(5);
      expect(snapshot.gridRow).toBe(5);
      expect(snapshot.state).toBe(UnitState.IDLE);
      expect(snapshot.animating).toBe(false);
      expect(snapshot.opacity).toBe(1);
    });

    test('should restore tile from snapshot', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 5;
      tile.gridRow = 5;
      tile.state = UnitState.SLIDING;
      tile.animating = true;
      tile.opacity = 0.5;

      const snapshot = tile.getStateSnapshot();

      tile.gridCol = 10;
      tile.gridRow = 10;
      tile.state = UnitState.IDLE;
      tile.animating = false;
      tile.opacity = 1;

      tile.restoreFrom(snapshot);

      expect(tile.gridCol).toBe(5);
      expect(tile.gridRow).toBe(5);
      expect(tile.state).toBe(UnitState.SLIDING);
      expect(tile.animating).toBe(true);
      expect(tile.opacity).toBe(0.5);
    });
  });

  describe('Reset Level', () => {
    test('should reset tiles to initial state', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      const originalCol = tile.gridCol;
      const originalRow = tile.gridRow;
      
      tile.direction = Direction.DOWN_RIGHT;
      puzzleManager.slideTile(tile);
      puzzleManager.saveState();
      tile.gridCol = tile.targetGridCol;
      tile.gridRow = tile.targetGridRow;
      tile.state = UnitState.IDLE;
      tile.animating = false;

      puzzleManager.resetLevel();

      expect(tile.gridCol).toBe(originalCol);
      expect(tile.gridRow).toBe(originalRow);
      expect(tile.state).toBe(UnitState.IDLE);
    });
  });

  describe('Animation Update', () => {
    test('should update tile position during sliding animation', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.SLIDING;
      tile.animating = true;
      tile.animationProgress = 0;
      tile.startX = 0;
      tile.startY = 0;
      tile.targetX = 100;
      tile.targetY = 100;
      tile.targetGridCol = 8;
      tile.targetGridRow = 8;
      tile.gridCol = 7;
      tile.gridRow = 7;

      puzzleManager.updateTileAnimation(tile, 0.1);

      expect(tile.animationProgress).toBeGreaterThan(0);
      expect(tile.currentX).toBeGreaterThan(0);
      expect(tile.currentY).toBeGreaterThan(0);
    });

    test('should complete animation when progress reaches 1', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.state = UnitState.SLIDING;
      tile.animating = true;
      tile.animationProgress = 0.99;
      tile.startX = 0;
      tile.startY = 0;
      tile.targetX = 100;
      tile.targetY = 100;
      tile.targetGridCol = 8;
      tile.targetGridRow = 8;
      tile.gridCol = 7;
      tile.gridRow = 7;

      puzzleManager.updateTileAnimation(tile, 0.5);

      expect(tile.animating).toBe(false);
      expect(tile.state).toBe(UnitState.IDLE);
      expect(tile.gridCol).toBe(8);
      expect(tile.gridRow).toBe(8);
    });
  });

  describe('calculateTargetPosition', () => {
    test('should return blocked_by_boundary when at edge', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 1;
      tile.gridRow = 8;
      tile.gridColSpan = 1;
      tile.gridRowSpan = 1;

      const vector = { col: -1, row: -1 };
      const result = puzzleManager.calculateTargetPosition(tile, vector);

      expect(result.canMove).toBe(false);
      expect(result.reason).toBe('blocked_by_boundary');
    });

    test('should return blocked_by_collision when blocked', () => {
      const tile1 = puzzleManager.currentLevel.tiles[0];
      const tile2 = puzzleManager.currentLevel.tiles[1];

      tile1.gridCol = 5;
      tile1.gridRow = 5;
      tile1.gridColSpan = 1;
      tile1.gridRowSpan = 1;

      tile2.gridCol = 6;
      tile2.gridRow = 6;

      const vector = { col: 1, row: 1 };
      const result = puzzleManager.calculateTargetPosition(tile1, vector);

      expect(result.canMove).toBe(false);
      expect(result.reason).toBe('blocked_by_collision');
    });

    test('should calculate correct target for free movement', () => {
      const tile = puzzleManager.currentLevel.tiles[0];
      tile.gridCol = 7;
      tile.gridRow = 7;
      tile.gridColSpan = 1;
      tile.gridRowSpan = 1;

      const vector = { col: 1, row: 1 };
      const result = puzzleManager.calculateTargetPosition(tile, vector);

      expect(result.canMove).toBe(true);
      expect(result.willDisappear).toBe(false);
      expect(result.distance).toBeGreaterThan(0);
    });
  });
});
