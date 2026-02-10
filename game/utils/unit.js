const {
  DIRECTION_VECTORS,
  UnitType,
  UnitState,
  VEGETABLE_DOG_CONFIG,
  WOLF_CONFIG,
  generateId
} = require('./constants');

class Unit {
  constructor(config) {
    this.id = config.id || generateId();
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.size = config.size;
    this.direction = config.direction;
    this.speed = config.speed;
    this.state = config.state || UnitState.IDLE;
    this.isRunning = false;
    this.isDisappeared = false;
    this.scale = 1;
    this.opacity = 1;
    this.trail = [];
  }

  startRunning() {
    if (this.state === UnitState.DISAPPEARED) return;
    this.isRunning = true;
    this.state = UnitState.RUNNING;
    this.scale = 1.2;
    setTimeout(() => {
      this.scale = 1;
    }, 150);
  }

  stopRunning() {
    this.isRunning = false;
  }

  disappear() {
    this.isDisappeared = true;
    this.isRunning = false;
    this.state = UnitState.DISAPPEARED;
    this.scale = 1.3;
    this.opacity = 0;
  }

  reset() {
    this.isRunning = false;
    this.isDisappeared = false;
    this.state = UnitState.IDLE;
    this.scale = 1;
    this.opacity = 1;
    this.trail = [];
  }

  update(deltaTime) {
    if (!this.isRunning || this.isDisappeared) return;

    const vector = DIRECTION_VECTORS[this.direction];
    const distance = this.speed * deltaTime;

    this.x += vector.x * distance;
    this.y += vector.y * distance;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 30) {
      this.trail.shift();
    }
  }

  isOutOfBounds(screenWidth, screenHeight) {
    return (
      this.x < -this.size ||
      this.x > screenWidth + this.size ||
      this.y < -this.size ||
      this.y > screenHeight + this.size
    );
  }
}

class VegetableDog extends Unit {
  constructor(config) {
    super({
      ...config,
      type: UnitType.VEGETABLE_DOG,
      size: VEGETABLE_DOG_CONFIG.size,
      speed: VEGETABLE_DOG_CONFIG.speed
    });
  }
}

class Wolf extends Unit {
  constructor(config) {
    super({
      ...config,
      type: UnitType.WOLF,
      size: WOLF_CONFIG.size,
      speed: WOLF_CONFIG.speed
    });
  }
}

module.exports = { Unit, VegetableDog, Wolf };
