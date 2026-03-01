# Tasks

- [x] Task 1: 优化动画配置
  - [x] SubTask 1.1: 在 `constants.js` 添加动态时间配置（minSlideDuration, maxSlideDuration, durationPerTile）
  - [x] SubTask 1.2: 移除固定的 slideDuration 配置

- [x] Task 2: 实现动态动画时间计算
  - [x] SubTask 2.1: 在 `puzzleManager.js` 添加动态计算 slideDuration
  - [x] SubTask 2.2: 根据移动距离计算动画时间
  - [x] SubTask 2.3: 在 slideTile 中使用动态计算的时间

- [x] Task 3: 优化缓动函数
  - [x] SubTask 3.1: 将 `easeOutQuad` 替换为 `easeInOutCubic`
  - [x] SubTask 3.2: 确保 easeInOutCubic 实现正确

- [x] Task 4: 测试验证
  - [x] SubTask 4.1: 测试短距离移动动画
  - [x] SubTask 4.2: 测试长距离移动动画
  - [x] SubTask 4.3: 验证动画顺滑度

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 4] depends on [Task 1, Task 2, Task 3]
