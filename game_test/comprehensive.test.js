const { Direction, UnitType, UnitState, TileType, generateId } = require('../game/utils/constants');
const PuzzleManager = require('../game/utils/puzzleManager');
const GameEngine = require('../game/utils/gameEngine');

describe('Comprehensive Game Mechanics Test Suite', () => {
  let puzzleManager;
  let gameEngine;
  let gridSize = 14;
  let screenWidth = 375;
  let screenHeight = 667;

  const createMockCanvas = () => ({
    width: screenWidth,
    height: screenHeight,
    getContext: () => ({
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
    })
  });

  const createTestLevel = (tiles) => ({
    id: 1,
    name: 'Test Level',
    type: 'normal',
    unlocked: true,
    tiles: tiles
  });

  beforeEach(() => {
    puzzleManager = new PuzzleManager();
    puzzleManager.gridSize = gridSize;
    
    gameEngine = new GameEngine();
    gameEngine.init(createMockCanvas(), createMockCanvas().getContext(), screenWidth, screenHeight);
    gameEngine.puzzleManager = puzzleManager;
  });

  const createTile = (col, row, colSpan, rowSpan, unitType, direction) => ({
    id: generateId(),
    type: colSpan > 1 ? TileType.HORIZONTAL : (rowSpan > 1 ? TileType.VERTICAL : TileType.SINGLE),
    unitType: unitType,
    gridCol: col,
    gridRow: row,
    gridColSpan: colSpan,
    gridRowSpan: rowSpan,
    direction: direction,
    state: UnitState.IDLE
  });

  describe('Scenario 1: Tile Movement Without Obstacles', () => {
    test('should move tile UP_RIGHT one step without obstacles', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
      expect(tile.state).toBe(UnitState.IDLE);
    });

    test('should move tile UP_LEFT one step without obstacles', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(4);
      expect(tile.gridRow).toBe(4);
    });

    test('should move tile DOWN_RIGHT one step without obstacles', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.DOWN_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(6);
    });

    test('should move tile DOWN_LEFT one step without obstacles', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.DOWN_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(4);
      expect(tile.gridRow).toBe(6);
    });

    test('should move multiple steps in one click without obstacles', () => {
      const tile = createTile(3, 3, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBeGreaterThan(3);
      expect(tile.gridRow).toBeLessThan(3);
    });
  });

  describe('Scenario 2: Tile Movement Stopped by Obstacles', () => {
    test('should stop when another tile blocks the path', () => {
      const tile1 = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const tile2 = createTile(6, 4, 1, 1, UnitType.WOLF, Direction.DOWN_LEFT);
      const levelConfig = createTestLevel([tile1, tile2]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('collision');
      expect(tile1.gridCol).toBe(5);
      expect(tile1.gridRow).toBe(5);
    });

    test('should stop when multi-span tile blocks the path', () => {
      const tile1 = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const tile2 = createTile(6, 3, 2, 2, UnitType.WOLF, Direction.DOWN_LEFT);
      const levelConfig = createTestLevel([tile1, tile2]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('collision');
    });

    test('should stop at obstacle regardless of tile size', () => {
      const tile1 = createTile(5, 5, 2, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const tile2 = createTile(7, 4, 1, 1, UnitType.WOLF, Direction.DOWN_LEFT);
      const levelConfig = createTestLevel([tile1, tile2]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('collision');
    });

    test('should ignore disappeared tiles when checking obstacles', () => {
      const tile1 = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const tile2 = createTile(6, 4, 1, 1, UnitType.WOLF, Direction.DOWN_LEFT);
      tile2.state = UnitState.DISAPPEARED;
      const levelConfig = createTestLevel([tile1, tile2]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile1);

      expect(result.moved).toBe(true);
      expect(tile1.gridCol).toBe(6);
      expect(tile1.gridRow).toBe(4);
    });
  });

  describe('Scenario 3: Tile Disappears at Screen Edge (Diamond Boundary)', () => {
    test('should disappear when moving out of diamond boundary', () => {
      const tile = createTile(2, 2, 1, 1, UnitType.WOLF, Direction.UP_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });

    test('should disappear when hitting grid boundary in UP_RIGHT direction', () => {
      const tile = createTile(13, 2, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });

    test('should disappear when hitting grid boundary in DOWN_LEFT direction', () => {
      const tile = createTile(2, 13, 1, 1, UnitType.WOLF, Direction.DOWN_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });

    test('should disappear when hitting grid boundary in DOWN_RIGHT direction', () => {
      const tile = createTile(13, 13, 1, 1, UnitType.WOLF, Direction.DOWN_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });

    test('multi-span tile should disappear when any part exits diamond', () => {
      const tile = createTile(2, 2, 2, 1, UnitType.WOLF, Direction.UP_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });
  });

  describe('Scenario 4: Dog Tile Disappearance Triggers Win Condition', () => {
    test('should trigger win when dog tile disappears', () => {
      const dogTile = createTile(2, 2, 1, 1, UnitType.DOG, Direction.UP_LEFT);
      const wolfTile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.DOWN_RIGHT);
      const levelConfig = createTestLevel([dogTile, wolfTile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(dogTile);

      expect(result.moved).toBe(true);
      expect(result.disappeared).toBe(true);
      expect(dogTile.state).toBe(UnitState.DISAPPEARED);
      expect(puzzleManager.checkWinCondition()).toBe(true);
    });

    test('should not trigger win when only wolf tiles disappear', () => {
      const dogTile = createTile(7, 7, 1, 1, UnitType.DOG, Direction.UP_RIGHT);
      const wolfTile = createTile(2, 2, 1, 1, UnitType.WOLF, Direction.UP_LEFT);
      const levelConfig = createTestLevel([dogTile, wolfTile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      puzzleManager.slideTile(wolfTile);

      expect(wolfTile.state).toBe(UnitState.DISAPPEARED);
      expect(puzzleManager.checkWinCondition()).toBe(false);
    });
  });

  describe('Scenario 5: Screen Boundary Detection (Mobile Screen Edges)', () => {
    test('should detect mobile screen boundaries for disappearance', () => {
      const sqrt2 = Math.sqrt(2);
      const maxGridWidth = screenWidth / sqrt2;
      const maxGridHeight = screenHeight / sqrt2;
      const tileSize = Math.min(maxGridWidth, maxGridHeight) / gridSize;

      const tile = createTile(13, 13, 1, 1, UnitType.WOLF, Direction.DOWN_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.disappeared).toBe(true);
      expect(tile.state).toBe(UnitState.DISAPPEARED);
    });

    test('should calculate tile screen position correctly', () => {
      const tile = createTile(7, 7, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      puzzleManager.setScreenSize(screenWidth, screenHeight);
      const position = puzzleManager.getTileScreenPosition(tile);

      expect(position).toBeDefined();
      expect(position.x).toBeGreaterThan(0);
      expect(position.x).toBeLessThan(screenWidth);
      expect(position.y).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(screenHeight);
    });
  });

  describe('Scenario 6: Click Detection on Rotated Grid', () => {
    test('should detect tile click on rotated grid', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

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

    test('should return null for clicks on empty space', () => {
      const foundTile = gameEngine.getTileAtPosition(0, 0);
      expect(foundTile).toBeNull();
    });
  });

  describe('Scenario 7: Integration Test - Full Click to Move Flow', () => {
    test('should handle complete click-to-move workflow', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

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
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
    });
  });

  describe('Scenario 8: Multi-Span Tiles Movement', () => {
    test('should correctly move 2x1 horizontal tile', () => {
      const tile = createTile(5, 5, 2, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
    });

    test('should correctly move 1x2 vertical tile', () => {
      const tile = createTile(5, 5, 1, 2, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
    });

    test('should correctly move 2x2 tile', () => {
      const tile = createTile(5, 5, 2, 2, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(true);
      expect(tile.gridCol).toBe(6);
      expect(tile.gridRow).toBe(4);
    });
  });

  describe('Scenario 9: Edge Cases', () => {
    test('should not move tile at (1,1) moving UP_LEFT', () => {
      const tile = createTile(1, 1, 1, 1, UnitType.WOLF, Direction.UP_LEFT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.disappeared).toBe(false);
      expect(tile.gridCol).toBe(1);
      expect(tile.gridRow).toBe(1);
    });

    test('should handle tile with invalid direction', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, 'INVALID_DIRECTION');
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('invalid_direction');
    });

    test('should not move tile when not in IDLE state', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      tile.state = UnitState.RUNNING;
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result = puzzleManager.slideTile(tile);

      expect(result.moved).toBe(false);
      expect(result.reason).toBe('tile_not_idle');
    });
  });

  describe('Scenario 10: Sequential Movement', () => {
    test('should allow multiple sequential moves of same tile', () => {
      const tile = createTile(5, 5, 1, 1, UnitType.WOLF, Direction.UP_RIGHT);
      const levelConfig = createTestLevel([tile]);
      puzzleManager.currentLevel = new PuzzleManager.PuzzleLevel(levelConfig);

      const result1 = puzzleManager.slideTile(tile);
      expect(result1.moved).toBe(true);

      const result2 = puzzleManager.slideTile(tile);
      expect(result2.moved).toBe(true);

      const result3 = puzzleManager.slideTile(tile);
      expect(result3.moved).toBe(true);

      expect(tile.gridCol).toBeGreaterThan(5);
      expect(tile.gridRow).toBeLessThan(5);
    });
  });
});
