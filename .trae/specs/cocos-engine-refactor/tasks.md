# Tasks

- [x] Task 1: 创建Cocos Creator项目结构
  - [x] SubTask 1.1: 在game-cocos目录创建Cocos Creator 3.x项目
  - [x] SubTask 1.2: 配置TypeScript编译环境
  - [x] SubTask 1.3: 设置抖音小游戏构建选项
  - [x] SubTask 1.4: 创建基础目录结构（scripts, scenes, resources）

- [x] Task 2: 实现核心游戏场景
  - [x] SubTask 2.1: 创建GameScene场景文件
  - [x] SubTask 2.2: 设计14x14网格布局系统
  - [x] SubTask 2.3: 实现坐标转换工具（网格坐标 <-> 世界坐标）
  - [x] SubTask 2.4: 创建Camera和Canvas配置

- [x] Task 3: 实现格子（Tile）系统
  - [x] SubTask 3.1: 创建Tile组件（Component）
  - [x] SubTask 3.2: 实现格子类型定义（horizontal/vertical/dog/wolf）
  - [x] SubTask 3.3: 实现格子预制体（Prefab）
  - [x] SubTask 3.4: 实现格子的8个方向移动逻辑

- [x] Task 4: 实现移动和动画系统
  - [x] SubTask 4.1: 使用Cocos Tween实现移动动画
  - [x] SubTask 4.2: 实现直线移动算法
  - [x] SubTask 4.3: 实现移动结束的回调处理
  - [x] SubTask 4.4: 添加移动日志输出（包含坐标）

- [x] Task 5: 实现碰撞检测系统
  - [x] SubTask 5.1: 实现网格碰撞检测算法
  - [x] SubTask 5.2: 格子碰撞时停止在相邻位置
  - [x] SubTask 5.3: 实现碰撞震动动画效果
  - [x] SubTask 5.4: 输出碰撞日志

- [x] Task 6: 实现边界处理
  - [x] SubTask 6.1: 检测格子移出屏幕边界
  - [x] SubTask 6.2: 实现格子消失动画
  - [x] SubTask 6.3: 菜狗移出边界触发胜利
  - [x] SubTask 6.4: 其他格子移出边界直接消失

- [x] Task 7: 实现触摸交互系统
  - [x] SubTask 7.1: 使用Cocos EventTouch处理触摸
  - [x] SubTask 7.2: 实现触摸点转换到网格坐标
  - [x] SubTask 7.3: 检测点击的格子
  - [x] SubTask 7.4: 触发格子移动

- [x] Task 8: 实现关卡管理系统
  - [x] SubTask 8.1: 创建LevelManager组件
  - [x] SubTask 8.2: 从JSON加载关卡数据
  - [x] SubTask 8.3: 实例化关卡格子
  - [x] SubTask 8.4: 实现撤销和重置功能

- [x] Task 9: 实现UI系统
  - [x] SubTask 9.1: 创建游戏UI Canvas
  - [x] SubTask 9.2: 实现关卡标题显示
  - [x] SubTask 9.3: 实现撤销/提示/重置按钮
  - [x] SubTask 9.4: 实现胜利/失败弹窗

- [x] Task 10: 实现日志系统
  - [x] SubTask 10.1: 创建Logger工具类
  - [x] SubTask 10.2: 输出格子移动坐标日志
  - [x] SubTask 10.3: 输出碰撞检测日志
  - [x] SubTask 10.4: 输出触摸坐标日志

- [x] Task 11: 适配抖音小游戏平台
  - [x] SubTask 11.1: 配置抖音小游戏构建选项
  - [x] SubTask 11.2: 适配tt API调用
  - [x] SubTask 11.3: 测试在抖音开发者工具中运行
  - [x] SubTask 11.4: 优化性能和包体大小

- [x] Task 12: 迁移关卡数据
  - [x] SubTask 12.1: 将现有关卡JSON转换为Cocos资源
  - [x] SubTask 12.2: 放置到resources/levels目录
  - [x] SubTask 12.3: 测试关卡加载
  - [x] SubTask 12.4: 验证至少20个关卡可玩

- [x] Task 13: 清理旧代码
  - [x] SubTask 13.1: 保留原game目录作为备份
  - [x] SubTask 13.2: 确保新项目在game-cocos目录完整
  - [x] SubTask 13.3: 更新项目文档

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 3]
- [Task 6] depends on [Task 4]
- [Task 7] depends on [Task 2]
- [Task 8] depends on [Task 3, Task 12]
- [Task 9] depends on [Task 2]
- [Task 10] depends on [Task 1]
- [Task 11] depends on [Task 2, Task 3, Task 4, Task 5, Task 6, Task 7, Task 8, Task 9]
- [Task 12] depends on [Task 1]
- [Task 13] depends on [Task 11]
