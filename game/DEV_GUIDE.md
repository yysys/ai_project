# 开发者指南 - 拯救菜狗

## 目录

1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [核心模块](#核心模块)
4. [API文档](#api文档)
5. [开发环境配置](#开发环境配置)
6. [调试指南](#调试指南)
7. [最佳实践](#最佳实践)

---

## 项目概述

### 项目位置

```
/Users/mayfair/Documents/trae_projects/ai_project/game
```

### 技术栈

- **框架**: 微信小程序（兼容抖音小游戏）
- **语言**: JavaScript (ES6+)
- **测试**: Jest
- **渲染**: Canvas 2D

### 已完成的修复

- 修复了 game.js 中的语法错误
- 所有96个单元测试全部通过
- 代码已推送到GitHub

---

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           抖音小游戏平台层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  tt.onTouch │  │ tt.getSystem│  │ tt.setStorage│  │ Canvas 2D   │    │
│  │    Start    │  │    Info     │  │   Sync      │  │   Context   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              适配层 (Adapter)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │InputAdapter │  │ScreenAdapter│  │StorageAdapter│ │CanvasAdapter│    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            应用核心层 (Core)                             │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        GameEngine (游戏引擎)                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │ GameLoop    │  │ StateManager│  │ EventSystem │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│          ┌─────────────────────────┼─────────────────────────┐         │
│          ▼                         ▼                         ▼         │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐  │
│  │ PuzzleManager │        │ LevelManager  │        │   Renderer    │  │
│  │  (谜题管理)   │        │  (关卡管理)   │        │   (渲染器)    │  │
│  └───────┬───────┘        └───────┬───────┘        └───────┬───────┘  │
│          │                        │                        │          │
│          ▼                        ▼                        ▼          │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐  │
│  │  TileManager  │        │ LevelLoader   │        │ CanvasRenderer│  │
│  │  (格子管理)   │        │ (关卡加载器)  │        │ (Canvas渲染)  │  │
│  └───────────────┘        └───────────────┘        └───────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────────┐      ┌─────────────────────────────────────┐
│     数据持久层 (Data)    │      │        外部服务层 (External)         │
│  ┌───────────────────┐  │      │  ┌───────────────────────────────┐  │
│  │ StorageService    │  │      │  │ C++ Level Generator (WASM)   │  │
│  │ (本地存储服务)    │  │      │  │ C++ Puzzle Solver (WASM)     │  │
│  └───────────────────┘  │      │  └───────────────────────────────┘  │
│  ┌───────────────────┐  │      │  ┌───────────────────────────────┐  │
│  │ LevelRepository   │  │      │  │ JSON Level Files             │  │
│  │ (关卡数据仓库)    │  │      │  └───────────────────────────────┘  │
│  └───────────────────┘  │      └─────────────────────────────────────┘
└─────────────────────────┘
```

### 架构分层说明

| 层级 | 职责 | 模块 |
|------|------|------|
| 平台层 | 抖音小游戏API封装 | tt.* API |
| 适配层 | 平台API适配与抽象 | InputAdapter, ScreenAdapter, StorageAdapter, CanvasAdapter |
| 核心层 | 游戏核心逻辑 | GameEngine, PuzzleManager, LevelManager, Renderer |
| 数据层 | 数据持久化与加载 | StorageService, LevelRepository |
| 外部层 | 外部服务集成 | C++ Generator, JSON Files |

---

## 核心模块

### 1. GameEngine（游戏引擎）

游戏的核心引擎，负责游戏生命周期和循环控制。

#### 职责

- 游戏生命周期管理（初始化、启动、暂停、恢复、销毁）
- 游戏循环控制（帧率控制、deltaTime计算）
- 状态管理（游戏状态切换、状态监听器管理）
- 模块协调（PuzzleManager、LevelManager、Renderer协调）

#### 核心方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(canvas, ctx, screenWidth, screenHeight)` | Canvas, Context, 宽度, 高度 | void | 初始化游戏引擎 |
| `startLevel(levelId)` | 关卡ID | boolean | 开始指定关卡 |
| `handleClick(x, y)` | 屏幕坐标 | boolean | 处理点击事件 |
| `pause()` | - | void | 暂停游戏 |
| `resume()` | - | void | 恢复游戏 |
| `undo()` | - | boolean | 撤销上一步 |
| `reset()` | - | boolean | 重置当前关卡 |
| `getHint()` | - | HintResult/null | 获取提示 |
| `getState()` | - | GameState | 获取当前状态 |
| `getElapsedTime()` | - | number | 获取已用时间 |
| `getCurrentLevel()` | - | Level/null | 获取当前关卡 |
| `destroy()` | - | void | 销毁游戏引擎 |

#### 事件系统

```javascript
engine.on('init', (data) => {});        // 初始化完成
engine.on('levelStart', (data) => {});  // 关卡开始
engine.on('tileSlide', (data) => {});   // 格子滑动
engine.on('win', (data) => {});         // 游戏胜利
engine.on('lose', (data) => {});        // 游戏失败
engine.on('pause', (data) => {});       // 游戏暂停
engine.on('resume', (data) => {});      // 游戏恢复
engine.on('levelReset', (data) => {});  // 关卡重置
engine.on('stateChange', (data) => {}); // 状态变化
engine.on('destroy', (data) => {});     // 引擎销毁
```

---

### 2. PuzzleManager（谜题管理器）

管理游戏中的谜题状态和移动逻辑。

#### 职责

- 谜题状态管理（格子集合管理、菜狗格子追踪）
- 移动逻辑（滑动计算、碰撞检测、边界检测）
- 动画管理（滑动动画、消失动画）
- 历史记录（状态保存、撤销操作）
- 胜利条件检测

#### 核心方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setCurrentLevel(id)` | 关卡ID | boolean | 设置当前关卡 |
| `getTiles()` | - | Tile[] | 获取所有格子 |
| `getDogTile()` | - | Tile/null | 获取菜狗格子 |
| `slideTile(tile)` | Tile对象 | SlideResult | 滑动格子 |
| `checkCollision(tile, col, row)` | Tile, 列, 行 | boolean | 检查碰撞 |
| `isPositionInDiamond(col, row, colSpan, rowSpan)` | 坐标和跨度 | boolean | 检查是否在菱形区域内 |
| `updateTileAnimation(tile, deltaTime)` | Tile, 时间差 | void | 更新格子动画 |
| `saveState()` | - | void | 保存当前状态 |
| `undo()` | - | boolean | 撤销操作 |
| `resetLevel()` | - | void | 重置关卡 |
| `checkWinCondition()` | - | boolean | 检查胜利条件 |
| `completeLevel(stars, score)` | 星级, 分数 | Level/null | 完成关卡 |
| `calculateStars(level, timeUsed)` | 关卡, 用时 | number | 计算星级 |
| `calculateScore(level, timeUsed)` | 关卡, 用时 | number | 计算分数 |

---

### 3. LevelManager（关卡管理器）

管理关卡数据和进度。

#### 职责

- 关卡数据管理（关卡列表维护、当前关卡追踪）
- 关卡加载（JSON关卡加载、关卡验证）
- 进度管理（星级记录、分数记录、解锁进度）
- 关卡切换（下一关解锁、关卡重置）

#### 核心方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init()` | - | Promise<void> | 初始化管理器 |
| `getLevel(id)` | 关卡ID | Level/null | 获取指定关卡 |
| `getLevels()` | - | Level[] | 获取所有关卡 |
| `getCurrentLevel()` | - | Level/null | 获取当前关卡 |
| `setCurrentLevel(id)` | 关卡ID | boolean | 设置当前关卡 |
| `unlockNextLevel()` | - | Level/null | 解锁下一关 |
| `completeLevel(stars, score)` | 星级, 分数 | Level/null | 完成关卡 |
| `resetLevel()` | - | void | 重置关卡 |
| `getTotalStars()` | - | number | 获取总星级 |
| `getMaxStars()` | - | number | 获取最大星级 |
| `getTotalScore()` | - | number | 获取总分数 |
| `getUnlockedLevels()` | - | Level[] | 获取已解锁关卡 |
| `getCompletedLevels()` | - | Level[] | 获取已完成关卡 |
| `loadProgress(data)` | 进度数据 | void | 加载进度 |
| `saveProgress()` | - | object | 保存进度 |

---

### 4. Renderer（渲染器）

负责Canvas渲染。

#### 职责

- Canvas渲染管理（画布初始化、上下文管理）
- 图形绘制（背景、格子、菜狗、狼）
- 动画渲染（移动动画、消失动画）
- UI渲染（关卡信息、计时器）

#### 核心方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(canvas, ctx)` | Canvas, Context | void | 初始化渲染器 |
| `setScreenSize(width, height)` | 宽度, 高度 | void | 设置屏幕尺寸 |
| `render(state)` | 渲染状态 | void | 渲染画面 |
| `clear()` | - | void | 清空画布 |
| `screenToGrid(x, y)` | 屏幕坐标 | GridPosition | 屏幕坐标转网格坐标 |
| `gridToScreen(col, row)` | 网格坐标 | ScreenPosition | 网格坐标转屏幕坐标 |

---

### 5. InputHandler（输入处理器）

处理用户输入。

#### 职责

- 触摸事件处理
- 点击检测
- 坐标转换
- 手势识别

---

### 6. StorageService（存储服务）

负责数据持久化。

#### 职责

- 本地存储（游戏进度、设置、缓存）
- 数据序列化
- 数据迁移

---

## API文档

### 常量定义 (constants.js)

```javascript
const {
  Direction,           // 方向常量
  DIRECTION_VECTORS,   // 方向向量映射
  TileType,            // 格子类型
  UnitType,            // 单位类型
  UnitState,           // 单位状态
  GameState,           // 游戏状态
  LevelType,           // 关卡类型
  TILE_CONFIG,         // 格子配置
  GAME_CONFIG,         // 游戏配置
  ANIMATION_CONFIG,    // 动画配置
  getRandomDirection,  // 获取随机方向
  generateId           // 生成唯一ID
} = require('./utils/constants');
```

#### Direction（方向）

```javascript
const Direction = {
  UP_LEFT: 'up_left',       // 左上
  UP_RIGHT: 'up_right',     // 右上
  DOWN_LEFT: 'down_left',   // 左下
  DOWN_RIGHT: 'down_right'  // 右下
};
```

#### DIRECTION_VECTORS（方向向量）

```javascript
const DIRECTION_VECTORS = {
  [Direction.UP_LEFT]: { col: -1, row: -1, angle: 225 },
  [Direction.UP_RIGHT]: { col: 1, row: -1, angle: 315 },
  [Direction.DOWN_LEFT]: { col: -1, row: 1, angle: 135 },
  [Direction.DOWN_RIGHT]: { col: 1, row: 1, angle: 45 }
};
```

#### TileType（格子类型）

```javascript
const TileType = {
  HORIZONTAL: 'horizontal',  // 水平格子
  VERTICAL: 'vertical',      // 垂直格子
  SINGLE: 'single'           // 单格
};
```

#### UnitType（单位类型）

```javascript
const UnitType = {
  DOG: 'dog',   // 菜狗
  WOLF: 'wolf'  // 狼
};
```

#### UnitState（单位状态）

```javascript
const UnitState = {
  IDLE: 'idle',               // 空闲
  SLIDING: 'sliding',         // 滑动中
  DISAPPEARED: 'disappeared', // 已消失
  FADING_OUT: 'fading_out'    // 淡出中
};
```

#### GameState（游戏状态）

```javascript
const GameState = {
  IDLE: 'idle',       // 空闲
  PLAYING: 'playing', // 游戏中
  PAUSED: 'paused',   // 暂停
  WIN: 'win',         // 胜利
  LOSE: 'lose'        // 失败
};
```

#### LevelType（关卡类型）

```javascript
const LevelType = {
  NORMAL: 'normal',       // 普通关卡
  TIMED: 'timed',         // 限时关卡
  CHALLENGE: 'challenge'  // 挑战关卡
};
```

#### 配置常量

```javascript
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

const ANIMATION_CONFIG = {
  MOVE_SPEED: 300,
  FADE_OUT_DURATION: 500,
  FRAME_RATE: 60
};
```

---

### Tile 类

格子对象，表示游戏中的一个单位。

```javascript
class Tile {
  constructor(config) {
    this.id = config.id || generateId();
    this.type = config.type || TileType.HORIZONTAL;
    this.unitType = config.unitType || UnitType.WOLF;
    this.gridCol = config.gridCol;
    this.gridRow = config.gridRow;
    this.gridColSpan = config.gridColSpan || 1;
    this.gridRowSpan = config.gridRowSpan || 1;
    this.direction = config.direction || Direction.DOWN_RIGHT;
    this.state = UnitState.IDLE;
    
    // 动画属性
    this.animating = false;
    this.animationProgress = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetGridCol = 0;
    this.targetGridRow = 0;
    this.opacity = 1;
  }
  
  clone() { ... }
  restoreFrom(saved) { ... }
  getStateSnapshot() { ... }
}
```

---

### Level 类

关卡对象。

```javascript
class Level {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || `第${config.id}关`;
    this.type = config.type || LevelType.NORMAL;
    this.timeLimit = config.timeLimit || 0;
    this.targetScore = config.targetScore || 0;
    this.tiles = config.tiles || [];
    this.dogTile = config.dogTile || null;
    this.stars = 0;
    this.score = 0;
    this.completed = false;
    this.unlocked = config.unlocked || false;
    this.solvable = true;
    this.validated = false;
  }
  
  getWolfCount() { ... }
  getDogTile() { ... }
  clone() { ... }
}
```

---

### 使用示例

#### 初始化游戏

```javascript
const GameEngine = require('./utils/gameEngine');

const engine = new GameEngine();

// 设置事件监听
engine.on('win', (data) => {
  console.log('胜利!', data);
  // data: { levelId, stars, score, timeUsed, moveCount }
});

engine.on('lose', (data) => {
  console.log('失败!', data);
});

// 初始化
engine.init(canvas, ctx, screenWidth, screenHeight);

// 开始关卡
engine.startLevel(1);
```

#### 处理用户输入

```javascript
// 在页面中绑定触摸事件
Page({
  onTouchStart(e) {
    const touch = e.touches[0];
    engine.handleClick(touch.clientX, touch.clientY);
  }
});
```

#### 暂停和恢复

```javascript
// 暂停游戏
engine.pause();

// 恢复游戏
engine.resume();
```

#### 撤销和重置

```javascript
// 撤销上一步
engine.undo();

// 重置关卡
engine.reset();
```

#### 获取提示

```javascript
const hint = engine.getHint();
if (hint) {
  console.log('提示：点击格子', hint.tile.id, '方向', hint.direction);
}
```

---

## 开发环境配置

### 下载开发者工具

#### 微信开发者工具

1. 访问官网：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 下载对应你操作系统的版本
3. 安装并启动微信开发者工具

#### 抖音开发者工具

1. 访问官网：https://developer.open-douyin.com/docs/resource/developer-docs/development-tool/mini-app/development-tool/update-and-download
2. 下载对应你操作系统的版本
3. 安装并启动抖音开发者工具

### 导入项目

1. 点击工具栏的"导入项目"按钮
2. 选择 `game` 文件夹
3. 项目名称会自动填充为"拯救菜狗"
4. AppID选择：
   - 如果有正式AppID，填入
   - 如果没有，选择"测试号"
5. 点击"导入"按钮

### 安装依赖

```bash
cd game
npm install
```

---

## 调试指南

### 查看控制台

1. **打开调试器**：
   - 微信开发者工具：点击右侧"调试器"标签
   - 抖音开发者工具：点击右侧"调试"标签

2. **查看Console输出**：
   - 游戏启动日志
   - 关卡加载日志
   - 点击事件日志
   - 游戏状态变化日志

### 常见错误及解决方案

#### 错误1：Canvas not found

**原因**：Canvas元素未正确初始化

**解决方案**：
1. 检查 game.wxml 中是否有 `<canvas type="2d" id="gameCanvas"></canvas>`
2. 检查 onReady 是否正确调用 createCanvas
3. 重新编译项目

#### 错误2：UnitType is not defined

**原因**：常量模块未正确导入

**解决方案**：
1. 检查 utils/constants.js 是否存在
2. 检查是否正确导入：`const { UnitType } = require('../../utils/constants');`
3. 重新编译项目

#### 错误3：gameEngine is null

**原因**：游戏引擎未正确初始化

**解决方案**：
1. 检查 initGameEngine 是否被正确调用
2. 检查 Canvas 是否正确创建
3. 重新编译项目

#### 错误4：页面跳转失败

**原因**：页面路径错误

**解决方案**：
1. 检查 app.json 中是否正确配置页面路径
2. 检查跳转路径是否正确：`/pages/game/game`
3. 重新编译项目

### 使用断点调试

1. **设置断点**：
   - 在代码行号左侧点击，设置断点
   - 断点会显示为红色圆点

2. **触发断点**：
   - 在模拟器中操作游戏
   - 当代码执行到断点时，会自动暂停

3. **查看变量**：
   - 在调试器右侧查看变量值
   - 鼠标悬停在变量上查看值

4. **单步执行**：
   - 单步进入（Step Into）
   - 单步跳过（Step Over）
   - 继续执行（Resume）

---

## 最佳实践

### 代码规范

1. **使用 ES6+ 语法**
   ```javascript
   // 推荐
   const { Direction } = require('./constants');
   const tiles = this.tiles.filter(t => t.state === UnitState.IDLE);
   
   // 不推荐
   var Direction = require('./constants').Direction;
   var tiles = this.tiles.filter(function(t) { return t.state === UnitState.IDLE; });
   ```

2. **使用 JSDoc 注释**
   ```javascript
   /**
    * 滑动格子
    * @param {Tile} tile - 要滑动的格子
    * @returns {SlideResult} 滑动结果
    */
   slideTile(tile) {
     // ...
   }
   ```

3. **错误处理**
   ```javascript
   try {
     const result = this.slideTile(tile);
     if (!result.moved) {
       logger.warn('格子无法移动:', result.reason);
     }
   } catch (error) {
     logger.error('滑动格子失败:', error);
   }
   ```

### 性能优化

1. **避免频繁创建对象**
   ```javascript
   // 不推荐
   update() {
     const pos = { x: 0, y: 0 }; // 每帧创建新对象
     // ...
   }
   
   // 推荐
   constructor() {
     this._tempPos = { x: 0, y: 0 }; // 复用对象
   }
   update() {
     this._tempPos.x = 0;
     this._tempPos.y = 0;
     // ...
   }
   ```

2. **使用对象池**
   ```javascript
   class ObjectPool {
     constructor(createFn, resetFn) {
       this.pool = [];
       this.createFn = createFn;
       this.resetFn = resetFn;
     }
     
     get() {
       return this.pool.length > 0 ? this.pool.pop() : this.createFn();
     }
     
     release(obj) {
       this.resetFn(obj);
       this.pool.push(obj);
     }
   }
   ```

3. **减少不必要的渲染**
   ```javascript
   // 只在需要时渲染
   if (this.needsRender) {
     this.renderer.render(state);
     this.needsRender = false;
   }
   ```

### 测试规范

1. **每个模块独立测试**
2. **测试覆盖率要求**：核心模块 >= 80%
3. **使用描述性的测试名称**

---

**文档版本**: v2.0  
**最后更新**: 2026-02-28  
**维护者**: 开发团队
