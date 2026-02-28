/**
 * 游戏常量定义模块
 * 包含方向、类型、状态、配置等游戏核心常量
 * @module constants
 */

/**
 * 方向枚举
 * @readonly
 * @enum {string}
 */
const Direction = {
  UP_LEFT: 'up_left',
  UP_RIGHT: 'up_right',
  DOWN_LEFT: 'down_left',
  DOWN_RIGHT: 'down_right'
};

/**
 * 方向向量映射
 * @readonly
 * @type {Object.<string, {col: number, row: number, angle: number}>}
 */
const DIRECTION_VECTORS = {
  [Direction.UP_LEFT]: { col: -1, row: -1, angle: 225 },
  [Direction.UP_RIGHT]: { col: 1, row: -1, angle: 315 },
  [Direction.DOWN_LEFT]: { col: -1, row: 1, angle: 135 },
  [Direction.DOWN_RIGHT]: { col: 1, row: 1, angle: 45 }
};

/**
 * 方块类型枚举
 * @readonly
 * @enum {string}
 */
const TileType = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  SINGLE: 'single'
};

/**
 * 单位类型枚举
 * @readonly
 * @enum {string}
 */
const UnitType = {
  DOG: 'dog',
  WOLF: 'wolf'
};

/**
 * 单位状态枚举
 * @readonly
 * @enum {string}
 */
const UnitState = {
  IDLE: 'idle',
  SLIDING: 'sliding',
  DISAPPEARED: 'disappeared',
  FADING_OUT: 'fading_out'
};

/**
 * 游戏状态枚举
 * @readonly
 * @enum {string}
 */
const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose'
};

/**
 * 关卡类型枚举
 * @readonly
 * @enum {string}
 */
const LevelType = {
  NORMAL: 'normal',
  TIMED: 'timed',
  CHALLENGE: 'challenge'
};

/**
 * 方块配置
 * @readonly
 */
const TILE_CONFIG = {
  baseSize: 18,
  gridSize: 14,
  rotation: 45,
  backgroundColor: '#f1f8e9',
  dogColor: '#FFD700',
  wolfColor: '#64748b',
  gridColor: 'rgba(0,0,0,0.1)'
};

/**
 * 游戏配置
 * @readonly
 */
const GAME_CONFIG = {
  GRID_SIZE: 14,
  CELL_SIZE: 0,
  BOARD_ROTATION: 45,
  BACKGROUND_COLOR: '#7cb342',
  TILE_COLOR: '#F5E6D3',
  TARGET_FPS: 60
};

/**
 * 动画配置
 * @readonly
 */
const ANIMATION_CONFIG = {
  MOVE_SPEED: 300,
  FADE_OUT_DURATION: 500,
  FRAME_RATE: 60
};

/**
 * 蔬菜狗配置
 * @readonly
 */
const VEGETABLE_DOG_CONFIG = {
  size: 60,
  speed: 120
};

/**
 * 狼配置
 * @readonly
 */
const WOLF_CONFIG = {
  size: 50,
  speed: 100
};

/**
 * 获取随机方向
 * @returns {string} 随机方向值
 */
function getRandomDirection() {
  const directions = [Direction.UP_LEFT, Direction.UP_RIGHT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];
  return directions[Math.floor(Math.random() * directions.length)];
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID字符串
 */
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
  ANIMATION_CONFIG,
  VEGETABLE_DOG_CONFIG,
  WOLF_CONFIG,
  getRandomDirection,
  generateId
};
