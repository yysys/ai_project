# Tasks

- [x] Task 1: 修复碰撞效果持续时间
  - [x] SubTask 1.1: 使用时间戳 `shakeEndTime` 替代倒计时 `shakeTime`
  - [x] SubTask 1.2: 在渲染器中检查时间戳决定是否显示效果
  - [x] SubTask 1.3: 确保碰撞效果在 150ms 后自动结束

- [x] Task 2: 修复格子移动到屏幕边缘消失
  - [x] SubTask 2.1: 修改 `calculateTargetPosition` 让格子移动超出网格
  - [x] SubTask 2.2: 计算格子需要移动到屏幕外所需的距离（至少移动 10 格）
  - [x] SubTask 2.3: 修改动画更新逻辑，格子移出足够远后才触发消失

- [x] Task 3: 测试验证
  - [x] SubTask 3.1: 测试碰撞效果 150ms 后结束
  - [x] SubTask 3.2: 测试格子移动到屏幕边缘才消失

# Task Dependencies

- [Task 3] depends on [Task 1, Task 2]
