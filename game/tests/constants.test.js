const {
  Direction,
  DIRECTION_VECTORS,
  DIRECTION_ANGLES,
  UnitType,
  UnitState,
  GameState,
  LevelType,
  VEGETABLE_DOG_CONFIG,
  WOLF_CONFIG,
  GAME_CONFIG,
  getRandomDirection,
  isNearCenter,
  clamp,
  lerp,
  generateId
} = require('../utils/constants');

describe('Constants', () => {
  describe('Direction', () => {
    test('should have all four directions', () => {
      expect(Direction.LEFT_UP).toBe('left_up');
      expect(Direction.LEFT_DOWN).toBe('left_down');
      expect(Direction.RIGHT_UP).toBe('right_up');
      expect(Direction.RIGHT_DOWN).toBe('right_down');
    });
  });

  describe('DIRECTION_VECTORS', () => {
    test('should have correct vectors for each direction', () => {
      expect(DIRECTION_VECTORS[Direction.LEFT_UP]).toEqual({ x: -1, y: -1 });
      expect(DIRECTION_VECTORS[Direction.LEFT_DOWN]).toEqual({ x: -1, y: 1 });
      expect(DIRECTION_VECTORS[Direction.RIGHT_UP]).toEqual({ x: 1, y: -1 });
      expect(DIRECTION_VECTORS[Direction.RIGHT_DOWN]).toEqual({ x: 1, y: 1 });
    });
  });

  describe('DIRECTION_ANGLES', () => {
    test('should have correct angles for each direction', () => {
      expect(DIRECTION_ANGLES[Direction.LEFT_UP]).toBe(225);
      expect(DIRECTION_ANGLES[Direction.LEFT_DOWN]).toBe(135);
      expect(DIRECTION_ANGLES[Direction.RIGHT_UP]).toBe(315);
      expect(DIRECTION_ANGLES[Direction.RIGHT_DOWN]).toBe(45);
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

  describe('isNearCenter', () => {
    test('should return true for points near center', () => {
      expect(isNearCenter(400, 300, 400, 300, 150)).toBe(true);
      expect(isNearCenter(450, 350, 400, 300, 150)).toBe(true);
    });

    test('should return false for points far from center', () => {
      expect(isNearCenter(600, 500, 400, 300, 150)).toBe(false);
      expect(isNearCenter(100, 100, 400, 300, 150)).toBe(false);
    });
  });

  describe('clamp', () => {
    test('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    test('should linearly interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
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
});
