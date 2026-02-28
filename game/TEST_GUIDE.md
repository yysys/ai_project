# 测试指南 - 拯救菜狗

## 目录

1. [测试概述](#测试概述)
2. [测试环境配置](#测试环境配置)
3. [运行测试](#运行测试)
4. [测试覆盖率](#测试覆盖率)
5. [测试用例说明](#测试用例说明)
6. [编写测试](#编写测试)
7. [持续集成](#持续集成)

---

## 测试概述

### 测试状态

- **总测试数**: 96
- **通过数**: 96
- **失败数**: 0
- **通过率**: 100%
- **执行时间**: ~2.4秒

### 测试类型

| 类型 | 数量 | 说明 |
|------|------|------|
| 单元测试 | 96 | 测试单个模块和函数 |
| 集成测试 | - | 测试模块间协作 |
| E2E测试 | - | 测试完整游戏流程 |

---

## 测试环境配置

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
cd game
npm install
```

### Jest 配置

项目使用 Jest 作为测试框架，配置文件 `jest.config.js`：

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    '!utils/logger.js',
    '!utils/fileLogger.js',
    '!utils/tt.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
npm test -- constants.test.js
npm test -- levelManager.test.js
npm test -- puzzleManager.test.js
```

### 运行匹配模式的测试

```bash
npm test -- --testNamePattern="should create"
npm test -- --testNamePattern="Level"
```

### 监听模式

```bash
npm test -- --watch
```

### 生成测试覆盖率报告

```bash
npm test -- --coverage
```

覆盖率报告会生成在 `coverage/` 目录下：
- `coverage/lcov-report/index.html` - HTML报告
- `coverage/lcov.info` - LCOV格式报告

### 详细输出

```bash
npm test -- --verbose
```

---

## 测试覆盖率

### 覆盖率要求

| 指标 | 最低要求 | 目标 |
|------|----------|------|
| 分支覆盖率 (Branches) | 70% | 80% |
| 函数覆盖率 (Functions) | 80% | 90% |
| 行覆盖率 (Lines) | 80% | 90% |
| 语句覆盖率 (Statements) | 80% | 90% |

### 核心模块覆盖率要求

| 模块 | 最低覆盖率 |
|------|------------|
| constants.js | 100% |
| gameEngine.js | 80% |
| puzzleManager.js | 80% |
| levelManager.js | 80% |
| gameStateManager.js | 80% |
| unitManager.js | 80% |
| renderer.js | 70% |
| inputHandler.js | 70% |
| storage.js | 70% |

### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm test -- --coverage

# 打开HTML报告（macOS）
open coverage/lcov-report/index.html

# 打开HTML报告（Windows）
start coverage/lcov-report/index.html

# 打开HTML报告（Linux）
xdg-open coverage/lcov-report/index.html
```

---

## 测试用例说明

### 1. 常量测试 (constants.test.js)

测试数量：11个

```javascript
describe('Constants', () => {
  describe('Direction', () => {
    test('should have UP_LEFT direction', () => {
      expect(Direction.UP_LEFT).toBe('up_left');
    });
    // ... 其他方向测试
  });
  
  describe('DIRECTION_VECTORS', () => {
    test('should have correct vector for UP_LEFT', () => {
      expect(DIRECTION_VECTORS[Direction.UP_LEFT]).toEqual({
        col: -1, row: -1, angle: 225
      });
    });
    // ... 其他向量测试
  });
  
  describe('Helper Functions', () => {
    test('getRandomDirection should return valid direction', () => {
      const direction = getRandomDirection();
      expect(Object.values(Direction)).toContain(direction);
    });
    
    test('generateId should return unique id', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
```

### 2. 单位测试 (unit.test.js)

测试数量：17个

```javascript
describe('Unit', () => {
  describe('Tile', () => {
    test('should create tile with default values', () => {
      const tile = new Tile({ gridCol: 1, gridRow: 1 });
      expect(tile.type).toBe(TileType.HORIZONTAL);
      expect(tile.unitType).toBe(UnitType.WOLF);
      expect(tile.state).toBe(UnitState.IDLE);
    });
    
    test('should create tile with custom values', () => {
      const tile = new Tile({
        type: TileType.VERTICAL,
        unitType: UnitType.DOG,
        gridCol: 5,
        gridRow: 5,
        direction: Direction.UP_LEFT
      });
      expect(tile.type).toBe(TileType.VERTICAL);
      expect(tile.unitType).toBe(UnitType.DOG);
    });
    
    test('should clone tile correctly', () => {
      const tile = new Tile({ gridCol: 1, gridRow: 1 });
      const cloned = tile.clone();
      expect(cloned.gridCol).toBe(tile.gridCol);
      expect(cloned.id).toBe(tile.id);
    });
  });
});
```

### 3. 单位管理器测试 (unitManager.test.js)

测试数量：23个

```javascript
describe('UnitManager', () => {
  describe('createUnit', () => {
    test('should create dog unit', () => {
      const unit = unitManager.createUnit(UnitType.DOG, 7, 7);
      expect(unit.unitType).toBe(UnitType.DOG);
      expect(unit.gridCol).toBe(7);
      expect(unit.gridRow).toBe(7);
    });
    
    test('should create wolf unit', () => {
      const unit = unitManager.createUnit(UnitType.WOLF, 3, 3);
      expect(unit.unitType).toBe(UnitType.WOLF);
    });
  });
  
  describe('handleClick', () => {
    test('should return null if no unit at position', () => {
      const result = unitManager.handleClick(0, 0);
      expect(result).toBeNull();
    });
    
    test('should return unit if clicked', () => {
      const unit = unitManager.createUnit(UnitType.DOG, 7, 7);
      const result = unitManager.handleClick(7, 7);
      expect(result).toBe(unit);
    });
  });
});
```

### 4. 关卡管理器测试 (levelManager.test.js)

测试数量：20个

```javascript
describe('LevelManager', () => {
  describe('getLevel', () => {
    test('should return level by id', async () => {
      await levelManager.init();
      const level = levelManager.getLevel(1);
      expect(level).toBeDefined();
      expect(level.id).toBe(1);
    });
    
    test('should return null for invalid id', () => {
      const level = levelManager.getLevel(999);
      expect(level).toBeNull();
    });
  });
  
  describe('completeLevel', () => {
    test('should complete level and unlock next', () => {
      levelManager.setCurrentLevel(1);
      const nextLevel = levelManager.completeLevel(3, 1000);
      expect(nextLevel).toBeDefined();
      expect(nextLevel.unlocked).toBe(true);
    });
  });
  
  describe('calculateStars', () => {
    test('should return 3 stars for fast completion', () => {
      const level = { type: 'timed', timeLimit: 30 };
      const stars = levelManager.calculateStars(level, 10);
      expect(stars).toBe(3);
    });
  });
});
```

### 5. 游戏状态管理器测试 (gameStateManager.test.js)

测试数量：25个

```javascript
describe('GameStateManager', () => {
  describe('getState', () => {
    test('should return initial state', () => {
      const state = stateManager.getState();
      expect(state.status).toBe(GameState.IDLE);
    });
  });
  
  describe('setState', () => {
    test('should update state', () => {
      stateManager.setState({ status: GameState.PLAYING });
      expect(stateManager.getState().status).toBe(GameState.PLAYING);
    });
  });
  
  describe('subscribe', () => {
    test('should notify listeners on state change', () => {
      const listener = jest.fn();
      stateManager.subscribe(listener);
      stateManager.setState({ status: GameState.PLAYING });
      expect(listener).toHaveBeenCalled();
    });
  });
});
```

### 6. 谜题管理器测试 (puzzleManager.test.js)

测试数量：若干

```javascript
describe('PuzzleManager', () => {
  describe('slideTile', () => {
    test('should slide tile in correct direction', () => {
      puzzleManager.setCurrentLevel(1);
      const tile = puzzleManager.getTiles()[0];
      const result = puzzleManager.slideTile(tile);
      expect(result.moved).toBe(true);
    });
    
    test('should not slide if blocked', () => {
      // 测试被阻挡的情况
    });
  });
  
  describe('checkCollision', () => {
    test('should detect collision', () => {
      // 测试碰撞检测
    });
  });
  
  describe('checkWinCondition', () => {
    test('should return true when dog disappears', () => {
      // 测试胜利条件
    });
  });
});
```

### 7. 边界碰撞测试 (boundaryCollision.test.js)

```javascript
describe('Boundary Collision', () => {
  test('should detect diamond boundary correctly', () => {
    // 测试菱形边界检测
  });
  
  test('should handle edge cases', () => {
    // 测试边缘情况
  });
});
```

### 8. 格子点击移动测试 (gridClickMovement.test.js)

```javascript
describe('Grid Click Movement', () => {
  test('should move tile on click', () => {
    // 测试点击移动
  });
  
  test('should handle coordinate transformation', () => {
    // 测试坐标转换
  });
});
```

---

## 编写测试

### 测试文件命名规范

- 测试文件放在 `tests/` 目录
- 文件名格式：`<模块名>.test.js`
- 例如：`levelManager.test.js`

### 测试用例命名规范

使用描述性的测试名称：

```javascript
// 好的命名
test('should return null when level not found', () => {});
test('should unlock next level after completion', () => {});

// 不好的命名
test('test1', () => {});
test('works', () => {});
```

### 测试结构

```javascript
describe('ModuleName', () => {
  describe('methodName', () => {
    test('should do something when condition', () => {
      // Arrange - 准备
      const input = 'test';
      
      // Act - 执行
      const result = module.methodName(input);
      
      // Assert - 断言
      expect(result).toBe('expected');
    });
  });
});
```

### 常用断言

```javascript
// 相等
expect(value).toBe(expected);
expect(value).toEqual(expected);

// 真值
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// 数字
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(20);
expect(value).toBeCloseTo(0.5, 2);

// 字符串
expect(value).toMatch(/pattern/);
expect(value).toContain('substring');

// 数组
expect(array).toHaveLength(3);
expect(array).toContain(item);

// 对象
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);

// 异常
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);

// 异步
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### Mock 和 Spy

```javascript
// Mock 函数
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockImplementation(() => 'value');

// Spy
jest.spyOn(object, 'method');
jest.spyOn(console, 'log').mockImplementation();

// Mock 模块
jest.mock('./module', () => ({
  method: jest.fn()
}));

// 清除 Mock
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 异步测试

```javascript
// Promise
test('should handle async', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});

// Callback
test('should handle callback', (done) => {
  asyncFunction((result) => {
    expect(result).toBe('expected');
    done();
  });
});
```

---

## 持续集成

### GitHub Actions 配置

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: cd game && npm install
        
      - name: Run tests
        run: cd game && npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./game/coverage/lcov.info
```

### 测试检查清单

在提交代码前，请确保：

- [ ] 所有测试通过
- [ ] 新代码有对应的测试
- [ ] 测试覆盖率不低于要求
- [ ] 没有跳过的测试（除非有充分理由）
- [ ] 测试名称清晰描述测试内容

---

## 功能测试清单

### 主页测试

- [ ] 显示游戏标题"拯救菜狗"
- [ ] 显示菜狗吉祥物（浮动动画）
- [ ] 显示"开始游戏"按钮
- [ ] 点击"开始游戏"跳转到关卡页
- [ ] 背景渐变效果正常

### 关卡页测试

- [ ] 显示关卡列表
- [ ] 第1关已解锁，其他关卡锁定
- [ ] 点击已解锁关卡进入游戏
- [ ] 点击锁定关卡显示提示
- [ ] 显示总星级统计
- [ ] 星级显示正确

### 游戏页测试

- [ ] 显示当前关卡标题
- [ ] 显示菜狗（屏幕中心，金色边框）
- [ ] 显示狼群（随机分布）
- [ ] 点击单位后开始跑动
- [ ] 单位沿对角线方向跑动
- [ ] 菜狗跑出屏幕后显示胜利
- [ ] 限时关卡显示倒计时
- [ ] 超时后显示失败
- [ ] 暂停功能正常
- [ ] 重置功能正常
- [ ] 返回功能正常

### 结果页测试

- [ ] 胜利时显示"过关成功"
- [ ] 失败时显示"游戏失败"
- [ ] 显示星级评定（1-3星）
- [ ] 显示分数
- [ ] 显示奖励
- [ ] "返回首页"按钮正常
- [ ] "下一关"按钮正常（胜利时）
- [ ] "重试"按钮正常（失败时）

### 游戏机制测试

- [ ] 菜狗位于屏幕中心
- [ ] 狼群不靠近中心
- [ ] 单位有预设的四个方向之一
- [ ] 点击后单位沿预设方向跑动
- [ ] 单位跑出屏幕边界后消失
- [ ] 菜狗跑出屏幕即获胜
- [ ] 限时关卡超时即失败
- [ ] 星级计算正确
- [ ] 分数计算正确
- [ ] 关卡解锁机制正常

### 数据持久化测试

- [ ] 游戏进度自动保存
- [ ] 关卡解锁状态保存
- [ ] 最高分记录保存
- [ ] 总分数保存
- [ ] 金币数量保存
- [ ] 重新打开后数据恢复

---

## 性能测试

### 帧率测试

- [ ] 游戏运行流畅，无明显卡顿
- [ ] 目标帧率：60 FPS
- [ ] 动画效果平滑

### 内存测试

- [ ] 内存占用合理
- [ ] 无明显内存泄漏
- [ ] 长时间运行稳定

---

## 常见问题排查

### 问题1：测试失败

**解决方案**：
1. 运行 `npm install` 重新安装依赖
2. 运行 `npm test` 查看具体错误
3. 检查 Node.js 版本（建议 >= 14.0.0）

### 问题2：覆盖率不足

**解决方案**：
1. 查看覆盖率报告，找出未覆盖的代码
2. 为未覆盖的代码添加测试用例
3. 重新运行测试验证覆盖率

### 问题3：测试超时

**解决方案**：
1. 检查异步测试是否正确处理
2. 增加测试超时时间：`test('...', async () => {}, 10000)`
3. 检查是否有无限循环

---

**文档版本**: v2.0  
**最后更新**: 2026-02-28  
**测试状态**: 单元测试全部通过
