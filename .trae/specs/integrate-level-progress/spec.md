# 整合关卡系统与进度保存 Spec

## Why
当前项目已有20个预生成的关卡数据（在 `simulation_json` 目录），但关卡页和游戏页没有正确整合这些关卡数据，且缺少完整的进度保存功能，导致用户无法保存通关进度，每次都要从头开始游戏。

## What Changes
- **app.js**: 实现 `loadGameProgress` 和 `saveGameProgress` 方法，集成 StorageService
- **关卡页 (level)**: 整合 LevelManager 加载20个关卡，显示正确的解锁状态
- **游戏页 (game)**: 使用 LevelManager 加载关卡数据，通关后正确保存进度
- **过关页 (result)**: 完善通关后解锁下一关的逻辑

## Impact
- Affected specs: 关卡系统、进度存储
- Affected code: 
  - `game/app.js` - 应用入口
  - `game/pages/level/level.js` - 关卡页
  - `game/pages/game/game.js` - 游戏页
  - `game/pages/result/result.js` - 过关页
  - `game/utils/levelManager.js` - 关卡管理器

## ADDED Requirements

### Requirement: 进度持久化存储
系统应提供完整的游戏进度存储功能：

#### Scenario: 加载游戏进度
- **WHEN** 用户打开游戏
- **THEN** 系统从本地存储加载用户进度
- **AND** 显示已解锁的关卡
- **AND** 显示每个关卡的星级和分数

#### Scenario: 保存游戏进度
- **WHEN** 用户通关一个关卡
- **THEN** 系统保存关卡完成状态
- **AND** 解锁下一关卡
- **AND** 更新总分数和星级

### Requirement: 关卡解锁机制
系统应实现关卡解锁机制：

#### Scenario: 首次游戏
- **WHEN** 用户首次进入游戏
- **THEN** 只有第1关解锁
- **AND** 其他关卡显示锁定状态

#### Scenario: 通关解锁
- **WHEN** 用户通过第N关
- **THEN** 第N+1关自动解锁
- **AND** 用户可以选择第N+1关或之前已通关的关卡

#### Scenario: 关卡选择
- **WHEN** 用户点击已解锁的关卡
- **THEN** 进入该关卡游戏
- **WHEN** 用户点击未解锁的关卡
- **THEN** 显示"关卡未解锁"提示

### Requirement: 关卡数据加载
系统应从预生成的JSON文件加载关卡数据：

#### Scenario: 加载关卡列表
- **WHEN** 用户进入关卡页
- **THEN** 系统加载 simulation_json/levels.json
- **AND** 显示所有20个关卡

#### Scenario: 加载单个关卡
- **WHEN** 用户开始游戏
- **THEN** 系统加载对应关卡的JSON数据
- **AND** 初始化游戏棋盘

### Requirement: 页面跳转流程
系统应实现完整的页面跳转流程：

#### Scenario: 正常游戏流程
- **WHEN** 用户在主页点击"开始游戏"
- **THEN** 跳转到关卡页
- **WHEN** 用户选择关卡
- **THEN** 跳转到游戏页
- **WHEN** 游戏结束
- **THEN** 跳转到过关页
- **WHEN** 用户点击"下一关"
- **THEN** 跳转到下一关游戏页

## MODIFIED Requirements

### Requirement: 关卡页显示
关卡页需要显示20个关卡，并根据用户进度显示解锁状态：

- 已解锁但未通关：显示关卡编号，绿色背景
- 已通关：显示关卡编号和星级，金色背景
- 未解锁：显示锁定图标，灰色背景
- 当前可玩关卡：显示菜狗标记动画

### Requirement: 过关页保存进度
过关页在通关成功后需要：
- 保存当前关卡完成状态
- 解锁下一关卡
- 更新总分数
- 更新星级记录
