const UnitManager = require('../utils/unitManager');
const { Direction, UnitType, UnitState, DIRECTION_VECTORS } = require('../utils/constants');

describe('UnitManager', () => {
  let unitManager;

  beforeEach(() => {
    unitManager = new UnitManager();
    unitManager.setScreenSize(400, 300);
  });

  describe('setScreenSize', () => {
    test('should set screen dimensions', () => {
      unitManager.setScreenSize(800, 600);
      expect(unitManager.screenWidth).toBe(800);
      expect(unitManager.screenHeight).toBe(600);
    });
  });

  describe('createVegetableDog', () => {
    test('should create vegetable dog at center', () => {
      const dog = unitManager.createVegetableDog();
      
      expect(dog).toBeDefined();
      expect(dog.type).toBe(UnitType.VEGETABLE_DOG);
      expect(dog.x).toBe(200);
      expect(dog.y).toBe(150);
      expect(unitManager.dog).toBe(dog);
      expect(unitManager.units).toContain(dog);
    });
  });

  describe('createWolf', () => {
    test('should create wolf not near center', () => {
      const wolf = unitManager.createWolf();
      
      expect(wolf).toBeDefined();
      expect(wolf.type).toBe(UnitType.WOLF);
      expect(unitManager.wolves).toContain(wolf);
      expect(unitManager.units).toContain(wolf);
    });

    test('should create multiple wolves', () => {
      unitManager.createWolves(5);
      
      expect(unitManager.wolves.length).toBe(5);
      expect(unitManager.units.length).toBe(5);
    });
  });

  describe('getUnitById', () => {
    test('should return unit with matching id', () => {
      const dog = unitManager.createVegetableDog();
      const found = unitManager.getUnitById(dog.id);
      
      expect(found).toBe(dog);
    });

    test('should return null for non-existent id', () => {
      const found = unitManager.getUnitById('non_existent');
      expect(found).toBeNull();
    });
  });

  describe('getUnitAtPosition', () => {
    test('should return unit at given position', () => {
      const dog = unitManager.createVegetableDog();
      const found = unitManager.getUnitAtPosition(200, 150);
      
      expect(found).toBe(dog);
    });

    test('should return null when no unit at position', () => {
      const found = unitManager.getUnitAtPosition(0, 0);
      expect(found).toBeNull();
    });

    test('should not return disappeared units', () => {
      const dog = unitManager.createVegetableDog();
      dog.disappear();
      
      const found = unitManager.getUnitAtPosition(200, 150);
      expect(found).toBeNull();
    });
  });

  describe('clickUnit', () => {
    test('should start running when clicking unit', () => {
      const dog = unitManager.createVegetableDog();
      const result = unitManager.clickUnit(dog);
      
      expect(result).toBe(true);
      expect(dog.isRunning).toBe(true);
      expect(dog.state).toBe(UnitState.RUNNING);
    });

    test('should not start running when clicking disappeared unit', () => {
      const dog = unitManager.createVegetableDog();
      dog.disappear();
      
      const result = unitManager.clickUnit(dog);
      expect(result).toBe(false);
    });

    test('should not start running when clicking already running unit', () => {
      const dog = unitManager.createVegetableDog();
      dog.isRunning = true;
      
      const result = unitManager.clickUnit(dog);
      expect(result).toBe(false);
    });

    test('should return false when clicking null', () => {
      const result = unitManager.clickUnit(null);
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    test('should update all units', () => {
      unitManager.createVegetableDog();
      unitManager.createWolves(2);
      
      unitManager.units.forEach(unit => {
        unit.isRunning = true;
      });
      
      const originalPositions = unitManager.units.map(u => ({ x: u.x, y: u.y }));
      unitManager.update(0.5);
      
      unitManager.units.forEach((unit, index) => {
        expect(unit.x).not.toBe(originalPositions[index].x);
        expect(unit.y).not.toBe(originalPositions[index].y);
      });
    });
  });

  describe('checkBoundaries', () => {
    test('should detect and mark out-of-bounds units', () => {
      const dog = unitManager.createVegetableDog();
      dog.x = -100;
      dog.isRunning = true;
      
      const disappeared = unitManager.checkBoundaries();
      
      expect(disappeared).toContain(dog);
      expect(dog.isDisappeared).toBe(true);
    });
  });

  describe('reset', () => {
    test('should reset all units', () => {
      unitManager.createVegetableDog();
      unitManager.createWolves(2);
      
      unitManager.units.forEach(unit => {
        unit.isRunning = true;
        unit.isDisappeared = true;
        unit.state = UnitState.DISAPPEARED;
      });
      
      unitManager.reset();
      
      unitManager.units.forEach(unit => {
        expect(unit.isRunning).toBe(false);
        expect(unit.isDisappeared).toBe(false);
        expect(unit.state).toBe(UnitState.IDLE);
      });
    });
  });

  describe('clear', () => {
    test('should clear all units', () => {
      unitManager.createVegetableDog();
      unitManager.createWolves(2);
      
      unitManager.clear();
      
      expect(unitManager.units).toEqual([]);
      expect(unitManager.dog).toBeNull();
      expect(unitManager.wolves).toEqual([]);
    });
  });

  describe('getActiveUnits', () => {
    test('should return only active units', () => {
      unitManager.createVegetableDog();
      unitManager.createWolves(2);
      
      unitManager.wolves[0].disappear();
      
      const active = unitManager.getActiveUnits();
      expect(active.length).toBe(2);
      expect(active).not.toContain(unitManager.wolves[0]);
    });
  });

  describe('getRunningUnits', () => {
    test('should return only running units', () => {
      unitManager.createVegetableDog();
      unitManager.createWolves(2);
      
      unitManager.dog.isRunning = true;
      unitManager.wolves[0].isRunning = true;
      
      const running = unitManager.getRunningUnits();
      expect(running.length).toBe(2);
      expect(running).toContain(unitManager.dog);
      expect(running).toContain(unitManager.wolves[0]);
    });
  });

  describe('isDogDisappeared', () => {
    test('should return true when dog disappeared', () => {
      unitManager.createVegetableDog();
      unitManager.dog.disappear();
      
      expect(unitManager.isDogDisappeared()).toBe(true);
    });

    test('should return false when dog not disappeared', () => {
      unitManager.createVegetableDog();
      
      expect(unitManager.isDogDisappeared()).toBe(false);
    });
  });

  describe('getWolfCount', () => {
    test('should return correct wolf count', () => {
      unitManager.createWolves(5);
      
      expect(unitManager.getWolfCount()).toBe(5);
    });
  });

  describe('getDisappearedWolfCount', () => {
    test('should return count of disappeared wolves', () => {
      unitManager.createWolves(5);
      unitManager.wolves[0].disappear();
      unitManager.wolves[2].disappear();
      
      expect(unitManager.getDisappearedWolfCount()).toBe(2);
    });
  });
});
