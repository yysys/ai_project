const Direction = {
  UP_LEFT: 'up_left',
  UP_RIGHT: 'up_right',
  DOWN_LEFT: 'down_left',
  DOWN_RIGHT: 'down_right'
};

const DIRECTION_VECTORS = {
  [Direction.UP_LEFT]: { col: -1, row: -1, angle: 225 },
  [Direction.UP_RIGHT]: { col: 1, row: -1, angle: 315 },
  [Direction.DOWN_LEFT]: { col: -1, row: 1, angle: 135 },
  [Direction.DOWN_RIGHT]: { col: 1, row: 1, angle: 45 }
};

const TileType = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  SINGLE: 'single'
};

const UnitType = {
  DOG: 'dog',
  WOLF: 'wolf'
};

const UnitState = {
  IDLE: 'idle',
  SLIDING: 'sliding',
  DISAPPEARED: 'disappeared'
};

const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose'
};

const LevelType = {
  NORMAL: 'normal',
  TIMED: 'timed',
  CHALLENGE: 'challenge'
};

const TILE_CONFIG = {
  baseSize: 18,
  gridSize: 14,
  rotation: 45,
  backgroundColor: '#f1f8e9',
  dogColor: '#FFD700',
  wolfColor: '#64748b',
  gridColor: 'rgba(0,0,0,0.1)'
};

const GAME_CONFIG = {
  GRID_SIZE: 14,
  CELL_SIZE: 0,
  BOARD_ROTATION: 45,
  BACKGROUND_COLOR: '#7cb342',
  TILE_COLOR: '#F5E6D3',
  TARGET_FPS: 60
};

function getRandomDirection() {
  const directions = [Direction.UP_LEFT, Direction.UP_RIGHT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
  return directions[Math.floor(Math.random() * directions.length)];
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  Direction,
  DIRECTION_VECTORS,
  TileType,
  UnitType,
  UnitState,
  GameState,
  LevelType,
  TILE_CONFIG,
  GAME_CONFIG,
  getRandomDirection,
  generateId
};
