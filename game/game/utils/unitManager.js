const {
  Direction,
  DIRECTION_VECTORS,
  UnitType,
  UnitState,
  GameState,
  LevelType,
  VEGETABLE_DOG_CONFIG,
  WOLF_CONFIG,
  GAME_CONFIG,
  getRandomDirection,
  isNearCenter,
  generateId
} = require('./constants');

const { Unit, VegetableDog, Wolf } = require('./unit');

class UnitManager {
  constructor() {
    this.units = [];
    this.dog = null;
    this.wolves = [];
    this.screenWidth = 0;
    this.screenHeight = 0;
  }

  setScreenSize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  createVegetableDog() {
    const dog = new VegetableDog({
      x: this.screenWidth / 2,
      y: this.screenHeight / 2,
      direction: getRandomDirection()
    });
    this.dog = dog;
    this.units.push(dog);
    return dog;
  }

  createWolf() {
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      x = Math.random() * this.screenWidth;
      y = Math.random() * this.screenHeight;
      attempts++;
    } while (isNearCenter(x, y, this.screenWidth / 2, this.screenHeight / 2) && attempts < maxAttempts);

    const wolf = new Wolf({
      x: x,
      y: y,
      direction: getRandomDirection()
    });
    this.wolves.push(wolf);
    this.units.push(wolf);
    return wolf;
  }

  createWolves(count) {
    for (let i = 0; i < count; i++) {
      this.createWolf();
    }
    return this.wolves;
  }

  getUnitById(id) {
    const unit = this.units.find(unit => unit.id === id);
    return unit !== undefined ? unit : null;
  }

  getUnitAtPosition(x, y) {
    for (const unit of this.units) {
      if (unit.isDisappeared) continue;
      
      const dx = x - unit.x;
      const dy = y - unit.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= unit.size / 2) {
        return unit;
      }
    }
    return null;
  }

  clickUnit(unit) {
    if (!unit || unit.isDisappeared || unit.isRunning) return false;
    
    unit.startRunning();
    return true;
  }

  update(deltaTime) {
    this.units.forEach(unit => {
      unit.update(deltaTime);
    });
  }

  checkBoundaries() {
    const disappearedUnits = [];
    
    this.units.forEach(unit => {
      if (unit.isRunning && !unit.isDisappeared && unit.isOutOfBounds(this.screenWidth, this.screenHeight)) {
        unit.disappear();
        disappearedUnits.push(unit);
      }
    });
    
    return disappearedUnits;
  }

  reset() {
    this.units.forEach(unit => {
      unit.reset();
    });
  }

  clear() {
    this.units = [];
    this.dog = null;
    this.wolves = [];
  }

  getActiveUnits() {
    return this.units.filter(unit => !unit.isDisappeared);
  }

  getRunningUnits() {
    return this.units.filter(unit => unit.isRunning && !unit.isDisappeared);
  }

  isDogDisappeared() {
    return this.dog && this.dog.isDisappeared;
  }

  getWolfCount() {
    return this.wolves.length;
  }

  getDisappearedWolfCount() {
    return this.wolves.filter(wolf => wolf.isDisappeared).length;
  }
}

module.exports = UnitManager;
