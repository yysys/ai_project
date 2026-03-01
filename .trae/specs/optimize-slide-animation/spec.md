# 优化格子移动动画顺滑度规范

## Why

当前格子移动动画不够顺滑，用户体验不佳。问题包括：
1. 动画时间固定，不随移动距离调整（移动 10 格和移动 1 格时间相同）
2. 缓动函数可能不够平滑
3. 动画帧率可能不稳定

## What Changes

### 动画时间动态调整
- 根据移动距离动态计算动画时间
- 移动距离越远，动画时间越长
- 设置最小和最大动画时间限制

### 缓动函数优化
- 使用更平滑的缓动函数（如 easeInOutCubic）
- 或者使用 CSS 标准的 ease-out

### 帧率优化
- 使用 requestAnimationFrame 确保帧率稳定
- 确保 deltaTime 计算准确

## Impact

- Affected specs: 格子移动动画系统
- Affected code:
  - `utils/constants.js` - 动画配置
  - `utils/puzzleManager.js` - 动画更新逻辑

## ADDED Requirements

### Requirement: 动态动画时间

系统 SHALL 根据移动距离动态调整动画时间。

#### Scenario: 短距离移动
- **WHEN** 格子移动 1-3 格
- **THEN** 动画时间为 300-400ms

#### Scenario: 中距离移动
- **WHEN** 格子移动 4-7 格
- **THEN** 动画时间为 400-600ms

#### Scenario: 长距离移动
- **WHEN** 格子移动 8+ 格
- **THEN** 动画时间为 600-800ms

### Requirement: 平滑缓动函数

系统 SHALL 使用平滑的缓动函数。

#### Scenario: 移动开始
- **WHEN** 动画开始时
- **THEN** 格子缓慢加速

#### Scenario: 移动结束
- **WHEN** 动画接近结束时
- **THEN** 格子缓慢减速停止

## MODIFIED Requirements

### Requirement: 动画配置

**修改内容**:
```javascript
// 旧的配置
ANIMATION_CONFIG = {
  slideDuration: 400,
  ...
}

// 新的配置
ANIMATION_CONFIG = {
  minSlideDuration: 300,
  maxSlideDuration: 800,
  durationPerTile: 50,  // 每格增加 50ms
  ...
}
```

### Requirement: 缓动函数

**修改内容**:
```javascript
// 使用 easeInOutCubic 替代 easeOutQuad
easeInOutCubic(t) {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```
