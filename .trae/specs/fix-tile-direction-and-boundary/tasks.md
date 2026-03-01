# Tasks

- [ ] Task 1: 修复方向定义系统
  - [ ] SubTask 1.1: 修改 `constants.js` 中的 Direction 枚举，将对角线方向改为直线方向（UP, DOWN, LEFT, RIGHT）
  - [ ] SubTask 1.2: 修改 `DIRECTION_VECTORS` 映射，更新方向向量和角度
  - [ ] SubTask 1.3: 更新 `getRandomDirection()` 函数使用新方向

- [ ] Task 2: 修复关卡生成逻辑
  - [ ] SubTask 2.1: 修改 `puzzleManager.js` 中的 `generateLevel1Tiles()` 函数
  - [ ] SubTask 2.2: 横向格子分配 LEFT 或 RIGHT 方向
  - [ ] SubTask 2.3: 纵向格子分配 UP 或 DOWN 方向
  - [ ] SubTask 2.4: 修复 `generateLevel2Tiles()` 和 `generateLevel3Tiles()` 函数

- [ ] Task 3: 移除菱形背景
  - [ ] SubTask 3.1: 移除 `renderer.js` 中的 `_drawDiamondBackground()` 调用
  - [ ] SubTask 3.2: 移除 `_drawDiamondBoundary()` 方法
  - [ ] SubTask 3.3: 简化背景绘制逻辑

- [ ] Task 4: 修复边界检测
  - [ ] SubTask 4.1: 移除 `isPositionInDiamond()` 相关调用
  - [ ] SubTask 4.2: 使用屏幕矩形边界进行检测
  - [ ] SubTask 4.3: 确保格子移出屏幕边缘时正确消失

- [ ] Task 5: 更新方向箭头渲染
  - [ ] SubTask 5.1: 修改 `renderer.js` 中的 `_drawTileDirection()` 方法
  - [ ] SubTask 5.2: 使用新的方向角度渲染箭头

- [ ] Task 6: 测试验证
  - [ ] SubTask 6.1: 运行现有测试确保不破坏功能
  - [ ] SubTask 6.2: 手动测试格子移动方向正确
  - [ ] SubTask 6.3: 手动测试边界消失功能正常

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 5] depends on [Task 1]
- [Task 4] depends on [Task 3]
- [Task 6] depends on [Task 1, Task 2, Task 3, Task 4, Task 5]
