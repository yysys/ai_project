const { Unit, VegetableDog, Wolf } = require('../utils/unit');
const {
  Direction,
  UnitType,
  UnitState,
  VEGETABLE_DOG_CONFIG,
  WOLF_CONFIG,
  DIRECTION_VECTORS
} = require('../utils/constants');

describe('Unit', () => {
  let unit;

  beforeEach(() => {
    unit = new Unit({
      id: 'test_unit',
      type: UnitType.WOLF,
      x: 100,
      y: 100,
      size: 60,
      direction: Direction.RIGHT_UP,
      speed: 120
    });
  });

  describe('constructor', () => {
    test('should create unit with correct properties', () => {
      expect(unit.id).toBe('test_unit');
      expect(unit.type).toBe(UnitType.WOLF);
      expect(unit.x).toBe(100);
      expect(unit.y).toBe(100);
      expect(unit.size).toBe(60);
      expect(unit.direction).toBe(Direction.RIGHT_UP);
      expect(unit.speed).toBe(120);
      expect(unit.state).toBe(UnitState.IDLE);
      expect(unit.isRunning).toBe(false);
      expect(unit.isDisappeared).toBe(false);
    });
  });

  describe('startRunning', () => {
    test('should start running and update state', () => {
      unit.startRunning();
      expect(unit.isRunning).toBe(true);
      expect(unit.state).toBe(UnitState.RUNNING);
      expect(unit.scale).toBe(1.2);
    });

    test('should not start running if already disappeared', () => {
      unit.state = UnitState.DISAPPEARED;
      unit.startRunning();
      expect(unit.isRunning).toBe(false);
    });
  });

  describe('stopRunning', () => {
    test('should stop running', () => {
      unit.isRunning = true;
      unit.stopRunning();
      expect(unit.isRunning).toBe(false);
    });
  });

  describe('disappear', () => {
    test('should mark unit as disappeared', () => {
      unit.disappear();
      expect(unit.isDisappeared).toBe(true);
      expect(unit.isRunning).toBe(false);
      expect(unit.state).toBe(UnitState.DISAPPEARED);
      expect(unit.scale).toBe(1.3);
      expect(unit.opacity).toBe(0);
    });
  });

  describe('reset', () => {
    test('should reset unit to initial state', () => {
      unit.isRunning = true;
      unit.isDisappeared = true;
      unit.state = UnitState.DISAPPEARED;
      unit.scale = 1.5;
      unit.opacity = 0.5;
      unit.trail = [{ x: 1, y: 1 }];

      unit.reset();

      expect(unit.isRunning).toBe(false);
      expect(unit.isDisappeared).toBe(false);
      expect(unit.state).toBe(UnitState.IDLE);
      expect(unit.scale).toBe(1);
      expect(unit.opacity).toBe(1);
      expect(unit.trail).toEqual([]);
    });
  });

  describe('update', () => {
    test('should update position when running', () => {
      unit.isRunning = true;
      unit.update(0.5);
      
      expect(unit.x).toBeGreaterThan(100);
      expect(unit.y).toBeLessThan(100);
    });

    test('should not update position when not running', () => {
      unit.isRunning = false;
      const originalX = unit.x;
      const originalY = unit.y;
      
      unit.update(0.5);
      
      expect(unit.x).toBe(originalX);
      expect(unit.y).toBe(originalY);
    });

    test('should not update position when disappeared', () => {
      unit.isRunning = true;
      unit.isDisappeared = true;
      const originalX = unit.x;
      const originalY = unit.y;
      
      unit.update(0.5);
      
      expect(unit.x).toBe(originalX);
      expect(unit.y).toBe(originalY);
    });

    test('should maintain trail with limited length', () => {
      unit.isRunning = true;
      for (let i = 0; i < 35; i++) {
        unit.update(0.1);
      }
      
      expect(unit.trail.length).toBeLessThanOrEqual(30);
    });
  });

  describe('isOutOfBounds', () => {
    test('should return true when unit is out of bounds', () => {
      unit.x = -100;
      expect(unit.isOutOfBounds(400, 300)).toBe(true);
      
      unit.x = 500;
      expect(unit.isOutOfBounds(400, 300)).toBe(true);
      
      unit.x = 200;
      unit.y = -100;
      expect(unit.isOutOfBounds(400, 300)).toBe(true);
      
      unit.y = 400;
      expect(unit.isOutOfBounds(400, 300)).toBe(true);
    });

    test('should return false when unit is in bounds', () => {
      unit.x = 200;
      unit.y = 150;
      expect(unit.isOutOfBounds(400, 300)).toBe(false);
    });
  });
});

describe('VegetableDog', () => {
  let dog;

  beforeEach(() => {
    dog = new VegetableDog({
      x: 200,
      y: 150,
      direction: Direction.RIGHT_UP
    });
  });

  test('should create vegetable dog with correct properties', () => {
    expect(dog.type).toBe(UnitType.VEGETABLE_DOG);
    expect(dog.size).toBe(VEGETABLE_DOG_CONFIG.size);
    expect(dog.speed).toBe(VEGETABLE_DOG_CONFIG.speed);
  });
});

describe('Wolf', () => {
  let wolf;

  beforeEach(() => {
    wolf = new Wolf({
      x: 100,
      y: 100,
      direction: Direction.LEFT_DOWN
    });
  });

  test('should create wolf with correct properties', () => {
    expect(wolf.type).toBe(UnitType.WOLF);
    expect(wolf.size).toBe(WOLF_CONFIG.size);
    expect(wolf.speed).toBe(WOLF_CONFIG.speed);
  });
});
