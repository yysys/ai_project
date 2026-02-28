# 抖音小游戏项目重构规范

## Why

项目经过多次迭代，代码繁杂，存在大量bug，主干游戏代码完全不能运行，关卡生成代码无法生成符合要求的关卡。需要进行全面重构，建立清晰的架构和可维护的代码结构。

## What Changes

### 架构重构
- **BREAKING**: 重新设计游戏核心架构，采用模块化设计
- **BREAKING**: 分离游戏逻辑与渲染逻辑
- **BREAKING**: 统一关卡数据格式和加载机制

### 代码清理
- 移除冗余代码和未使用的模块
- 修复所有已知P0/P1级别bug
- 统一代码风格和命名规范

### 关卡系统重构
- **BREAKING**: 重新设计关卡生成算法
- 确保生成的关卡可解
- 优化关卡难度曲线

### 测试体系完善
- 建立完整的单元测试覆盖
- 添加集成测试
- 确保测试通过率达到95%以上

## Impact

- Affected specs: 游戏核心逻辑、关卡系统、渲染系统
- Affected code: 
  - `game/utils/` - 所有核心模块
  - `game/pages/` - 所有页面
  - `simulation/` - 关卡生成器
  - `simulation_json/` - 关卡数据

## ADDED Requirements

### Requirement: 模块化架构设计

系统 SHALL 采用清晰的模块化架构，各模块职责分明。

#### Scenario: 模块独立性
- **WHEN** 游戏引擎初始化
- **THEN** 各模块可独立测试，不依赖其他模块内部实现

#### Scenario: 模块通信
- **WHEN** 模块间需要通信
- **THEN** 通过明确定义的接口进行，不直接访问其他模块内部状态

### Requirement: 游戏核心逻辑修复

系统 SHALL 正确实现游戏核心逻辑，包括移动、碰撞、边界检测。

#### Scenario: 格子移动
- **WHEN** 玩家点击格子
- **THEN** 格子沿预设方向移动，直到碰到障碍物或边界

#### Scenario: 碰撞检测
- **WHEN** 格子移动过程中遇到其他格子
- **THEN** 正确检测碰撞并停止在相邻位置

#### Scenario: 边界处理
- **WHEN** 格子移动到边界
- **THEN** 格子停止在边界内，不消失

#### Scenario: 胜利条件
- **WHEN** 菜狗格子完全移出屏幕边界
- **THEN** 游戏判定为胜利

### Requirement: 关卡生成系统

系统 SHALL 生成可解的关卡，确保玩家可以完成。

#### Scenario: 关卡可解性
- **WHEN** 生成新关卡
- **THEN** 关卡必须存在至少一个解法

#### Scenario: 关卡难度
- **WHEN** 关卡编号增加
- **THEN** 关卡难度逐步提升

#### Scenario: 关卡数据格式
- **WHEN** 关卡数据导出
- **THEN** 数据格式符合游戏引擎加载要求

### Requirement: 渲染系统

系统 SHALL 正确渲染游戏画面，包括棋盘、格子、动画效果。

#### Scenario: 棋盘渲染
- **WHEN** 游戏开始
- **THEN** 正确渲染14x14菱形棋盘

#### Scenario: 格子渲染
- **WHEN** 格子状态变化
- **THEN** 正确渲染格子的位置、方向和类型

#### Scenario: 动画效果
- **WHEN** 格子移动
- **THEN** 播放平滑的移动动画

### Requirement: 用户交互

系统 SHALL 正确响应用户操作。

#### Scenario: 点击检测
- **WHEN** 用户点击屏幕
- **THEN** 正确识别点击的格子

#### Scenario: 撤销功能
- **WHEN** 用户点击撤销按钮
- **THEN** 游戏状态回退到上一步

#### Scenario: 重置功能
- **WHEN** 用户点击重置按钮
- **THEN** 关卡恢复到初始状态

### Requirement: 数据持久化

系统 SHALL 正确保存和加载游戏进度。

#### Scenario: 进度保存
- **WHEN** 用户完成关卡或退出游戏
- **THEN** 保存当前进度到本地存储

#### Scenario: 进度加载
- **WHEN** 用户重新进入游戏
- **THEN** 加载之前保存的进度

### Requirement: 测试覆盖

系统 SHALL 具备完整的测试覆盖。

#### Scenario: 单元测试
- **WHEN** 运行测试套件
- **THEN** 所有测试通过，覆盖率≥90%

#### Scenario: 集成测试
- **WHEN** 运行集成测试
- **THEN** 验证核心游戏流程正常

## MODIFIED Requirements

### Requirement: 游戏引擎

原游戏引擎代码存在多个bug，需要完全重写。

**修改内容**:
- 修复边界检测逻辑
- 修复碰撞检测精度
- 修复胜利条件判断
- 优化动画系统
- 添加状态管理

### Requirement: 关卡管理器

原关卡管理器生成的关卡不可解，需要重新设计。

**修改内容**:
- 集成C++关卡生成器
- 添加关卡可解性验证
- 支持从JSON加载关卡
- 优化关卡解锁逻辑

### Requirement: 抖音API兼容

原代码混用微信和抖音API，需要统一。

**修改内容**:
- 统一使用抖音小游戏API
- 添加API兼容层
- 确保在抖音开发者工具中正常运行

## REMOVED Requirements

### Requirement: 微信小程序页面结构

**Reason**: 抖音小游戏不使用页面结构，采用Canvas渲染
**Migration**: 移除pages目录下的页面文件，改用单一Canvas渲染

### Requirement: 旧的单位系统

**Reason**: 与新的拼图系统冲突
**Migration**: 使用新的Tile系统替代

### Requirement: 冗余的日志系统

**Reason**: fileLogger和logger功能重复
**Migration**: 统一使用单一日志系统
