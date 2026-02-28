# 拯救菜狗 - 抖音小游戏

一款轻松休闲的点击类抖音小游戏，玩家需要点击菜狗，让它沿着对角线方向跑出屏幕边界，同时避开狼群的阻挡。

## 游戏特色

- 简单易上手的点击操作
- 可爱的菜狗角色
- 多样的狼群挑战
- 星级评定系统
- 丰富的关卡设计
- 成就和奖励系统

## 项目结构

```
game/
├── app.js                      # 小程序入口文件
├── app.json                    # 小程序配置文件
├── app.wxss                    # 全局样式文件
├── game.js                     # 游戏入口文件
├── game.json                   # 游戏配置文件
├── package.json                # 项目依赖配置
├── jest.config.js              # Jest测试配置
├── project.config.json         # 项目配置文件
│
├── utils/                      # 核心工具模块
│   ├── constants.js            # 常量定义（方向、类型、状态等）
│   ├── gameEngine.js           # 游戏引擎（主循环、状态管理）
│   ├── puzzleManager.js        # 谜题管理器（格子移动、碰撞检测）
│   ├── levelManager.js         # 关卡管理器（关卡加载、进度管理）
│   ├── gameStateManager.js     # 游戏状态管理器
│   ├── unitManager.js          # 单位管理器
│   ├── inputHandler.js         # 输入处理器（触摸事件）
│   ├── renderer.js             # 渲染器（Canvas绘制）
│   ├── storage.js              # 存储服务
│   ├── unit.js                 # 单位类定义
│   ├── logger.js               # 日志工具
│   ├── fileLogger.js           # 文件日志工具
│   └── tt.js                   # 抖音API适配
│
├── pages/                      # 页面文件
│   ├── index/                  # 主页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── level/                  # 关卡选择页
│   │   ├── level.js
│   │   ├── level.json
│   │   ├── level.wxml
│   │   └── level.wxss
│   ├── game/                   # 游戏页
│   │   ├── game.js
│   │   ├── game.json
│   │   ├── game.wxml
│   │   └── game.wxss
│   └── result/                 # 结果页
│       ├── result.js
│       ├── result.json
│       ├── result.wxml
│       └── result.wxss
│
├── docs/                       # 文档目录
│   └── ARCHITECTURE.md         # 架构设计文档
│
├── tests/                      # 测试文件
│   ├── setup.js                # 测试环境配置
│   ├── constants.test.js       # 常量测试
│   ├── unit.test.js            # 单位类测试
│   ├── unitManager.test.js     # 单位管理器测试
│   ├── levelManager.test.js    # 关卡管理器测试
│   ├── gameStateManager.test.js# 状态管理器测试
│   ├── puzzleManager.test.js   # 谜题管理器测试
│   ├── gameEngine.test.js      # 游戏引擎测试
│   ├── inputHandler.test.js    # 输入处理器测试
│   ├── renderer.test.js        # 渲染器测试
│   ├── storage.test.js         # 存储服务测试
│   ├── boundaryCollision.test.js# 边界碰撞测试
│   └── gridClickMovement.test.js# 格子点击移动测试
│
├── DEV_GUIDE.md                # 开发指南
├── TEST_GUIDE.md               # 测试指南
├── TROUBLESHOOTING.md          # 故障排除指南
├── API_FIXES.md                # API修复记录
└── PROJECT_DELIVERY.md         # 项目交付文档
```

## 核心功能

### 游戏机制

1. **单位系统**
   - 菜狗：主角，位于屏幕中心
   - 狼：敌人，随机分布在周围
   - 每个单位都有预先定义的四个对角线方向之一

2. **跑动机制**
   - 点击单位后，单位会沿着预设方向跑动
   - 四个方向：左上、左下、右上、右下
   - 跑出屏幕边界即消失

3. **胜利条件**
   - 菜狗跑出屏幕边界即获胜

4. **失败条件**
   - 限时关卡中超时

### 关卡系统

- 20个精心设计的关卡
- 多种关卡类型：普通、限时、挑战
- 星级评定系统（1-3星）
- 关卡解锁机制

### 数据持久化

- 游戏进度保存
- 关卡解锁状态
- 最高分记录
- 金币系统

## 技术栈

- **框架**: 微信小程序（兼容抖音小游戏）
- **语言**: JavaScript (ES6+)
- **测试**: Jest
- **渲染**: Canvas 2D

## 安装和运行

### 开发环境要求

- Node.js >= 14.0.0
- 微信开发者工具 或 抖音开发者工具

### 安装依赖

```bash
cd game
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- constants.test.js

# 生成测试覆盖率报告
npm test -- --coverage

# 监听模式
npm test -- --watch
```

### 在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `game` 目录
4. 填写 AppID（可以使用测试号）
5. 点击"导入"

### 在抖音开发者工具中打开

1. 打开抖音开发者工具
2. 选择"导入项目"
3. 选择 `game` 目录
4. 填写 AppID
5. 点击"导入"

## 游戏玩法

1. **开始游戏**
   - 点击主页的"开始游戏"按钮
   - 进入关卡选择页面

2. **选择关卡**
   - 点击已解锁的关卡
   - 查看关卡信息

3. **游戏操作**
   - 点击屏幕上的单位（菜狗或狼）
   - 单位会沿着预设方向跑动
   - 策略性地点击，让菜狗跑出屏幕

4. **胜利条件**
   - 让菜狗跑出屏幕边界
   - 在限时关卡中在规定时间内完成

5. **失败条件**
   - 在限时关卡中超时

## 核心模块说明

### GameEngine（游戏引擎）

游戏的核心引擎，负责：
- 游戏循环管理
- 单位更新和渲染
- 碰撞检测
- 游戏状态管理

```javascript
const GameEngine = require('./utils/gameEngine');
const engine = new GameEngine();

// 初始化
engine.init(canvas, ctx, screenWidth, screenHeight);

// 开始关卡
engine.startLevel(1);

// 处理点击
engine.handleClick(x, y);

// 暂停/继续
engine.pause();
engine.resume();

// 事件监听
engine.on('win', (data) => console.log('胜利!', data));
engine.on('lose', (data) => console.log('失败!', data));
```

### PuzzleManager（谜题管理器）

管理游戏中的谜题状态：
- 格子移动逻辑
- 碰撞检测
- 边界检测
- 胜利条件判断

```javascript
const PuzzleManager = require('./utils/puzzleManager');
const manager = new PuzzleManager();

// 设置当前关卡
manager.setCurrentLevel(1);

// 获取格子
const tiles = manager.getTiles();
const dogTile = manager.getDogTile();

// 移动格子
const result = manager.slideTile(tile);

// 检查胜利条件
if (manager.checkWinCondition()) {
  console.log('胜利!');
}
```

### LevelManager（关卡管理器）

管理关卡系统：
- 关卡生成和配置
- 关卡解锁机制
- 星级评定
- 分数计算

```javascript
const LevelManager = require('./utils/levelManager');
const manager = new LevelManager();

// 初始化
await manager.init();

// 获取关卡
const level = manager.getLevel(1);
const levels = manager.getLevels();

// 完成关卡
manager.completeLevel(stars, score);

// 获取统计
const totalStars = manager.getTotalStars();
const totalScore = manager.getTotalScore();
```

### GameStateManager（游戏状态管理器）

管理游戏状态：
- 状态转换
- 暂停/继续
- 计时器管理
- 事件通知

### Renderer（渲染器）

负责Canvas渲染：
- 背景绘制
- 格子绘制
- 动画渲染
- UI绘制

### InputHandler（输入处理器）

处理用户输入：
- 触摸事件处理
- 坐标转换
- 格子命中测试

## 常量定义

```javascript
const {
  Direction,           // 方向常量
  DIRECTION_VECTORS,   // 方向向量
  TileType,            // 格子类型
  UnitType,            // 单位类型
  UnitState,           // 单位状态
  GameState,           // 游戏状态
  LevelType,           // 关卡类型
  TILE_CONFIG,         // 格子配置
  GAME_CONFIG,         // 游戏配置
  ANIMATION_CONFIG     // 动画配置
} = require('./utils/constants');

// 方向
Direction.UP_LEFT      // 左上
Direction.UP_RIGHT     // 右上
Direction.DOWN_LEFT    // 左下
Direction.DOWN_RIGHT   // 右下

// 单位类型
UnitType.DOG           // 菜狗
UnitType.WOLF          // 狼

// 单位状态
UnitState.IDLE         // 空闲
UnitState.SLIDING      // 滑动中
UnitState.DISAPPEARED  // 已消失
UnitState.FADING_OUT   // 淡出中

// 游戏状态
GameState.IDLE         // 空闲
GameState.PLAYING      // 游戏中
GameState.PAUSED       // 暂停
GameState.WIN          // 胜利
GameState.LOSE         // 失败
```

## 测试

项目包含完整的单元测试：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- constants.test.js

# 生成测试覆盖率报告
npm test -- --coverage
```

### 测试覆盖

- 常量测试：11个
- 单位测试：17个
- 单位管理器测试：23个
- 关卡管理器测试：20个
- 游戏状态管理器测试：25个
- 总计：96个测试用例

## 性能优化

- 对象池技术
- 空间分区
- 帧率控制
- 懒加载

## 开发指南

详细的开发指南请参阅 [DEV_GUIDE.md](./DEV_GUIDE.md)

### 代码规范

- 使用 ES6+ 语法
- 遵循 JavaScript Standard Style
- 每个模块独立测试
- 使用 JSDoc 注释

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 故障排除

常见问题请参阅 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 未来计划

- 添加更多关卡
- 实现成就系统
- 添加音效和背景音乐
- 实现排行榜
- 添加更多角色皮肤
- 实现社交分享功能

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。

---

**文档版本**: v2.0  
**最后更新**: 2026-02-28  
**维护者**: 开发团队
