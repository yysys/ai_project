# 拯救菜狗 (Save Vegetable Dog)

一款轻松休闲的抖音小游戏，玩家需要通过策略性点击，让菜狗跑出屏幕边界以获得胜利。

## 项目简介

"拯救菜狗"是一款基于抖音小程序平台的休闲益智类点击游戏。游戏场景中有一个菜狗和多只狼，每个单位都有预设的跑动方向。玩家点击单位后，该单位会沿对角线方向跑动。游戏目标是通过合理的点击顺序，让菜狗成功跑出屏幕边界。

## 功能特性

- 休闲益智的点击玩法
- 可爱的卡通画风
- 策略性关卡设计
- 多章节关卡系统
- 星级评定和计分系统
- 游戏进度保存

## 目录结构

```
.
├── game/                    # 游戏主目录
│   ├── game.js              # 游戏入口文件
│   ├── utils/               # 核心工具模块
│   │   ├── gameEngine.js    # 游戏引擎
│   │   ├── puzzleManager.js # 谜题管理器
│   │   ├── renderer.js      # 渲染引擎
│   │   ├── levelManager.js  # 关卡管理器
│   │   ├── inputHandler.js  # 输入处理
│   │   ├── gameStateManager.js # 状态管理
│   │   ├── constants.js     # 常量定义
│   │   ├── logger.js        # 日志系统
│   │   ├── storage.js       # 存储管理
│   │   └── tt.js            # 抖音API封装
│   ├── pages/               # 页面文件
│   ├── assets/              # 游戏资源
│   └── package.json         # 依赖配置
├── game_test/               # 测试套件
│   └── *.test.js            # Jest测试文件
├── simulation/              # C++关卡生成器
├── difficulty_test/         # C++难度分析器
├── simulation_json/         # JSON关卡数据
├── docs/                    # 项目文档
│   ├── 产品文档.md
│   ├── 游戏机制.md
│   └── 设计规范.md
├── debug/                   # 调试输出目录
└── test-results/            # 测试结果目录
```

## 技术栈

- **平台**: 抖音小程序 / 微信小程序
- **语言**: JavaScript ES6+
- **渲染**: Canvas 2D
- **测试**: Jest
- **关卡生成**: C++ (BFS/DFS算法)

## 安装指南

### 前置要求

- Node.js 14+
- npm 或 yarn

### 安装依赖

```bash
cd game
npm install
```

## 使用方法

### 开发模式

在抖音开发者工具中打开项目目录即可预览和调试。

### 运行测试

```bash
cd game
npm test                # 运行所有测试
npm run test:coverage   # 运行测试并生成覆盖率报告
npm run test:verbose    # 详细模式运行测试
```

### 关卡生成

使用C++工具生成新关卡：

```bash
cd simulation
# 编译并运行关卡生成器
```

## 游戏玩法

1. **基本操作**: 点击屏幕上的单位（菜狗或狼）
2. **跑动规则**: 单位会沿预设的对角线方向跑动（左上、左下、右上、右下）
3. **胜利条件**: 让菜狗跑出屏幕边界
4. **策略要点**: 需要合理规划点击顺序，避免狼阻挡菜狗的路径

## 开发指南

### 核心模块说明

| 模块 | 说明 |
|------|------|
| GameEngine | 游戏主引擎，负责游戏循环、事件系统、状态管理 |
| PuzzleManager | 谜题逻辑管理，处理单位移动、碰撞检测 |
| Renderer | Canvas渲染引擎，负责绘制游戏画面 |
| LevelManager | 关卡加载和进度管理 |
| GameStateManager | 游戏状态机管理 |

### 添加新关卡

1. 在 `simulation_json/` 目录下添加关卡JSON文件
2. 运行测试验证关卡可解性
3. 在关卡管理器中注册新关卡

## 测试

项目使用Jest进行单元测试，测试覆盖以下内容：

- 游戏机制测试
- 谜题管理器测试
- 状态管理测试
- 关卡管理测试
- 单元移动测试

## 文档

详细文档请参阅 `docs/` 目录：

- [产品文档](docs/产品文档.md) - 产品需求和UI设计
- [游戏机制](docs/游戏机制.md) - 核心玩法和算法说明
- [设计规范](docs/设计规范.md) - 视觉设计规范

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

---

**版本**: 1.0.0
**最后更新**: 2026-03-01
