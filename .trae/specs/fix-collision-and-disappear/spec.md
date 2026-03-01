# 修复碰撞效果和移动消失问题规范

## Why

当前游戏存在以下问题：
1. **碰撞效果持续时间过长**：配置的 `shakeDuration: 150ms` 没有正确生效，碰撞效果一直持续
2. **格子消失位置错误**：格子移动到网格边界就消失了，但应该移动到手机屏幕边缘才消失

## What Changes

### 碰撞效果修复
- 确保游戏循环对所有格子（包括非移动格子）调用 `updateTileAnimation`
- 或者使用时间戳来控制碰撞效果持续时间

### 移动消失修复
- 格子应该移动超出网格，直到真正移出屏幕可视区域才消失
- 需要计算屏幕边界对应的网格位置
- 格子移动距离应该更远，动画应该持续到格子完全移出屏幕

## Impact

- Affected specs: 碰撞系统、移动动画系统
- Affected code:
  - `utils/puzzleManager.js` - 移动计算、碰撞效果更新
  - `utils/gameEngine.js` - 游戏循环更新
  - `utils/renderer.js` - 屏幕边界计算

## ADDED Requirements

### Requirement: 碰撞效果持续时间

系统 SHALL 正确控制碰撞效果持续时间。

#### Scenario: 碰撞效果自动结束
- **WHEN** 格子发生碰撞
- **THEN** 碰撞效果（震动+闪烁）持续 150ms
- **AND** 效果结束后自动停止

#### Scenario: 非移动格子碰撞效果
- **WHEN** 格子被阻挡无法移动
- **THEN** 碰撞效果仍然能正确更新和结束
- **AND** 不依赖于 `animating` 状态

### Requirement: 格子移动到屏幕边缘消失

系统 SHALL 让格子移动到屏幕边缘才消失。

#### Scenario: 格子移动超出网格
- **WHEN** 格子沿方向移动
- **THEN** 格子应该移动直到完全移出屏幕可视区域
- **AND NOT** 在网格边界就消失

#### Scenario: 移动距离计算
- **WHEN** 计算格子目标位置
- **THEN** 应该计算到屏幕边缘的距离
- **AND** 格子应该移动足够的距离离开屏幕

## MODIFIED Requirements

### Requirement: calculateTargetPosition

**修改内容**:
- 移除 `isValidPosition` 限制
- 让格子可以移动到网格外更远的位置
- 基于屏幕边界而非网格边界计算消失位置

### Requirement: updateTileAnimation

**修改内容**:
- 使用时间戳（`shakeEndTime`）而非倒计时
- 或确保游戏循环对所有格子调用动画更新
