# Cocos引擎重构抖音小游戏规范

## Why

当前项目使用自定义WXML渲染，存在多个严重问题：
- 格子点击后无法正确移动或移动方向错误
- 缺少移动动画和碰撞效果
- 存在不需要的菱形背景
- 日志系统缺少坐标输出
- 整体游戏体验不符合预期

需要使用Cocos Creator引擎完全重构，利用其专业的游戏引擎能力解决这些问题。

## What Changes

### 技术栈迁移
- **BREAKING**: 从WXML自定义渲染迁移到Cocos Creator引擎
- **BREAKING**: 使用Cocos的Scene、Node、Sprite系统
- **BREAKING**: 使用Cocos的动画系统替代自定义动画
- **BREAKING**: 使用Cocos的触摸事件系统

### 游戏功能修复
- 实现正确的格子直线移动逻辑
- 添加平滑的移动动画
- 实现真实的碰撞检测和停止效果
- 移除不必要的背景元素
- 完善日志输出（包含坐标信息）

### 项目结构重组
- 创建标准Cocos项目结构
- 迁移关卡数据到Cocos资源系统
- 使用TypeScript重构所有代码

## Impact

- Affected specs: 游戏核心逻辑、渲染系统、动画系统、事件系统
- Affected code: 
  - 整个`game/`目录需要重建
  - 所有游戏逻辑需要用TypeScript重写
  - 关卡数据格式需要适配Cocos

## ADDED Requirements

### Requirement: Cocos Creator项目结构

系统 SHALL 采用标准Cocos Creator项目结构。

#### Scenario: 项目初始化
- **WHEN** 创建新项目
- **THEN** 使用Cocos Creator 3.x模板，包含标准目录结构

#### Scenario: 资源管理
- **WHEN** 加载游戏资源
- **THEN** 使用Cocos的resources系统动态加载

### Requirement: 格子移动系统

系统 SHALL 实现正确的格子直线移动。

#### Scenario: 点击移动
- **WHEN** 玩家点击格子
- **THEN** 格子沿其预设方向（上下左右或对角线）直线移动

#### Scenario: 移动停止
- **WHEN** 移动中的格子遇到其他格子
- **THEN** 格子停止在碰撞位置，产生撞击效果

#### Scenario: 边界消失
- **WHEN** 格子移出屏幕边界
- **THEN** 格子平滑消失（菜狗胜利，其他格子消失）

### Requirement: 动画系统

系统 SHALL 使用Cocos引擎的动画系统。

#### Scenario: 移动动画
- **WHEN** 格子移动
- **THEN** 播放平滑的移动动画，使用tween系统

#### Scenario: 碰撞动画
- **WHEN** 格子碰撞停止
- **THEN** 播放撞击震动效果

#### Scenario: 消失动画
- **WHEN** 格子移出边界
- **THEN** 播放淡出动画

### Requirement: 坐标系统

系统 SHALL 使用Cocos的世界坐标系统。

#### Scenario: 坐标转换
- **WHEN** 处理格子位置
- **THEN** 正确转换网格坐标到世界坐标

#### Scenario: 触摸检测
- **WHEN** 玩家触摸屏幕
- **THEN** 正确转换触摸点到格子坐标

### Requirement: 日志系统

系统 SHALL 输出详细的坐标日志。

#### Scenario: 移动日志
- **WHEN** 格子移动
- **THEN** 输出起点坐标、终点坐标、移动方向

#### Scenario: 碰撞日志
- **WHEN** 格子碰撞
- **THEN** 输出碰撞位置和碰撞对象

### Requirement: 视觉效果

系统 SHALL 提供清晰的游戏画面。

#### Scenario: 背景渲染
- **WHEN** 游戏开始
- **THEN** 只渲染必要的背景，不显示菱形框等装饰

#### Scenario: 格子渲染
- **WHEN** 渲染格子
- **THEN** 清晰显示格子类型、方向、图片

### Requirement: 抖音小游戏适配

系统 SHALL 适配抖音小游戏平台。

#### Scenario: 引擎适配
- **WHEN** 构建项目
- **THEN** 正确导出为抖音小游戏格式

#### Scenario: API调用
- **WHEN** 需要平台功能
- **THEN** 使用抖音小游戏API（tt.xxx）

## MODIFIED Requirements

### Requirement: 关卡数据格式

原有关卡数据需要适配Cocos引擎。

**修改内容**:
- 保持JSON格式不变
- 坐标系统适配Cocos
- 添加Cocos所需的元数据

### Requirement: 游戏状态管理

使用Cocos的组件系统管理状态。

**修改内容**:
- 使用Cocos Component管理游戏状态
- 使用Cocos Event系统处理事件
- 使用Cocos Node管理游戏对象

## REMOVED Requirements

### Requirement: WXML页面结构

**Reason**: Cocos引擎使用Canvas渲染，不需要WXML
**Migration**: 移除所有pages目录下的wxml/wxss文件

### Requirement: 自定义动画系统

**Reason**: 使用Cocos内置动画系统
**Migration**: 移除renderer.js中的自定义动画代码

### Requirement: 自定义渲染器

**Reason**: Cocos引擎提供专业渲染能力
**Migration**: 移除renderer.js，使用Cocos渲染系统
