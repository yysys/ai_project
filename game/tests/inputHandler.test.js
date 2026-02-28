const { InputHandler, InteractionManager } = require('../utils/inputHandler');
const { UnitState, Direction, TileType, UnitType } = require('../utils/constants');

const mockTile = (overrides = {}) => ({
  id: 'test_tile_1',
  type: TileType.HORIZONTAL,
  unitType: UnitType.WOLF,
  gridCol: 5,
  gridRow: 5,
  gridColSpan: 2,
  gridRowSpan: 1,
  direction: Direction.UP_RIGHT,
  state: UnitState.IDLE,
  animating: false,
  opacity: 1,
  ...overrides
});

const mockPuzzleManager = () => ({
  getTiles: jest.fn(() => [mockTile()]),
  undo: jest.fn(() => true),
  resetLevel: jest.fn(),
  isPositionInDiamond: jest.fn(() => true),
  checkCollision: jest.fn(() => false)
});

describe('InputHandler', () => {
  let inputHandler;
  const screenWidth = 375;
  const screenHeight = 667;

  beforeEach(() => {
    inputHandler = new InputHandler({
      undoLimit: 5,
      hintLimit: 3
    });
    inputHandler.init(null, screenWidth, screenHeight);
  });

  afterEach(() => {
    inputHandler.destroy();
  });

  describe('初始化', () => {
    test('应该正确初始化屏幕尺寸', () => {
      expect(inputHandler.screenWidth).toBe(screenWidth);
      expect(inputHandler.screenHeight).toBe(screenHeight);
    });

    test('应该正确初始化撤销和提示限制', () => {
      expect(inputHandler.undoLimit).toBe(5);
      expect(inputHandler.hintLimit).toBe(3);
      expect(inputHandler.undoCount).toBe(0);
      expect(inputHandler.hintCount).toBe(0);
    });

    test('应该正确检测平台', () => {
      expect(['douyin', 'wechat', 'web', 'unknown']).toContain(inputHandler.platform);
    });
  });

  describe('坐标转换', () => {
    test('screenToGrid 应该正确转换屏幕坐标到网格坐标', () => {
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      
      const result = inputHandler.screenToGrid(centerX, centerY);
      
      expect(result).toHaveProperty('col');
      expect(result).toHaveProperty('row');
      expect(result).toHaveProperty('tileSize');
      expect(result).toHaveProperty('offsetX');
      expect(result).toHaveProperty('offsetY');
      expect(typeof result.col).toBe('number');
      expect(typeof result.row).toBe('number');
    });

    test('gridToScreen 应该正确转换网格坐标到屏幕坐标', () => {
      const result = inputHandler.gridToScreen(7, 7);
      
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    test('rotateCoordinates 应该正确旋转坐标', () => {
      const x = 100;
      const y = 100;
      const angle = 45;
      
      const result = inputHandler.rotateCoordinates(x, y, angle);
      
      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    test('坐标转换应该是可逆的', () => {
      const testCol = 7;
      const testRow = 7;
      
      const screenPos = inputHandler.gridToScreen(testCol, testRow);
      const gridPos = inputHandler.screenToGrid(screenPos.x, screenPos.y);
      
      expect(gridPos.col).toBeCloseTo(testCol, 0);
      expect(gridPos.row).toBeCloseTo(testRow, 0);
    });
  });

  describe('点击检测', () => {
    test('getTileAtPosition 应该返回点击的格子', () => {
      const tile = mockTile({ gridCol: 7, gridRow: 7 });
      const tiles = [tile];
      
      const screenPos = inputHandler.gridToScreen(7, 7);
      const result = inputHandler.getTileAtPosition(screenPos.x, screenPos.y, tiles);
      
      expect(result).toBe(tile);
    });

    test('getTileAtPosition 应该跳过已消失的格子', () => {
      const tile = mockTile({ 
        gridCol: 7, 
        gridRow: 7, 
        state: UnitState.DISAPPEARED 
      });
      const tiles = [tile];
      
      const screenPos = inputHandler.gridToScreen(7, 7);
      const result = inputHandler.getTileAtPosition(screenPos.x, screenPos.y, tiles);
      
      expect(result).toBeNull();
    });

    test('getTileAtPosition 应该跳过正在动画的格子', () => {
      const tile = mockTile({ 
        gridCol: 7, 
        gridRow: 7, 
        animating: true 
      });
      const tiles = [tile];
      
      const screenPos = inputHandler.gridToScreen(7, 7);
      const result = inputHandler.getTileAtPosition(screenPos.x, screenPos.y, tiles);
      
      expect(result).toBeNull();
    });

    test('getTileAtPosition 应该返回 null 当没有格子时', () => {
      const result = inputHandler.getTileAtPosition(100, 100, []);
      expect(result).toBeNull();
    });

    test('getTileAtPosition 应该返回 null 当 tiles 为 null', () => {
      const result = inputHandler.getTileAtPosition(100, 100, null);
      expect(result).toBeNull();
    });
  });

  describe('撤销功能', () => {
    test('canUndo 应该返回 true 当未达到限制', () => {
      expect(inputHandler.canUndo()).toBe(true);
    });

    test('canUndo 应该返回 false 当达到限制', () => {
      for (let i = 0; i < 5; i++) {
        inputHandler.incrementUndoCount();
      }
      expect(inputHandler.canUndo()).toBe(false);
    });

    test('incrementUndoCount 应该正确增加计数', () => {
      inputHandler.incrementUndoCount();
      expect(inputHandler.getUndoCount()).toBe(1);
      expect(inputHandler.getRemainingUndoCount()).toBe(4);
    });

    test('resetUndoCount 应该重置计数', () => {
      inputHandler.incrementUndoCount();
      inputHandler.incrementUndoCount();
      inputHandler.resetUndoCount();
      expect(inputHandler.getUndoCount()).toBe(0);
    });
  });

  describe('提示功能', () => {
    test('canShowHint 应该返回 true 当未达到限制', () => {
      expect(inputHandler.canShowHint()).toBe(true);
    });

    test('canShowHint 应该返回 false 当达到限制', () => {
      for (let i = 0; i < 3; i++) {
        inputHandler.incrementHintCount();
      }
      expect(inputHandler.canShowHint()).toBe(false);
    });

    test('incrementHintCount 应该正确增加计数', () => {
      inputHandler.incrementHintCount();
      expect(inputHandler.getHintCount()).toBe(1);
      expect(inputHandler.getRemainingHintCount()).toBe(2);
    });

    test('highlightHintTiles 应该正确高亮格子', () => {
      const hintTiles = [
        { tile: mockTile({ id: 'tile_1' }) },
        { tile: mockTile({ id: 'tile_2' }) }
      ];
      
      const highlightedIds = inputHandler.highlightHintTiles(hintTiles);
      
      expect(highlightedIds).toContain('tile_1');
      expect(highlightedIds).toContain('tile_2');
      expect(inputHandler.isTileHighlighted('tile_1')).toBe(true);
    });

    test('clearHintHighlight 应该清除高亮', () => {
      const hintTiles = [{ tile: mockTile({ id: 'tile_1' }) }];
      inputHandler.highlightHintTiles(hintTiles);
      
      inputHandler.clearHintHighlight();
      
      expect(inputHandler.isTileHighlighted('tile_1')).toBe(false);
      expect(inputHandler.getHintedTileIds()).toHaveLength(0);
    });

    test('findHintTiles 应该找到可移动的格子', () => {
      const puzzleManager = mockPuzzleManager();
      puzzleManager.isPositionInDiamond.mockReturnValue(true);
      puzzleManager.checkCollision.mockReturnValue(false);
      
      const tiles = [mockTile({ direction: Direction.UP_RIGHT })];
      const hintTiles = inputHandler.findHintTiles(tiles, puzzleManager);
      
      expect(hintTiles.length).toBeGreaterThan(0);
      expect(hintTiles[0]).toHaveProperty('tile');
      expect(hintTiles[0]).toHaveProperty('direction');
    });
  });

  describe('事件绑定', () => {
    test('bindEvents 应该设置 isBound 为 true', () => {
      inputHandler.bindEvents();
      expect(inputHandler.isBound).toBe(true);
    });

    test('unbindEvents 应该设置 isBound 为 false', () => {
      inputHandler.bindEvents();
      inputHandler.unbindEvents();
      expect(inputHandler.isBound).toBe(false);
    });

    test('重复调用 bindEvents 应该只绑定一次', () => {
      inputHandler.bindEvents();
      inputHandler.bindEvents();
      expect(inputHandler.isBound).toBe(true);
    });
  });

  describe('触摸回调', () => {
    test('onTouchStart 应该注册回调', () => {
      const callback = jest.fn();
      inputHandler.onTouchStart(callback);
      
      expect(inputHandler.touchStartCallbacks).toContain(callback);
    });

    test('onTouchMove 应该注册回调', () => {
      const callback = jest.fn();
      inputHandler.onTouchMove(callback);
      
      expect(inputHandler.touchMoveCallbacks).toContain(callback);
    });

    test('onTouchEnd 应该注册回调', () => {
      const callback = jest.fn();
      inputHandler.onTouchEnd(callback);
      
      expect(inputHandler.touchEndCallbacks).toContain(callback);
    });

    test('返回的函数应该能取消注册', () => {
      const callback = jest.fn();
      const unsubscribe = inputHandler.onTouchStart(callback);
      
      unsubscribe();
      
      expect(inputHandler.touchStartCallbacks).not.toContain(callback);
    });
  });

  describe('重置和销毁', () => {
    test('reset 应该重置所有计数', () => {
      inputHandler.incrementUndoCount();
      inputHandler.incrementHintCount();
      
      inputHandler.reset();
      
      expect(inputHandler.getUndoCount()).toBe(0);
      expect(inputHandler.getHintCount()).toBe(0);
    });

    test('destroy 应该清理资源', () => {
      inputHandler.bindEvents();
      inputHandler.destroy();
      
      expect(inputHandler.isBound).toBe(false);
      expect(inputHandler.canvas).toBeNull();
      expect(inputHandler.touchStartCallbacks).toHaveLength(0);
    });
  });
});

describe('InteractionManager', () => {
  let interactionManager;
  let puzzleManager;

  beforeEach(() => {
    puzzleManager = mockPuzzleManager();
    interactionManager = new InteractionManager({
      undoLimit: 5,
      hintLimit: 3,
      resetConfirmEnabled: true,
      resetAnimationEnabled: true
    });
    interactionManager.init(null, 375, 667, puzzleManager);
  });

  afterEach(() => {
    interactionManager.destroy();
  });

  describe('初始化', () => {
    test('应该正确初始化配置', () => {
      expect(interactionManager.undoLimit).toBe(5);
      expect(interactionManager.hintLimit).toBe(3);
      expect(interactionManager.resetConfirmEnabled).toBe(true);
      expect(interactionManager.resetAnimationEnabled).toBe(true);
    });

    test('应该正确初始化 inputHandler', () => {
      expect(interactionManager.inputHandler).toBeDefined();
    });
  });

  describe('点击处理', () => {
    test('handleClick 应该返回点击的格子', () => {
      const tile = mockTile({ gridCol: 7, gridRow: 7 });
      puzzleManager.getTiles.mockReturnValue([tile]);
      
      const screenPos = interactionManager.gridToScreen(7, 7);
      const result = interactionManager.handleClick(screenPos.x, screenPos.y);
      
      expect(result.success).toBe(true);
      expect(result.tile).toBe(tile);
    });

    test('handleClick 应该返回失败当没有 puzzleManager', () => {
      interactionManager.puzzleManager = null;
      
      const result = interactionManager.handleClick(100, 100);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_puzzle_manager');
    });

    test('handleClick 应该返回失败当没有格子', () => {
      puzzleManager.getTiles.mockReturnValue([]);
      
      const result = interactionManager.handleClick(100, 100);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_tile_at_position');
    });
  });

  describe('撤销功能', () => {
    test('undo 应该成功撤销', () => {
      const result = interactionManager.undo();
      
      expect(result.success).toBe(true);
      expect(result.remainingCount).toBe(4);
      expect(puzzleManager.undo).toHaveBeenCalled();
    });

    test('undo 应该返回失败当达到限制', () => {
      for (let i = 0; i < 5; i++) {
        interactionManager.inputHandler.incrementUndoCount();
      }
      
      const result = interactionManager.undo();
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('undo_limit_reached');
    });

    test('undo 应该调用回调', () => {
      const callback = jest.fn();
      interactionManager.onUndo(callback);
      
      interactionManager.undo();
      
      expect(callback).toHaveBeenCalledWith({
        remainingCount: expect.any(Number)
      });
    });

    test('getUndoState 应该返回正确的状态', () => {
      interactionManager.undo();
      
      const state = interactionManager.getUndoState();
      
      expect(state.canUndo).toBe(true);
      expect(state.usedCount).toBe(1);
      expect(state.remainingCount).toBe(4);
      expect(state.limit).toBe(5);
    });
  });

  describe('重置功能', () => {
    test('reset 应该返回需要确认当启用确认', () => {
      const result = interactionManager.reset();
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('confirmation_required');
      expect(result.showConfirm).toBe(true);
    });

    test('reset 应该直接重置当跳过确认', () => {
      const result = interactionManager.reset({ skipConfirm: true });
      
      expect(result.success).toBe(true);
      expect(result.animated).toBe(true);
      expect(puzzleManager.resetLevel).toHaveBeenCalled();
    });

    test('confirmReset 应该执行重置', () => {
      const result = interactionManager.confirmReset();
      
      expect(result.success).toBe(true);
      expect(puzzleManager.resetLevel).toHaveBeenCalled();
    });

    test('reset 应该调用回调', () => {
      const callback = jest.fn();
      interactionManager.onReset(callback);
      
      interactionManager.reset({ skipConfirm: true });
      
      expect(callback).toHaveBeenCalledWith({ animated: true });
    });

    test('reset 应该重置计数', () => {
      interactionManager.inputHandler.incrementUndoCount();
      interactionManager.inputHandler.incrementHintCount();
      
      interactionManager.reset({ skipConfirm: true });
      
      expect(interactionManager.inputHandler.getUndoCount()).toBe(0);
      expect(interactionManager.inputHandler.getHintCount()).toBe(0);
    });
  });

  describe('提示功能', () => {
    test('getHint 应该返回提示格子', () => {
      puzzleManager.isPositionInDiamond.mockReturnValue(true);
      puzzleManager.checkCollision.mockReturnValue(false);
      
      const result = interactionManager.getHint();
      
      expect(result.success).toBe(true);
      expect(result.tiles).toBeDefined();
      expect(result.highlightedIds).toBeDefined();
    });

    test('getHint 应该返回失败当达到限制', () => {
      for (let i = 0; i < 3; i++) {
        interactionManager.inputHandler.incrementHintCount();
      }
      
      const result = interactionManager.getHint();
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('hint_limit_reached');
    });

    test('getHint 应该调用回调', () => {
      puzzleManager.isPositionInDiamond.mockReturnValue(true);
      puzzleManager.checkCollision.mockReturnValue(false);
      
      const callback = jest.fn();
      interactionManager.onHint(callback);
      
      interactionManager.getHint();
      
      expect(callback).toHaveBeenCalled();
    });

    test('getHintState 应该返回正确的状态', () => {
      const state = interactionManager.getHintState();
      
      expect(state.canShowHint).toBe(true);
      expect(state.usedCount).toBe(0);
      expect(state.remainingCount).toBe(3);
      expect(state.limit).toBe(3);
    });

    test('clearHintHighlight 应该清除高亮', () => {
      interactionManager.inputHandler.highlightHintTiles([
        { tile: mockTile({ id: 'tile_1' }) }
      ]);
      
      interactionManager.clearHintHighlight();
      
      expect(interactionManager.getHighlightedTiles()).toHaveLength(0);
    });
  });

  describe('事件回调注册', () => {
    test('onUndo 应该注册回调', () => {
      const callback = jest.fn();
      interactionManager.onUndo(callback);
      expect(interactionManager.onUndoCallback).toBe(callback);
    });

    test('onReset 应该注册回调', () => {
      const callback = jest.fn();
      interactionManager.onReset(callback);
      expect(interactionManager.onResetCallback).toBe(callback);
    });

    test('onHint 应该注册回调', () => {
      const callback = jest.fn();
      interactionManager.onHint(callback);
      expect(interactionManager.onHintCallback).toBe(callback);
    });

    test('onTileClick 应该注册回调', () => {
      const callback = jest.fn();
      interactionManager.onTileClick(callback);
      expect(interactionManager.onTileClickCallback).toBe(callback);
    });
  });

  describe('销毁', () => {
    test('destroy 应该清理所有资源', () => {
      interactionManager.destroy();
      
      expect(interactionManager.puzzleManager).toBeNull();
      expect(interactionManager.onUndoCallback).toBeNull();
      expect(interactionManager.onResetCallback).toBeNull();
      expect(interactionManager.onHintCallback).toBeNull();
      expect(interactionManager.onTileClickCallback).toBeNull();
    });
  });
});

describe('边界情况测试', () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
    inputHandler.init(null, 375, 667);
  });

  afterEach(() => {
    inputHandler.destroy();
  });

  test('点击屏幕边缘应该正确处理', () => {
    const result1 = inputHandler.screenToGrid(0, 0);
    const result2 = inputHandler.screenToGrid(375, 667);
    
    expect(result1.col).toBeDefined();
    expect(result1.row).toBeDefined();
    expect(result2.col).toBeDefined();
    expect(result2.row).toBeDefined();
  });

  test('负坐标应该正确处理', () => {
    const result = inputHandler.screenToGrid(-10, -10);
    
    expect(result.col).toBeLessThan(1);
    expect(result.row).toBeLessThan(1);
  });

  test('超大坐标应该正确处理', () => {
    const result = inputHandler.screenToGrid(10000, 10000);
    
    expect(result.col).toBeGreaterThan(14);
    expect(result.row).toBeGreaterThan(14);
  });

  test('零屏幕尺寸应该正确处理', () => {
    inputHandler.setScreenSize(0, 0);
    
    expect(inputHandler.screenWidth).toBe(0);
    expect(inputHandler.screenHeight).toBe(0);
  });

  test('空格子数组应该正确处理', () => {
    const result = inputHandler.getTileAtPosition(100, 100, []);
    expect(result).toBeNull();
  });

  test('无效的方向应该正确处理', () => {
    const tile = mockTile({ direction: 'invalid_direction' });
    const puzzleManager = mockPuzzleManager();
    
    const result = inputHandler._checkTileCanSlide(tile, [tile], puzzleManager);
    
    expect(result.canMove).toBe(false);
    expect(result.reason).toBe('invalid_direction');
  });
});

describe('性能测试', () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
    inputHandler.init(null, 375, 667);
  });

  afterEach(() => {
    inputHandler.destroy();
  });

  test('大量坐标转换应该高效', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      inputHandler.screenToGrid(Math.random() * 375, Math.random() * 667);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });

  test('大量点击检测应该高效', () => {
    const tiles = Array(50).fill(null).map((_, i) => mockTile({ 
      id: `tile_${i}`,
      gridCol: (i % 10) + 1,
      gridRow: Math.floor(i / 10) + 1
    }));
    
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      inputHandler.getTileAtPosition(
        Math.random() * 375,
        Math.random() * 667,
        tiles
      );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50);
  });
});
