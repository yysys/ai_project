# 修复星级系统 Spec

## Why
当前星级计算逻辑基于关卡中的狼数量，这是错误的。狼数量是关卡设计的固定属性，不应该影响星级评定。星级应该反映玩家的游戏表现（如步数、时间等）。

## What Changes
- **levelManager.js**: 修复 `calculateStars` 方法，基于玩家表现计算星级
- **game.js**: 记录玩家游戏过程中的步数和时间
- **result.js**: 传递正确的星级数据到过关页
- **关卡数据**: 为每个关卡添加步数目标（用于星级评定）

## Impact
- Affected specs: 关卡系统、进度存储
- Affected code: 
  - `game/utils/levelManager.js` - 星级计算逻辑
  - `game/pages/game/game.js` - 记录步数和时间
  - `game/pages/result/result.js` - 显示星级
  - `simulation_json/levels.json` - 关卡目标数据

## ADDED Requirements

### Requirement: 基于玩家表现计算星级
系统应根据玩家在游戏中的表现计算星级：

#### Scenario: 步数计算
- **WHEN** 玩家移动一个棋子
- **THEN** 步数计数器增加1

#### Scenario: 星级评定
- **WHEN** 玩家通关
- **THEN** 根据步数与目标步数的比较计算星级
- **AND** 步数少于等于目标步数：3星
- **AND** 步数少于等于目标步数1.5倍：2星
- **AND** 步数少于等于目标步数2倍：1星
- **AND** 否则：1星（保底）

### Requirement: 关卡数据包含目标步数
每个关卡应包含用于星级评定的目标步数：

#### Scenario: 默认目标步数
- **WHEN** 关卡没有配置目标步数
- **THEN** 使用默认值（狼数量 * 2 + 2）

## MODIFIED Requirements

### Requirement: 关卡完成状态保存
保存关卡完成状态时需要包含步数信息：
- 保存星级（1-3星）
- 保存分数
- 保存最佳步数（可选）

## REMOVED Requirements

### Requirement: 基于狼数量计算星级
**Reason**: 狼数量是关卡固定属性，不应影响玩家星级评定
**Migration**: 改为基于玩家实际表现（步数/时间）计算
