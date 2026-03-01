# 格子移动效果优化规范

## Why

当前游戏存在以下视觉体验问题：
1. **格子移动速度太快**：格子移动动画过快，用户难以跟踪
2. **碰撞没有视觉反馈**：格子碰撞时没有任何效果，用户体验差
3. **方向指示不明确**：格子上的方向箭头不够清晰，用户不知道格子会往哪个方向移动

## What Changes

### 移动速度调整
- 降低格子移动动画的速度
- 增加动画持续时间
- 使用更平滑的缓动函数

### 碰撞效果
- 添加碰撞时的视觉反馈（震动/闪烁）
- 添加碰撞音效（可选）
- 格子碰撞时短暂停顿

### 方向箭头优化
- 使用更明显的箭头图标
- 箭头颜色与格子形成对比
- 箭头大小适中，清晰可见

## Impact

- Affected specs: 格子移动系统、动画系统、渲染系统
- Affected code:
  - `utils/constants.js` - 动画配置
  - `utils/renderer.js` - 方向箭头渲染
  - `utils/puzzleManager.js` - 碰撞处理

## ADDED Requirements

### Requirement: 格子移动速度

系统 SHALL 提供合适的格子移动速度。

#### Scenario: 移动动画持续时间
- **WHEN** 格子开始移动
- **THEN** 动画持续时间应为 300-500ms
- **AND** 使用 easeOutQuad 缓动函数

#### Scenario: 移动速度配置
- **WHEN** 加载游戏配置
- **THEN** ANIMATION_CONFIG.slideDuration 应为 400ms
- **AND** 可通过配置调整

### Requirement: 碰撞视觉反馈

系统 SHALL 提供碰撞视觉反馈。

#### Scenario: 碰撞震动效果
- **WHEN** 格子碰撞到障碍物
- **THEN** 格子应播放震动动画
- **AND** 震动幅度为 3-5 像素
- **AND** 震动持续 100-200ms

#### Scenario: 碰撞闪烁效果
- **WHEN** 格子碰撞到障碍物
- **THEN** 格子边框短暂闪烁红色
- **AND** 闪烁 2-3 次

### Requirement: 方向箭头显示

系统 SHALL 显示清晰的方向箭头。

#### Scenario: 箭头图标
- **WHEN** 渲染格子
- **THEN** 在格子中心显示箭头图标
- **AND** 箭头指向移动方向
- **AND** 箭头颜色为白色或深色（与格子颜色对比）

#### Scenario: 箭头大小
- **WHEN** 格子大小为标准尺寸
- **THEN** 箭头大小应为格子尺寸的 30-40%
- **AND** 箭头清晰可见

## MODIFIED Requirements

### Requirement: 动画配置

**修改内容**:
```javascript
// 旧的配置
ANIMATION_CONFIG = {
  slideDuration: 150,
  ...
}

// 新的配置
ANIMATION_CONFIG = {
  slideDuration: 400,
  shakeDuration: 150,
  shakeAmplitude: 4,
  flashCount: 3,
  ...
}
```

### Requirement: 方向箭头渲染

**修改内容**:
- 使用更大的箭头
- 使用更明显的颜色
- 添加箭头阴影增强可见性
