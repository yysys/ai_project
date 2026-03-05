# Tasks

- [x] Task 1: 在 app.js 中实现进度管理方法
  - [x] 1.1 引入 StorageService 模块
  - [x] 1.2 实现 loadGameProgress 方法
  - [x] 1.3 实现 saveGameProgress 方法
  - [x] 1.4 在 onLaunch 中初始化存储服务

- [x] Task 2: 整合 LevelManager 到关卡页
  - [x] 2.1 引入 LevelManager 替代 PuzzleManager
  - [x] 2.2 加载 simulation_json/levels.json 中的20个关卡
  - [x] 2.3 根据用户进度设置关卡解锁状态
  - [x] 2.4 显示当前可玩关卡的菜狗标记

- [x] Task 3: 整合 LevelManager 到游戏页
  - [x] 3.1 使用 LevelManager 加载关卡数据
  - [x] 3.2 正确初始化游戏棋盘
  - [x] 3.3 通关后调用进度保存方法

- [x] Task 4: 完善过关页进度保存逻辑
  - [x] 4.1 保存关卡完成状态和星级
  - [x] 4.2 解锁下一关卡
  - [x] 4.3 更新总分数和金币

- [x] Task 5: 测试完整游戏流程
  - [x] 5.1 测试首次游戏（只有第1关解锁）
  - [x] 5.2 测试通关后解锁下一关
  - [x] 5.3 测试进度持久化（关闭重开仍保留进度）
  - [x] 5.4 测试页面跳转流程

# Task Dependencies
- [Task 1] 应首先完成，其他任务依赖进度管理方法
- [Task 2], [Task 3], [Task 4] 可以并行执行
- [Task 5] 在所有任务完成后执行
