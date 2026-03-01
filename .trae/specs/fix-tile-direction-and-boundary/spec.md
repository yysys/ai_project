# 格子方向和边界修复规范

## Why

当前游戏存在以下严重问题：
1. **格子方向错误**：所有格子都被分配了4个对角线方向（UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT），但格子应该沿着它"长"的方向移动
   - 横向格子（gridColSpan > 1）应该只能沿水平方向移动（左/右）
   - 纵向格子（gridRowSpan > 1）应该只能沿垂直方向移动（上/下）
2. **菱形背景问题**：屏幕中间绘制了不需要的菱形背景，整个手机屏幕才是边界
3. **边界检测问题**：当前使用的是菱形边界，应该改为矩形屏幕边界

## What Changes

### 方向系统重构
- **BREAKING**: 移除对角线方向（UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT）
- **BREAKING**: 添加水平方向（LEFT, RIGHT）和垂直方向（UP, DOWN）
- 格子方向必须与其形状匹配（横向格子=水平方向，纵向格子=垂直方向）

### 视觉效果修复
- 移除菱形背景绘制
- 使用整个屏幕作为游戏边界
- 保持45度旋转的视觉效果（可选）

### 边界检测修复
- 使用屏幕矩形边界而非菱形边界
- 格子移出屏幕边缘时消失

## Impact

- Affected specs: 格子移动系统、方向系统、边界检测
- Affected code:
  - `utils/constants.js` - 方向定义
  - `utils/puzzleManager.js` - 移动逻辑、关卡生成
  - `utils/renderer.js` - 背景绘制
  - `utils/gameEngine.js` - 边界检测

## ADDED Requirements

### Requirement: 正确的格子方向系统

系统 SHALL 根据格子形状分配正确的移动方向。

#### Scenario: 横向格子方向
- **WHEN** 格子是横向的（gridColSpan > 1）
- **THEN** 格子只能有 LEFT 或 RIGHT 方向
- **AND** 格子沿水平方向直线移动

#### Scenario: 纵向格子方向
- **WHEN** 格子是纵向的（gridRowSpan > 1）
- **THEN** 格子只能有 UP 或 DOWN 方向
- **AND** 格子沿垂直方向直线移动

#### Scenario: 正方形格子方向
- **WHEN** 格子是正方形的（gridColSpan == gridRowSpan）
- **THEN** 格子可以有4个方向之一（UP, DOWN, LEFT, RIGHT）

### Requirement: 屏幕边界系统

系统 SHALL 使用屏幕矩形边界。

#### Scenario: 边界检测
- **WHEN** 格子移动时
- **THEN** 使用屏幕边缘作为边界
- **AND NOT** 使用菱形边界

#### Scenario: 格子消失
- **WHEN** 格子移出屏幕边缘
- **THEN** 格子播放消失动画
- **AND** 菜狗消失触发胜利

### Requirement: 简洁的视觉效果

系统 SHALL 提供简洁的游戏画面。

#### Scenario: 背景渲染
- **WHEN** 游戏开始
- **THEN** 只渲染必要的背景
- **AND NOT** 显示菱形装饰框

## MODIFIED Requirements

### Requirement: 方向定义

**修改内容**:
```javascript
// 旧的方向（对角线）
Direction = {
  UP_LEFT: 'up_left',
  UP_RIGHT: 'up_right',
  DOWN_LEFT: 'down_left',
  DOWN_RIGHT: 'down_right'
}

// 新的方向（直线）
Direction = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
}
```

### Requirement: 方向向量

**修改内容**:
```javascript
// 旧的方向向量（对角线）
DIRECTION_VECTORS = {
  UP_LEFT: { col: -1, row: -1, angle: 225 },
  UP_RIGHT: { col: 1, row: -1, angle: 315 },
  DOWN_LEFT: { col: -1, row: 1, angle: 135 },
  DOWN_RIGHT: { col: 1, row: 1, angle: 45 }
}

// 新的方向向量（直线）
DIRECTION_VECTORS = {
  UP: { col: 0, row: -1, angle: 270 },
  DOWN: { col: 0, row: 1, angle: 90 },
  LEFT: { col: -1, row: 0, angle: 180 },
  RIGHT: { col: 1, row: 0, angle: 0 }
}
```

### Requirement: 关卡生成

**修改内容**:
- 横向格子必须分配 LEFT 或 RIGHT 方向
- 纵向格子必须分配 UP 或 DOWN 方向

## REMOVED Requirements

### Requirement: 菱形边界

**Reason**: 整个手机屏幕才是边界
**Migration**: 移除 `_drawDiamondBoundary()` 方法和 `isPositionInDiamond()` 检测

### Requirement: 对角线移动

**Reason**: 格子应该沿"长"的方向直线移动
**Migration**: 移除对角线方向定义和相关逻辑
