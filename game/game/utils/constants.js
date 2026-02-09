const Direction = {
  LEFT_UP: 'left_up',
  LEFT_DOWN: 'left_down',
  RIGHT_UP: 'right_up',
  RIGHT_DOWN: 'right_down'
};

const DIRECTION_VECTORS = {
  [Direction.LEFT_UP]: { x: -1, y: -1 },
  [Direction.LEFT_DOWN]: { x: -1, y: 1 },
  [Direction.RIGHT_UP]: { x: 1, y: -1 },
  [Direction.RIGHT_DOWN]: { x: 1, y: 1 }
};

const DIRECTION_ANGLES = {
  [Direction.LEFT_UP]: 225,
  [Direction.LEFT_DOWN]: 135,
  [Direction.RIGHT_UP]: 315,
  [Direction.RIGHT_DOWN]: 45
};

const UnitType = {
  VEGETABLE_DOG: 'vegetable_dog',
  WOLF: 'wolf'
};

const UnitState = {
  IDLE: 'idle',
  SELECTED: 'selected',
  RUNNING: 'running',
  DISAPPEARED: 'disappeared'
};

const GameState = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose'
};

const LevelType = {
  NORMAL: 'normal',
  TIMED: 'timed',
  SURVIVAL: 'survival',
  CHALLENGE: 'challenge'
};

const VEGETABLE_DOG_CONFIG = {
  size: 80,
  speed: 100,
  color: '#52C41A',
  position: 'center'
};

const WOLF_CONFIG = {
  size: 60,
  speed: 120,
  color: '#64748b'
};

const GAME_CONFIG = {
  GRID_SIZE: 14,
  CELL_SIZE: 18,
  BOARD_ROTATION: 45,
  BACKGROUND_COLOR: '#dcedc8',
  TARGET_FPS: 60
};

function getRandomDirection() {
  const directions = Object.values(Direction);
  return directions[Math.floor(Math.random() * directions.length)];
}

function isNearCenter(x, y, centerX, centerY, threshold = 150) {
  const distance = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
  );
  return distance < threshold;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
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
};
