const {
  Direction,
  DIRECTION_VECTORS,
  UnitType,
  UnitState,
  GameState,
  LevelType,
  TILE_CONFIG,
  GAME_CONFIG,
  getRandomDirection,
  generateId
} = require('../game/utils/constants');

describe('Constants', () => {
  describe('Direction', () => {
    test('should have all four directions', () => {
      expect(Direction.UP_LEFT).toBe('up_left');
      expect(Direction.UP_RIGHT).toBe('up_right');
      expect(Direction.DOWN_LEFT).toBe('down_left');
      expect(Direction.DOWN_RIGHT).toBe('down_right');
    });
  });

  describe('DIRECTION_VECTORS', () => {
    test('should have correct vectors for each direction', () => {
      expect(DIRECTION_VECTORS[Direction.UP_LEFT]).toEqual({ col: -1, row: -1, angle: 225 });
      expect(DIRECTION_VECTORS[Direction.UP_RIGHT]).toEqual({ col: 1, row: -1, angle: 315 });
      expect(DIRECTION_VECTORS[Direction.DOWN_LEFT]).toEqual({ col: -1, row: 1, angle: 135 });
      expect(DIRECTION_VECTORS[Direction.DOWN_RIGHT]).toEqual({ col: 1, row: 1, angle: 45 });
    });
  });

  describe('getRandomDirection', () => {
    test('should return a valid direction', () => {
      const direction = getRandomDirection();
      expect(Object.values(Direction)).toContain(direction);
    });

    test('should eventually return all directions over multiple calls', () => {
      const directions = new Set();
      for (let i = 0; i < 100; i++) {
        directions.add(getRandomDirection());
      }
      expect(directions.size).toBe(4);
    });
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('TILE_CONFIG', () => {
    test('should have valid configuration', () => {
      expect(TILE_CONFIG.gridSize).toBe(14);
      expect(TILE_CONFIG.baseSize).toBe(18);
      expect(TILE_CONFIG.rotation).toBe(45);
    });
  });

  describe('GAME_CONFIG', () => {
    test('should have valid configuration', () => {
      expect(GAME_CONFIG.GRID_SIZE).toBe(14);
      expect(GAME_CONFIG.TARGET_FPS).toBe(60);
      expect(GAME_CONFIG.BOARD_ROTATION).toBe(45);
    });
  });
});
