# 抖音小游戏模块化架构设计文档

## 目录

1. [架构概述](#1-架构概述)
2. [核心模块划分](#2-核心模块划分)
3. [模块接口定义](#3-模块接口定义)
4. [模块间通信机制](#4-模块间通信机制)
5. [数据流设计](#5-数据流设计)
6. [时序图](#6-时序图)
7. [C++集成方案](#7-c集成方案)
8. [设计原则遵循](#8-设计原则遵循)

---

## 1. 架构概述

### 1.1 整体架构图

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

### 1.2 架构分层说明

| 层级 | 职责 | 模块 |
|------|------|------|
| 平台层 | 抖音小游戏API封装 | tt.* API |
| 适配层 | 平台API适配与抽象 | InputAdapter, ScreenAdapter, StorageAdapter, CanvasAdapter |
| 核心层 | 游戏核心逻辑 | GameEngine, PuzzleManager, LevelManager, Renderer |
| 数据层 | 数据持久化与加载 | StorageService, LevelRepository |
| 外部层 | 外部服务集成 | C++ Generator, JSON Files |

---

## 2. 核心模块划分

### 2.1 模块职责定义

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           核心模块关系图                                 │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │ GameEngine  │
                              │  游戏引擎    │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │  PuzzleManager  │   │  LevelManager   │   │    Renderer     │
     │   谜题管理器     │   │   关卡管理器    │   │     渲染器      │
     └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
              │                      │                      │
              ▼                      ▼                      ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │   TileManager   │   │  LevelLoader    │   │ CanvasRenderer  │
     │   格子管理器     │   │   关卡加载器    │   │  Canvas渲染器   │
     └─────────────────┘   └─────────────────┘   └─────────────────┘
              │                      │
              └──────────┬───────────┘
                         ▼
              ┌─────────────────┐
              │  InputHandler   │
              │   输入处理器     │
              └─────────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │ StorageService  │
              │   存储服务       │
              └─────────────────┘
```

### 2.2 各模块详细职责

#### 2.2.1 GameEngine (游戏引擎)

```
职责：
├── 游戏生命周期管理
│   ├── 初始化 (init)
│   ├── 启动 (start)
│   ├── 暂停 (pause)
│   ├── 恢复 (resume)
│   └── 销毁 (destroy)
├── 游戏循环控制
│   ├── 帧率控制 (FPS: 60)
│   ├── deltaTime计算
│   └── 动画帧调度
├── 状态管理
│   ├── 游戏状态切换
│   └── 状态监听器管理
└── 模块协调
    ├── PuzzleManager协调
    ├── LevelManager协调
    └── Renderer协调

依赖：
├── PuzzleManager
├── LevelManager
├── Renderer
├── InputHandler
└── GameStateManager
```

#### 2.2.2 PuzzleManager (谜题管理器)

```
职责：
├── 谜题状态管理
│   ├── 格子集合管理
│   ├── 菜狗格子追踪
│   └── 格子状态同步
├── 移动逻辑
│   ├── 滑动计算
│   ├── 碰撞检测
│   ├── 边界检测
│   └── 目标位置计算
├── 动画管理
│   ├── 滑动动画
│   ├── 消失动画
│   └── 动画进度更新
├── 历史记录
│   ├── 状态保存
│   ├── 撤销操作
│   └── 重置操作
└── 胜利条件检测
    ├── 菜狗消失检测
    └── 星级计算

依赖：
├── TileManager
├── CollisionDetector
└── AnimationController
```

#### 2.2.3 LevelManager (关卡管理器)

```
职责：
├── 关卡数据管理
│   ├── 关卡列表维护
│   ├── 当前关卡追踪
│   └── 关卡解锁状态
├── 关卡加载
│   ├── JSON关卡加载
│   ├── C++生成关卡加载
│   └── 关卡验证
├── 进度管理
│   ├── 星级记录
│   ├── 分数记录
│   └── 解锁进度
└── 关卡切换
    ├── 下一关解锁
    └── 关卡重置

依赖：
├── LevelLoader
├── StorageService
└── LevelRepository
```

#### 2.2.4 Renderer (渲染器)

```
职责：
├── Canvas渲染管理
│   ├── 画布初始化
│   ├── 上下文管理
│   └── 尺寸适配
├── 图形绘制
│   ├── 背景绘制
│   ├── 格子绘制
│   ├── 菜狗绘制
│   └── 狼绘制
├── 动画渲染
│   ├── 移动动画
│   ├── 消失动画
│   └── 特效渲染
└── UI渲染
    ├── 关卡信息
    ├── 计时器
    └── 提示信息

依赖：
├── CanvasAdapter
├── ResourceManager
└── AnimationRenderer
```

#### 2.2.5 InputHandler (输入处理器)

```
职责：
├── 触摸事件处理
│   ├── 触摸开始
│   ├── 触摸移动
│   └── 触摸结束
├── 点击检测
│   ├── 格子命中测试
│   ├── 坐标转换
│   └── 旋转坐标处理
└── 手势识别
    ├── 点击手势
    └── 滑动手势

依赖：
├── InputAdapter
├── CoordinateTransformer
└── HitTester
```

#### 2.2.6 StorageService (存储服务)

```
职责：
├── 本地存储
│   ├── 游戏进度保存
│   ├── 设置保存
│   └── 缓存管理
├── 数据序列化
│   ├── JSON序列化
│   └── 数据压缩
└── 数据迁移
    ├── 版本兼容
    └── 数据升级

依赖：
├── StorageAdapter
└── SerializationService
```

---

## 3. 模块接口定义

### 3.1 GameEngine 接口

```typescript
interface IGameEngine {
  // 生命周期方法
  init(config: GameConfig): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  
  // 关卡控制
  startLevel(levelId: number): boolean;
  resetLevel(): boolean;
  
  // 游戏操作
  handleClick(x: number, y: number): boolean;
  undo(): boolean;
  getHint(): HintResult | null;
  
  // 状态查询
  getState(): GameState;
  getElapsedTime(): number;
  getCurrentLevel(): Level | null;
  
  // 事件监听
  on(event: GameEvent, callback: EventCallback): void;
  off(event: GameEvent, callback: EventCallback): void;
}

interface GameConfig {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  screenWidth: number;
  screenHeight: number;
  targetFPS?: number;
}

type GameEvent = 'win' | 'lose' | 'levelStart' | 'levelEnd' | 'stateChange';

interface HintResult {
  tile: Tile;
  direction: Direction;
}
```

### 3.2 PuzzleManager 接口

```typescript
interface IPuzzleManager {
  // 关卡管理
  setCurrentLevel(levelId: number): boolean;
  getCurrentLevel(): PuzzleLevel | null;
  getTiles(): Tile[];
  getDogTile(): Tile | null;
  
  // 移动操作
  slideTile(tile: Tile): SlideResult;
  calculateTargetPosition(tile: Tile, vector: DirectionVector): TargetPosition;
  
  // 碰撞检测
  checkCollision(tile: Tile, col: number, row: number): boolean;
  isPositionInDiamond(col: number, row: number, colSpan: number, rowSpan: number): boolean;
  
  // 动画更新
  updateTileAnimation(tile: Tile, deltaTime: number): void;
  
  // 状态管理
  saveState(): void;
  undo(): boolean;
  resetLevel(): void;
  
  // 胜利检测
  checkWinCondition(): boolean;
  
  // 计分
  calculateStars(level: Level, timeUsed: number): number;
  calculateScore(level: Level, timeUsed: number): number;
  
  // 屏幕坐标转换
  getTileScreenPosition(tile: Tile): ScreenPosition | null;
  setScreenSize(width: number, height: number): void;
}

interface SlideResult {
  moved: boolean;
  disappeared: boolean;
  tile?: Tile;
  distance?: number;
  reason?: string;
}

interface TargetPosition {
  gridCol: number;
  gridRow: number;
  willDisappear: boolean;
  distance: number;
  canMove: boolean;
}

interface ScreenPosition {
  x: number;
  y: number;
}
```

### 3.3 LevelManager 接口

```typescript
interface ILevelManager {
  // 关卡获取
  getLevel(id: number): Level | null;
  getLevels(): Level[];
  getCurrentLevel(): Level | null;
  
  // 关卡选择
  setCurrentLevel(id: number): boolean;
  
  // 进度管理
  unlockNextLevel(): Level | null;
  completeLevel(stars: number, score: number): Level | null;
  resetLevel(): void;
  
  // 统计
  getTotalStars(): number;
  getMaxStars(): number;
  getUnlockedLevels(): Level[];
  getCompletedLevels(): Level[];
  
  // 计分
  calculateStars(level: Level, timeUsed: number): number;
  calculateScore(level: Level, timeUsed: number): number;
}

interface Level {
  id: number;
  name: string;
  type: LevelType;
  tiles: Tile[];
  dogTile: Tile | null;
  timeLimit?: number;
  targetScore?: number;
  completed: boolean;
  unlocked: boolean;
  stars: number;
  score: number;
}

type LevelType = 'normal' | 'timed' | 'challenge';
```

### 3.4 Renderer 接口

```typescript
interface IRenderer {
  // 初始化
  init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void;
  setScreenSize(width: number, height: number): void;
  
  // 渲染方法
  render(): void;
  clear(): void;
  
  // 绘制方法
  drawBackground(): void;
  drawGrid(): void;
  drawTiles(tiles: Tile[]): void;
  drawTile(tile: Tile, x: number, y: number, width: number, height: number): void;
  drawUI(level: Level, elapsedTime: number): void;
  
  // 动画绘制
  drawAnimatingTile(tile: Tile): void;
  drawDisappearEffect(tile: Tile): void;
  
  // 资源管理
  loadImage(url: string): Promise<HTMLImageElement>;
  preloadImages(urls: string[]): Promise<void>;
}

interface RenderConfig {
  backgroundColor: string;
  gridColor: string;
  dogColor: string;
  wolfColor: string;
  rotation: number;
}
```

### 3.5 InputHandler 接口

```typescript
interface IInputHandler {
  // 初始化
  init(canvas: HTMLCanvasElement): void;
  
  // 事件绑定
  bindEvents(): void;
  unbindEvents(): void;
  
  // 触摸处理
  onTouchStart(callback: TouchCallback): void;
  onTouchMove(callback: TouchCallback): void;
  onTouchEnd(callback: TouchCallback): void;
  
  // 点击检测
  getTileAtPosition(x: number, y: number, tiles: Tile[]): Tile | null;
  
  // 坐标转换
  screenToGrid(x: number, y: number): GridPosition;
  gridToScreen(col: number, row: number): ScreenPosition;
  
  // 旋转坐标处理
  rotateCoordinates(x: number, y: number, angle: number): ScreenPosition;
}

interface TouchCallback {
  (event: TouchEvent): void;
}

interface GridPosition {
  col: number;
  row: number;
}

interface TouchEvent {
  x: number;
  y: number;
  timestamp: number;
}
```

### 3.6 Storage 接口

```typescript
interface IStorageService {
  // 基础存储
  set(key: string, value: any): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // 游戏进度
  saveProgress(progress: GameProgress): Promise<void>;
  loadProgress(): Promise<GameProgress | null>;
  
  // 关卡数据
  saveLevelData(levelId: number, data: LevelData): Promise<void>;
  loadLevelData(levelId: number): Promise<LevelData | null>;
  
  // 设置
  saveSettings(settings: GameSettings): Promise<void>;
  loadSettings(): Promise<GameSettings>;
  
  // 缓存
  setCache(key: string, value: any, ttl?: number): Promise<void>;
  getCache<T>(key: string): Promise<T | null>;
}

interface GameProgress {
  currentLevel: number;
  unlockedLevels: number[];
  levelStars: Record<number, number>;
  levelScores: Record<number, number>;
  totalScore: number;
  lastPlayTime: number;
}

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  language: string;
}

interface LevelData {
  id: number;
  name: string;
  tiles: TileConfig[];
  type: string;
  timeLimit?: number;
}
```

---

## 4. 模块间通信机制

### 4.1 事件系统设计

```typescript
class EventSystem {
  private events: Map<string, Set<EventCallback>> = new Map();
  
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }
  
  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
  }
  
  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }
  
  once(event: string, callback: EventCallback): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

type EventCallback = (data: any) => void;
```

### 4.2 事件类型定义

```typescript
enum GameEventType {
  // 游戏状态事件
  GAME_START = 'game:start',
  GAME_PAUSE = 'game:pause',
  GAME_RESUME = 'game:resume',
  GAME_END = 'game:end',
  
  // 关卡事件
  LEVEL_START = 'level:start',
  LEVEL_COMPLETE = 'level:complete',
  LEVEL_RESET = 'level:reset',
  LEVEL_UNLOCK = 'level:unlock',
  
  // 格子事件
  TILE_CLICK = 'tile:click',
  TILE_SLIDE = 'tile:slide',
  TILE_DISAPPEAR = 'tile:disappear',
  TILE_ANIMATION_END = 'tile:animationEnd',
  
  // 胜负事件
  WIN = 'game:win',
  LOSE = 'game:lose',
  
  // UI事件
  UI_UPDATE = 'ui:update',
  SCORE_UPDATE = 'score:update',
  TIME_UPDATE = 'time:update',
  
  // 存储事件
  STORAGE_SAVE = 'storage:save',
  STORAGE_LOAD = 'storage:load',
  STORAGE_ERROR = 'storage:error'
}

interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: any;
}
```

### 4.3 状态管理方案

```typescript
class StateManager {
  private state: GameState;
  private listeners: StateListener[] = [];
  
  getState(): GameState {
    return { ...this.state };
  }
  
  setState(partial: Partial<GameState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partial };
    this.notifyListeners(oldState, this.state);
  }
  
  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notifyListeners(oldState: GameState, newState: GameState): void {
    this.listeners.forEach(listener => listener(oldState, newState));
  }
}

interface GameState {
  status: GameStatus;
  currentLevelId: number | null;
  elapsedTime: number;
  score: number;
  stars: number;
  isPaused: boolean;
}

type GameStatus = 'idle' | 'playing' | 'paused' | 'win' | 'lose';

type StateListener = (oldState: GameState, newState: GameState) => void;
```

### 4.4 模块间通信流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          模块间通信流程图                                │
└─────────────────────────────────────────────────────────────────────────┘

用户点击屏幕
      │
      ▼
┌─────────────┐
│InputHandler │ ──────► 坐标转换 ──────► 格子命中测试
└──────┬──────┘
       │
       │ emit('tile:click', { tile, position })
       ▼
┌─────────────┐
│ GameEngine  │ ──────► 事件分发
└──────┬──────┘
       │
       │ 调用 slideTile()
       ▼
┌─────────────┐
│PuzzleManager│ ──────► 碰撞检测 ──────► 位置计算 ──────► 状态更新
└──────┬──────┘
       │
       │ emit('tile:slide', { tile, result })
       ▼
┌─────────────┐
│  Renderer   │ ──────► 动画渲染 ──────► 画面更新
└──────┬──────┘
       │
       │ emit('tile:animationEnd', { tile })
       ▼
┌─────────────┐
│StateManager │ ──────► 状态更新 ──────► UI刷新
└──────┬──────┘
       │
       │ 检测胜利条件
       ▼
┌─────────────┐
│ checkWin()  │ ──────► emit('game:win') ──────► 结算页面
└─────────────┘
```

---

## 5. 数据流设计

### 5.1 数据流图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            数据流向图                                    │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │         用户输入                │
                    │  (触摸事件/点击事件)            │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           InputHandler                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │ 触摸事件    │───►│ 坐标转换    │───►│ 格子识别    │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            GameEngine                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │ 事件处理    │───►│ 状态管理    │───►│ 模块协调    │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  PuzzleManager  │      │  LevelManager   │      │    Renderer     │
│ ┌─────────────┐ │      │ ┌─────────────┐ │      │ ┌─────────────┐ │
│ │ 格子状态    │ │      │ │ 关卡数据    │ │      │ │ 渲染状态    │ │
│ │ 移动逻辑    │ │      │ │ 进度数据    │ │      │ │ 动画状态    │ │
│ │ 碰撞检测    │ │      │ │ 解锁状态    │ │      │ │ UI状态      │ │
│ └─────────────┘ │      │ └─────────────┘ │      │ └─────────────┘ │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          StorageService                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │ 游戏进度    │    │ 关卡数据    │    │ 用户设置    │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          抖音小游戏存储                                  │
│                         tt.setStorageSync()                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 数据结构定义

```typescript
interface Tile {
  id: string;
  type: TileType;
  unitType: UnitType;
  gridCol: number;
  gridRow: number;
  gridColSpan: number;
  gridRowSpan: number;
  direction: Direction;
  state: UnitState;
  
  // 动画属性
  animating: boolean;
  animationProgress: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  targetGridCol: number;
  targetGridRow: number;
  opacity: number;
}

type TileType = 'horizontal' | 'vertical' | 'single';
type UnitType = 'dog' | 'wolf';
type UnitState = 'idle' | 'sliding' | 'disappeared' | 'fading_out';
type Direction = 'up_left' | 'up_right' | 'down_left' | 'down_right';

interface PuzzleLevel {
  id: number;
  name: string;
  type: LevelType;
  timeLimit?: number;
  tiles: Tile[];
  dogTile: Tile | null;
  completed: boolean;
  unlocked: boolean;
  stars: number;
  score: number;
}
```

### 5.3 单向数据流

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          单向数据流                                      │
│                                                                         │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐      │
│   │  Action │ ───► │  State  │ ───► │   View  │ ───► │  Render │      │
│   └─────────┘      └─────────┘      └─────────┘      └─────────┘      │
│        ▲                                                   │           │
│        └───────────────────────────────────────────────────┘           │
│                         用户交互                                        │
└─────────────────────────────────────────────────────────────────────────┘

Action (动作):
├── TILE_CLICK    - 点击格子
├── TILE_SLIDE    - 滑动格子
├── LEVEL_START   - 开始关卡
├── LEVEL_RESET   - 重置关卡
├── UNDO          - 撤销操作
└── GAME_END      - 游戏结束

State (状态):
├── gameState     - 游戏状态
├── tiles         - 格子集合
├── currentLevel  - 当前关卡
├── elapsedTime   - 已用时间
└── score         - 当前分数

View (视图):
├── Canvas渲染
├── UI更新
└── 动画播放

Render (渲染):
├── 背景绘制
├── 格子绘制
└── UI绘制
```

---

## 6. 时序图

### 6.1 游戏启动时序图

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Page   │ │GameEngine│ │LevelMgr │ │PuzzleMgr│ │Renderer │ │ Storage │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │           │
     │ onLoad()  │           │           │           │           │
     │──────────►│           │           │           │           │
     │           │           │           │           │           │
     │           │ init()    │           │           │           │
     │           │──────────────────────────────────────────────►│
     │           │           │           │           │           │
     │           │           │ loadProgress()        │           │
     │           │           │──────────────────────────────────►│
     │           │           │           │           │           │
     │           │           │◄──────────────────────────────────│
     │           │           │ progress  │           │           │
     │           │           │           │           │           │
     │           │ init(canvas, ctx)     │           │           │
     │           │──────────────────────────────────►│           │
     │           │           │           │           │           │
     │ onReady() │           │           │           │           │
     │──────────►│           │           │           │           │
     │           │           │           │           │           │
     │           │ startLevel(levelId)   │           │           │
     │           │──────────►│           │           │           │
     │           │           │           │           │           │
     │           │           │ getLevel()│           │           │
     │           │           │──────────►│           │           │
     │           │           │           │           │           │
     │           │           │◄──────────│ level     │           │
     │           │           │           │           │           │
     │           │ setCurrentLevel()     │           │           │
     │           │──────────────────────►│           │           │
     │           │           │           │           │           │
     │           │           │           │ initTiles()           │
     │           │           │           │──────────►│           │
     │           │           │           │           │           │
     │           │ startGameLoop()       │           │           │
     │           │──────────────────────────────────►│           │
     │           │           │           │           │           │
     │           │           │           │           │ render()  │
     │           │           │           │           │──────────►│
     │           │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼           ▼
```

### 6.2 格子点击时序图

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  User   │ │InputHdlr│ │GameEngine│ │PuzzleMgr│ │Renderer │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │
     │ touchstart│           │           │           │
     │──────────►│           │           │           │
     │           │           │           │           │
     │           │ getTileAt()           │           │
     │           │──────────────────────►│           │
     │           │           │           │           │
     │           │◄──────────────────────│ tile      │
     │           │           │           │           │
     │           │ handleClick(x, y)     │           │
     │           │──────────►│           │           │
     │           │           │           │           │
     │           │           │ slideTile(tile)       │
     │           │           │──────────►│           │
     │           │           │           │           │
     │           │           │           │ calcTarget│
     │           │           │           │──────────►│
     │           │           │           │           │
     │           │           │           │◄──────────│
     │           │           │           │ position  │
     │           │           │           │           │
     │           │           │           │ checkColl │
     │           │           │           │──────────►│
     │           │           │           │           │
     │           │           │◄──────────│ result    │
     │           │           │           │           │
     │           │◄──────────│ {moved, disappeared}  │
     │           │           │           │           │
     │           │           │ startAnimation()      │
     │           │           │──────────────────────►│
     │           │           │           │           │
     │           │           │           │           │ render()
     │           │           │           │           │──────►
     │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼
```

### 6.3 游戏胜利时序图

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Renderer │ │GameEngine│ │PuzzleMgr│ │LevelMgr │ │ Storage │ │  Page   │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │           │
     │ animationEnd          │           │           │           │
     │──────────►│           │           │           │           │
     │           │           │           │           │           │
     │           │ checkWinCondition()   │           │           │
     │           │──────────►│           │           │           │
     │           │           │           │           │           │
     │           │◄──────────│ true      │           │           │
     │           │           │           │           │           │
     │           │ handleWin()           │           │           │
     │           │──────────►│           │           │           │
     │           │           │           │           │           │
     │           │           │ calcStars()           │           │
     │           │           │──────────►│           │           │
     │           │           │           │           │           │
     │           │           │◄──────────│ stars     │           │
     │           │           │           │           │           │
     │           │           │ completeLevel()       │           │
     │           │           │──────────►│           │           │
     │           │           │           │           │           │
     │           │           │           │ saveProgress()        │
     │           │           │           │──────────────────────►│
     │           │           │           │           │           │
     │           │ emit('win')           │           │           │
     │           │──────────────────────────────────────────────►│
     │           │           │           │           │           │
     │           │           │           │           │ navigateTo│
     │           │           │           │           │ result    │
     │           │           │           │           │──────────►│
     │           │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼           ▼
```

---

## 7. C++集成方案

### 7.1 架构集成图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         C++ 集成架构                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           JavaScript 层                                  │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        LevelManager                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │loadLevel()  │  │validateLevel│  │importLevel()│               │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │ │
│  └─────────┼────────────────┼────────────────┼───────────────────────┘ │
│            │                │                │                          │
└────────────┼────────────────┼────────────────┼──────────────────────────┘
             │                │                │
             ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           WASM Bridge 层                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        WASMModule                                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │   Module    │  │   Memory    │  │   Export    │               │ │
│  │  │   Loader    │  │   Buffer    │  │   Functions │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           C++ 层                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                     PuzzleGenerator                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │generateLevel│  │validateLevel│  │exportToJSON │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      PuzzleSolver                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │ solve()     │  │getSolution()│  │isSolvable() │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 JSON关卡数据格式

```json
{
  "id": 1,
  "name": "第1关",
  "type": "normal",
  "timeLimit": 0,
  "unlocked": true,
  "tiles": [
    {
      "id": "817521_360275",
      "type": "horizontal",
      "unitType": "wolf",
      "gridCol": 3,
      "gridRow": 3,
      "gridColSpan": 2,
      "gridRowSpan": 1,
      "direction": "up_right"
    },
    {
      "id": "876729_335652",
      "type": "horizontal",
      "unitType": "dog",
      "gridCol": 7,
      "gridRow": 7,
      "gridColSpan": 2,
      "gridRowSpan": 1,
      "direction": "down_left"
    }
  ]
}
```

### 7.3 C++ WASM 接口

```cpp
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    char* generateLevel(int levelId, int difficulty);
    
    EMSCRIPTEN_KEEPALIVE
    bool validateLevel(const char* levelJson);
    
    EMSCRIPTEN_KEEPALIVE
    bool checkSolvability(const char* levelJson);
    
    EMSCRIPTEN_KEEPALIVE
    char* solveLevel(const char* levelJson);
}
```

### 7.4 JavaScript WASM 调用

```typescript
class WASMLevelGenerator {
  private module: any;
  
  async init(): Promise<void> {
    this.module = await createPuzzleModule();
  }
  
  generateLevel(levelId: number, difficulty: number): Level {
    const jsonStr = this.module.generateLevel(levelId, difficulty);
    return JSON.parse(jsonStr);
  }
  
  validateLevel(levelJson: string): boolean {
    return this.module.validateLevel(levelJson);
  }
  
  checkSolvability(levelJson: string): boolean {
    return this.module.checkSolvability(levelJson);
  }
}
```

---

## 8. 设计原则遵循

### 8.1 单一职责原则 (SRP)

| 模块 | 单一职责 |
|------|----------|
| GameEngine | 游戏生命周期和循环控制 |
| PuzzleManager | 谜题状态和移动逻辑 |
| LevelManager | 关卡数据和进度管理 |
| Renderer | Canvas渲染和绘制 |
| InputHandler | 触摸事件处理和坐标转换 |
| StorageService | 数据持久化 |

### 8.2 开闭原则 (OCP)

```
扩展点设计：

1. 渲染器扩展
   ┌─────────────┐
   │ IRenderer   │ ◄── 接口
   └──────┬──────┘
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
┌───────────┐ ┌───────────┐
│CanvasRenderer│ │WebGLRenderer│  ◄── 扩展实现
└───────────┘ └───────────┘

2. 存储扩展
   ┌─────────────┐
   │ IStorage    │ ◄── 接口
   └──────┬──────┘
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
┌───────────┐ ┌───────────┐
│LocalStorage│ │CloudStorage│  ◄── 扩展实现
└───────────┘ └───────────┘

3. 关卡加载扩展
   ┌─────────────┐
   │ILevelLoader │ ◄── 接口
   └──────┬──────┘
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
┌───────────┐ ┌───────────┐
│JSONLoader │ │WASMLoader │  ◄── 扩展实现
└───────────┘ └───────────┘
```

### 8.3 依赖倒置原则 (DIP)

```
高层模块                    低层模块
    │                           │
    │ 依赖抽象接口               │
    ▼                           ▼
┌─────────────────────────────────────────┐
│                抽象层                     │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ IRenderer   │  │ IStorage    │       │
│  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────┘
    ▲                           ▲
    │ 实现抽象接口               │
    │                           │
┌───┴───────┐               ┌───┴───────┐
│GameEngine │               │LevelManager│
│ (高层)    │               │ (高层)     │
└───────────┘               └───────────┘

示例：
class GameEngine {
  constructor(
    private renderer: IRenderer,      // 依赖抽象
    private storage: IStorage,        // 依赖抽象
    private puzzleManager: IPuzzleManager  // 依赖抽象
  ) {}
}
```

### 8.4 接口隔离原则 (ISP)

```
接口分离设计：

┌─────────────────────────────────────────────────────────────────────────┐
│                          接口隔离示例                                    │
└─────────────────────────────────────────────────────────────────────────┘

大接口拆分：

┌───────────────────────────────────────┐
│         ILevelManager (大接口)         │
│  - getLevel()                         │
│  - getLevels()                        │
│  - setCurrentLevel()                  │
│  - unlockNextLevel()                  │
│  - completeLevel()                    │
│  - calculateStars()                   │
│  - calculateScore()                   │
│  - getTotalStars()                    │
│  - saveProgress()                     │
│  - loadProgress()                     │
└───────────────────────────────────────┘
                    │
                    ▼ 拆分为
                    │
┌───────────────────┼───────────────────┐
│                   │                   │
▼                   ▼                   ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ILevelReader │ │ILevelWriter │ │ILevelStats  │
│ - getLevel()│ │ - setLevel()│ │ - getStars()│
│ - getLevels │ │ - unlock()  │ │ - getScore()│
└─────────────┘ │ - complete()│ └─────────────┘
                └─────────────┘

客户端只依赖需要的接口：
class GameUI {
  constructor(private levelReader: ILevelReader) {}
  // 只使用读取功能，不依赖写入功能
}

class AdminPanel {
  constructor(private levelWriter: ILevelWriter) {}
  // 只使用写入功能，不依赖读取功能
}
```

---

## 附录

### A. 目录结构

```
game/
├── core/                    # 核心模块
│   ├── GameEngine.js       # 游戏引擎
│   ├── PuzzleManager.js    # 谜题管理器
│   ├── LevelManager.js     # 关卡管理器
│   └── GameStateManager.js # 状态管理器
│
├── renderer/               # 渲染模块
│   ├── Renderer.js        # 渲染器基类
│   ├── CanvasRenderer.js  # Canvas渲染器
│   └── AnimationRenderer.js # 动画渲染器
│
├── input/                  # 输入模块
│   ├── InputHandler.js    # 输入处理器
│   └── CoordinateTransformer.js # 坐标转换器
│
├── storage/                # 存储模块
│   ├── StorageService.js  # 存储服务
│   └── LevelRepository.js # 关卡仓库
│
├── adapter/                # 适配层
│   ├── InputAdapter.js    # 输入适配
│   ├── ScreenAdapter.js   # 屏幕适配
│   ├── StorageAdapter.js  # 存储适配
│   └── CanvasAdapter.js   # Canvas适配
│
├── events/                 # 事件系统
│   └── EventSystem.js     # 事件系统
│
├── constants/              # 常量定义
│   └── constants.js       # 游戏常量
│
├── utils/                  # 工具函数
│   ├── logger.js          # 日志工具
│   └── fileLogger.js      # 文件日志
│
├── wasm/                   # WASM模块
│   └── puzzle.wasm        # C++编译的WASM
│
└── pages/                  # 页面
    ├── index/             # 首页
    ├── level/             # 关卡选择页
    ├── game/              # 游戏页
    └── result/            # 结果页
```

### B. 性能优化建议

1. **对象池**: 格子对象复用，减少GC压力
2. **离屏Canvas**: 预渲染静态元素
3. **脏矩形渲染**: 只重绘变化区域
4. **事件节流**: 触摸事件节流处理
5. **资源预加载**: 图片资源预加载

### C. 测试策略

1. **单元测试**: 各模块独立测试
2. **集成测试**: 模块间协作测试
3. **E2E测试**: 完整游戏流程测试
4. **性能测试**: 帧率和内存监控

---

---

## 9. 快速开始示例

### 9.1 初始化游戏引擎

```javascript
const GameEngine = require('./utils/gameEngine');

const engine = new GameEngine();

engine.on('win', (data) => {
  console.log('恭喜过关!', data);
  wx.navigateTo({ url: `/pages/result/result?stars=${data.stars}&score=${data.score}` });
});

engine.on('lose', (data) => {
  console.log('游戏失败', data);
  wx.navigateTo({ url: '/pages/result/result?status=lose' });
});

engine.on('stateChange', (data) => {
  console.log('状态变化:', data.oldStatus, '->', data.newStatus);
});
```

### 9.2 页面集成示例

```javascript
const GameEngine = require('../../utils/gameEngine');

Page({
  data: {
    levelId: 1,
    elapsedTime: 0,
    isPaused: false
  },
  
  gameEngine: null,
  
  onLoad(options) {
    this.setData({ levelId: parseInt(options.levelId) || 1 });
  },
  
  onReady() {
    this.initGame();
  },
  
  initGame() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        canvas.width = res[0].width;
        canvas.height = res[0].height;
        
        this.gameEngine = new GameEngine();
        this.gameEngine.init(canvas, ctx, canvas.width, canvas.height);
        this.gameEngine.startLevel(this.data.levelId);
        
        this.gameEngine.on('win', this.handleWin.bind(this));
        this.gameEngine.on('lose', this.handleLose.bind(this));
        this.gameEngine.onUpdate = (time) => {
          this.setData({ elapsedTime: Math.floor(time) });
        };
      });
  },
  
  handleTouchStart(e) {
    if (!this.gameEngine) return;
    const touch = e.touches[0];
    this.gameEngine.handleClick(touch.clientX, touch.clientY);
  },
  
  handleWin(data) {
    wx.navigateTo({
      url: `/pages/result/result?stars=${data.stars}&score=${data.score}&status=win`
    });
  },
  
  handleLose(data) {
    wx.navigateTo({
      url: '/pages/result/result?status=lose'
    });
  },
  
  handlePause() {
    this.gameEngine?.pause();
    this.setData({ isPaused: true });
  },
  
  handleResume() {
    this.gameEngine?.resume();
    this.setData({ isPaused: false });
  },
  
  handleReset() {
    this.gameEngine?.reset();
  },
  
  handleUndo() {
    this.gameEngine?.undo();
  },
  
  onUnload() {
    this.gameEngine?.destroy();
  }
});
```

### 9.3 自定义关卡加载

```javascript
const LevelManager = require('./utils/levelManager');

async function loadCustomLevel() {
  const levelManager = new LevelManager();
  await levelManager.init();
  
  const levels = levelManager.getLevels();
  console.log('可用关卡:', levels.length);
  
  const level = levelManager.getLevel(1);
  console.log('关卡信息:', {
    id: level.id,
    name: level.name,
    type: level.type,
    tiles: level.tiles.length,
    wolves: level.getWolfCount()
  });
  
  return level;
}
```

### 9.4 自定义渲染

```javascript
const Renderer = require('./utils/renderer');

class CustomRenderer extends Renderer {
  drawTile(tile, x, y, width, height) {
    super.drawTile(tile, x, y, width, height);
    
    if (tile.unitType === 'dog') {
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = 10;
    }
  }
  
  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
  }
}
```

---

## 10. 性能优化实践

### 10.1 对象池实现

```javascript
class TilePool {
  constructor() {
    this.pool = [];
    this.maxSize = 100;
  }
  
  get(config) {
    if (this.pool.length > 0) {
      const tile = this.pool.pop();
      this.resetTile(tile, config);
      return tile;
    }
    return new Tile(config);
  }
  
  release(tile) {
    if (this.pool.length < this.maxSize) {
      tile.state = UnitState.IDLE;
      tile.animating = false;
      this.pool.push(tile);
    }
  }
  
  resetTile(tile, config) {
    Object.assign(tile, {
      gridCol: config.gridCol,
      gridRow: config.gridRow,
      direction: config.direction,
      state: UnitState.IDLE,
      animating: false,
      opacity: 1
    });
  }
}
```

### 10.2 脏矩形渲染

```javascript
class DirtyRectRenderer extends Renderer {
  constructor() {
    super();
    this.dirtyRects = [];
  }
  
  markDirty(x, y, width, height) {
    this.dirtyRects.push({ x, y, width, height });
  }
  
  render(state) {
    if (this.dirtyRects.length === 0) {
      return;
    }
    
    this.dirtyRects.forEach(rect => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      this.ctx.clip();
      
      this.clear();
      this.drawBackground();
      this.drawTiles(state.tiles);
      
      this.ctx.restore();
    });
    
    this.dirtyRects = [];
  }
}
```

### 10.3 帧率控制

```javascript
class FrameRateController {
  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.frameTime = 1000 / targetFPS;
    this.lastTime = 0;
    this.deltaTime = 0;
  }
  
  shouldRender(timestamp) {
    this.deltaTime = timestamp - this.lastTime;
    
    if (this.deltaTime >= this.frameTime) {
      this.lastTime = timestamp - (this.deltaTime % this.frameTime);
      return true;
    }
    return false;
  }
  
  getDeltaTime() {
    return this.deltaTime / 1000;
  }
}
```

---

## 11. 错误处理

### 11.1 全局错误处理

```javascript
class GameEngine {
  constructor() {
    this.errorHandlers = new Map();
  }
  
  onError(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }
  
  handleError(errorType, error) {
    const handler = this.errorHandlers.get(errorType);
    if (handler) {
      handler(error);
    } else {
      console.error(`Unhandled error [${errorType}]:`, error);
    }
  }
  
  safeExecute(fn, errorType) {
    try {
      return fn();
    } catch (error) {
      this.handleError(errorType, error);
      return null;
    }
  }
}
```

### 11.2 错误类型定义

```javascript
const ErrorType = {
  CANVAS_INIT: 'CANVAS_INIT',
  LEVEL_LOAD: 'LEVEL_LOAD',
  TILE_SLIDE: 'TILE_SLIDE',
  STATE_CHANGE: 'STATE_CHANGE',
  STORAGE: 'STORAGE'
};
```

---

## 12. 调试工具

### 12.1 性能监控

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      updateTime: 0,
      renderTime: 0
    };
    this.frames = 0;
    this.lastTime = performance.now();
  }
  
  beginFrame() {
    this.frameStart = performance.now();
  }
  
  endFrame() {
    const now = performance.now();
    this.frames++;
    
    if (now - this.lastTime >= 1000) {
      this.metrics.fps = this.frames;
      this.metrics.frameTime = (now - this.lastTime) / this.frames;
      this.frames = 0;
      this.lastTime = now;
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

### 12.2 状态调试器

```javascript
class StateDebugger {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.history = [];
    this.maxHistory = 100;
    
    stateManager.subscribe((oldState, newState) => {
      this.recordChange(oldState, newState);
    });
  }
  
  recordChange(oldState, newState) {
    this.history.push({
      timestamp: Date.now(),
      oldState: { ...oldState },
      newState: { ...newState }
    });
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }
  
  getHistory() {
    return this.history;
  }
  
  exportHistory() {
    return JSON.stringify(this.history, null, 2);
  }
}
```

---

**文档版本**: v2.0  
**创建日期**: 2026-02-28  
**最后更新**: 2026-02-28  
**维护者**: 开发团队
