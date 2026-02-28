const Renderer = require('../utils/renderer');
const { 
  TILE_CONFIG, 
  UnitType, 
  UnitState, 
  Direction,
  DIRECTION_VECTORS,
  ANIMATION_CONFIG 
} = require('../utils/constants');

class MockCanvas {
  constructor() {
    this.width = 375;
    this.height = 667;
    this.context = new MockContext();
  }
  
  getContext(type) {
    return this.context;
  }
}

class MockContext {
  constructor() {
    this.operations = [];
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 0;
    this.globalAlpha = 1;
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.font = '';
    this.shadowColor = '';
    this.shadowBlur = 0;
  }
  
  clearRect(x, y, width, height) {
    this.operations.push({ type: 'clearRect', x, y, width, height });
  }
  
  fillRect(x, y, width, height) {
    this.operations.push({ type: 'fillRect', x, y, width, height, fillStyle: this.fillStyle });
  }
  
  strokeRect(x, y, width, height) {
    this.operations.push({ type: 'strokeRect', x, y, width, height, strokeStyle: this.strokeStyle });
  }
  
  beginPath() {
    this.operations.push({ type: 'beginPath' });
  }
  
  moveTo(x, y) {
    this.operations.push({ type: 'moveTo', x, y });
  }
  
  lineTo(x, y) {
    this.operations.push({ type: 'lineTo', x, y });
  }
  
  stroke() {
    this.operations.push({ type: 'stroke' });
  }
  
  fill() {
    this.operations.push({ type: 'fill' });
  }
  
  closePath() {
    this.operations.push({ type: 'closePath' });
  }
  
  save() {
    this.operations.push({ type: 'save' });
  }
  
  restore() {
    this.operations.push({ type: 'restore' });
  }
  
  translate(x, y) {
    this.operations.push({ type: 'translate', x, y });
  }
  
  rotate(angle) {
    this.operations.push({ type: 'rotate', angle });
  }
  
  scale(x, y) {
    this.operations.push({ type: 'scale', x, y });
  }
  
  arc(x, y, radius, startAngle, endAngle) {
    this.operations.push({ type: 'arc', x, y, radius, startAngle, endAngle });
  }
  
  quadraticCurveTo(cpx, cpy, x, y) {
    this.operations.push({ type: 'quadraticCurveTo', cpx, cpy, x, y });
  }
  
  fillText(text, x, y) {
    this.operations.push({ type: 'fillText', text, x, y });
  }
  
  createLinearGradient(x0, y0, x1, y1) {
    return {
      addColorStop: (offset, color) => {
        this.operations.push({ type: 'gradientStop', offset, color });
      }
    };
  }
  
  setLineDash(segments) {
    this.operations.push({ type: 'setLineDash', segments });
  }
}

function createMockTile(overrides = {}) {
  return {
    id: 'test_tile_1',
    type: 'horizontal',
    unitType: UnitType.WOLF,
    gridCol: 5,
    gridRow: 5,
    gridColSpan: 2,
    gridRowSpan: 1,
    direction: Direction.UP_RIGHT,
    state: UnitState.IDLE,
    animating: false,
    animationProgress: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    targetGridCol: 0,
    targetGridRow: 0,
    opacity: 1,
    ...overrides
  };
}

describe('Renderer', () => {
  let renderer;
  let mockCanvas;
  let mockCtx;
  
  beforeEach(() => {
    renderer = new Renderer();
    mockCanvas = new MockCanvas();
    mockCtx = mockCanvas.getContext('2d');
    renderer.init(mockCanvas, mockCtx);
    renderer.setScreenSize(375, 667);
  });
  
  afterEach(() => {
    renderer.destroy();
  });
  
  describe('初始化', () => {
    test('应该正确初始化', () => {
      expect(renderer.canvas).toBe(mockCanvas);
      expect(renderer.ctx).toBe(mockCtx);
      expect(renderer.screenWidth).toBe(375);
      expect(renderer.screenHeight).toBe(667);
    });
    
    test('应该正确计算网格尺寸', () => {
      expect(renderer.tileSize).toBeGreaterThan(0);
      expect(renderer.gridWidth).toBeGreaterThan(0);
      expect(renderer.gridHeight).toBeGreaterThan(0);
      expect(renderer.offsetX).toBeGreaterThanOrEqual(0);
      expect(renderer.offsetY).toBeGreaterThanOrEqual(0);
    });
    
    test('应该正确设置屏幕尺寸', () => {
      renderer.setScreenSize(414, 896);
      expect(renderer.screenWidth).toBe(414);
      expect(renderer.screenHeight).toBe(896);
      expect(renderer.tileSize).toBeGreaterThan(0);
    });
  });
  
  describe('坐标转换', () => {
    test('gridToScreen 应该正确转换网格坐标到屏幕坐标', () => {
      const screenPos = renderer.gridToScreen(7, 7);
      expect(screenPos.x).toBeDefined();
      expect(screenPos.y).toBeDefined();
      expect(typeof screenPos.x).toBe('number');
      expect(typeof screenPos.y).toBe('number');
    });
    
    test('screenToGrid 应该正确转换屏幕坐标到网格坐标', () => {
      const gridPos = renderer.screenToGrid(187.5, 333.5);
      expect(gridPos.col).toBeDefined();
      expect(gridPos.row).toBeDefined();
      expect(typeof gridPos.col).toBe('number');
      expect(typeof gridPos.row).toBe('number');
    });
    
    test('坐标转换应该是可逆的', () => {
      const originalCol = 5;
      const originalRow = 5;
      const screenPos = renderer.gridToScreen(originalCol, originalRow);
      const gridPos = renderer.screenToGrid(screenPos.x, screenPos.y);
      expect(Math.abs(gridPos.col - originalCol)).toBeLessThanOrEqual(1);
      expect(Math.abs(gridPos.row - originalRow)).toBeLessThanOrEqual(1);
    });
  });
  
  describe('渲染方法', () => {
    test('clear 应该清空画布', () => {
      renderer.clear();
      const clearOps = mockCtx.operations.filter(op => op.type === 'clearRect');
      expect(clearOps.length).toBe(1);
    });
    
    test('drawBackground 应该绘制背景', () => {
      renderer.drawBackground();
      const fillOps = mockCtx.operations.filter(op => op.type === 'fillRect');
      expect(fillOps.length).toBeGreaterThan(0);
    });
    
    test('drawGrid 应该绘制网格线', () => {
      mockCtx.operations = [];
      renderer.drawGrid();
      const strokeOps = mockCtx.operations.filter(op => op.type === 'stroke');
      expect(strokeOps.length).toBeGreaterThan(0);
    });
    
    test('render 应该正确渲染完整场景', () => {
      const renderState = {
        tiles: [createMockTile()],
        level: { name: '测试关卡', type: 'normal' },
        elapsedTime: 0,
        moveCount: 0
      };
      
      renderer.render(renderState);
      
      const clearOps = mockCtx.operations.filter(op => op.type === 'clearRect');
      expect(clearOps.length).toBe(1);
    });
  });
  
  describe('格子渲染', () => {
    test('drawTile 应该正确渲染格子', () => {
      const tile = createMockTile();
      renderer.drawTile(tile);
      
      const fillOps = mockCtx.operations.filter(op => op.type === 'fillRect');
      expect(fillOps.length).toBeGreaterThan(0);
    });
    
    test('drawTiles 应该正确渲染多个格子', () => {
      const tiles = [
        createMockTile({ id: 'tile_1', gridCol: 3, gridRow: 3 }),
        createMockTile({ id: 'tile_2', gridCol: 5, gridRow: 5, unitType: UnitType.DOG })
      ];
      
      renderer.drawTiles(tiles);
      
      const fillOps = mockCtx.operations.filter(op => op.type === 'fillRect');
      expect(fillOps.length).toBeGreaterThan(0);
    });
    
    test('应该跳过已消失的格子', () => {
      const tiles = [
        createMockTile({ state: UnitState.DISAPPEARED }),
        createMockTile({ id: 'visible_tile' })
      ];
      
      mockCtx.operations = [];
      renderer.drawTiles(tiles);
      
      const textOps = mockCtx.operations.filter(op => op.type === 'fillText');
      expect(textOps.length).toBeGreaterThan(0);
    });
    
    test('应该正确渲染菜狗格子', () => {
      const dogTile = createMockTile({ unitType: UnitType.DOG });
      renderer.drawTile(dogTile);
      
      const textOps = mockCtx.operations.filter(op => 
        op.type === 'fillText' && op.text === '🐕'
      );
      expect(textOps.length).toBeGreaterThan(0);
    });
    
    test('应该正确渲染狼格子', () => {
      const wolfTile = createMockTile({ unitType: UnitType.WOLF });
      renderer.drawTile(wolfTile);
      
      const textOps = mockCtx.operations.filter(op => 
        op.type === 'fillText' && op.text === '🐺'
      );
      expect(textOps.length).toBeGreaterThan(0);
    });
    
    test('应该正确渲染动画中的格子', () => {
      const animatingTile = createMockTile({
        animating: true,
        state: UnitState.SLIDING,
        currentX: 100,
        currentY: 100
      });
      
      renderer.drawTile(animatingTile);
      
      const fillOps = mockCtx.operations.filter(op => op.type === 'fillRect');
      expect(fillOps.length).toBeGreaterThan(0);
    });
    
    test('应该正确应用透明度', () => {
      const transparentTile = createMockTile({ opacity: 0.5 });
      renderer.drawTile(transparentTile);
      
      const saveOps = mockCtx.operations.filter(op => op.type === 'save');
      const restoreOps = mockCtx.operations.filter(op => op.type === 'restore');
      expect(saveOps.length).toBeGreaterThan(0);
      expect(restoreOps.length).toBeGreaterThan(0);
    });
  });
  
  describe('动画系统', () => {
    test('updateAnimations 应该更新动画控制器', () => {
      const spy = jest.spyOn(renderer.animationController, 'update');
      renderer.updateAnimations(0.016);
      expect(spy).toHaveBeenCalledWith(0.016);
      spy.mockRestore();
    });
    
    test('startMoveAnimation 应该创建移动动画', () => {
      const tile = createMockTile();
      const startPos = { x: 0, y: 0 };
      const endPos = { x: 100, y: 100 };
      
      const animationId = renderer.startMoveAnimation(tile, startPos, endPos, 300);
      
      expect(animationId).toBeDefined();
      expect(tile.animating).toBe(true);
      expect(tile.state).toBe(UnitState.SLIDING);
    });
    
    test('startDisappearAnimation 应该创建消失动画', () => {
      const tile = createMockTile();
      
      const animationId = renderer.startDisappearAnimation(tile, 500);
      
      expect(animationId).toBeDefined();
      expect(tile.state).toBe(UnitState.FADING_OUT);
      expect(tile.animating).toBe(true);
    });
    
    test('startWinAnimation 应该启动胜利动画', () => {
      const onComplete = jest.fn();
      renderer.startWinAnimation(onComplete);
      
      expect(renderer.winAnimationActive).toBe(true);
      expect(renderer.winAnimationProgress).toBe(0);
    });
  });
  
  describe('粒子系统', () => {
    test('应该正确发射粒子', () => {
      renderer.particleSystem.emit({
        x: 100,
        y: 100,
        count: 10,
        speed: 100,
        size: 5,
        color: '#FFD700',
        life: 1000
      });
      
      expect(renderer.particleSystem.particles.length).toBe(10);
    });
    
    test('应该正确更新粒子', () => {
      renderer.particleSystem.emit({
        x: 100,
        y: 100,
        count: 5,
        life: 100
      });
      
      renderer.particleSystem.update(0.1);
      
      expect(renderer.particleSystem.particles.length).toBeLessThanOrEqual(5);
    });
    
    test('应该正确清除粒子', () => {
      renderer.particleSystem.emit({
        x: 100,
        y: 100,
        count: 10
      });
      
      renderer.particleSystem.clear();
      
      expect(renderer.particleSystem.particles.length).toBe(0);
    });
  });
  
  describe('动画控制器', () => {
    test('应该正确创建动画', () => {
      const config = {
        type: 'test',
        startValue: 0,
        endValue: 100,
        duration: 1000,
        onUpdate: jest.fn(),
        onComplete: jest.fn()
      };
      
      const id = renderer.animationController.createAnimation(config);
      
      expect(id).toBeDefined();
      expect(renderer.animationController.animations.length).toBe(1);
    });
    
    test('应该正确更新动画', () => {
      const onUpdate = jest.fn();
      renderer.animationController.createAnimation({
        type: 'test',
        startValue: 0,
        endValue: 100,
        duration: 1000,
        onUpdate
      });
      
      renderer.animationController.update(0.5);
      
      expect(onUpdate).toHaveBeenCalled();
    });
    
    test('应该在动画完成时调用回调', () => {
      const onComplete = jest.fn();
      renderer.animationController.createAnimation({
        type: 'test',
        startValue: 0,
        endValue: 100,
        duration: 100,
        onComplete
      });
      
      renderer.animationController.update(0.2);
      
      expect(onComplete).toHaveBeenCalled();
    });
    
    test('应该正确取消动画', () => {
      const id = renderer.animationController.createAnimation({
        type: 'test',
        startValue: 0,
        endValue: 100,
        duration: 1000
      });
      
      renderer.animationController.cancelAnimation(id);
      
      expect(renderer.animationController.animations.length).toBe(0);
    });
    
    test('应该正确应用缓动函数', () => {
      const eased = renderer.animationController.applyEasing(0.5, 'easeOutQuad');
      expect(eased).toBe(0.75);
    });
  });
  
  describe('UI渲染', () => {
    test('drawUI 应该正确渲染UI元素', () => {
      const renderState = {
        level: { name: '第1关', type: 'normal' },
        elapsedTime: 10,
        moveCount: 5
      };
      
      renderer.drawUI(renderState);
      
      const textOps = mockCtx.operations.filter(op => op.type === 'fillText');
      expect(textOps.length).toBeGreaterThan(0);
    });
    
    test('应该正确显示计时器', () => {
      const renderState = {
        level: { name: '第1关', type: 'timed', timeLimit: 60 },
        elapsedTime: 30,
        moveCount: 5
      };
      
      renderer.drawUI(renderState);
      
      const textOps = mockCtx.operations.filter(op => 
        op.type === 'fillText' && op.text && op.text.includes('时间')
      );
      expect(textOps.length).toBeGreaterThan(0);
    });
    
    test('应该在时间不足时显示红色', () => {
      const renderState = {
        level: { name: '第1关', type: 'timed', timeLimit: 60 },
        elapsedTime: 55,
        moveCount: 5
      };
      
      renderer.drawUI(renderState);
      
      const textOps = mockCtx.operations.filter(op => op.type === 'fillText');
      expect(textOps.length).toBeGreaterThan(0);
    });
  });
  
  describe('资源管理', () => {
    test('loadImage 应该缓存已加载的图片', async () => {
      const url = 'test://image.png';
      
      global.Image = class {
        constructor() {
          setTimeout(() => this.onload(), 0);
        }
      };
      
      const img1 = await renderer.loadImage(url);
      const img2 = await renderer.loadImage(url);
      
      expect(img1).toBe(img2);
      expect(renderer.imageCache.has(url)).toBe(true);
    });
    
    test('preloadImages 应该预加载多个图片', async () => {
      const urls = ['test://image1.png', 'test://image2.png'];
      
      global.Image = class {
        constructor() {
          setTimeout(() => this.onload(), 0);
        }
      };
      
      await renderer.preloadImages(urls);
      
      expect(renderer.imageCache.size).toBe(2);
    });
    
    test('clearCache 应该清除缓存', () => {
      renderer.imageCache.set('test', {});
      renderer.imageLoadPromises.set('test', Promise.resolve());
      
      renderer.clearCache();
      
      expect(renderer.imageCache.size).toBe(0);
      expect(renderer.imageLoadPromises.size).toBe(0);
    });
  });
  
  describe('销毁', () => {
    test('destroy 应该清理所有资源', () => {
      renderer.particleSystem.emit({ x: 100, y: 100 });
      renderer.animationController.createAnimation({
        type: 'test',
        startValue: 0,
        endValue: 100,
        duration: 1000
      });
      
      renderer.destroy();
      
      expect(renderer.animationController.animations.length).toBe(0);
      expect(renderer.particleSystem.particles.length).toBe(0);
      expect(renderer.canvas).toBeNull();
      expect(renderer.ctx).toBeNull();
    });
  });
});

describe('Renderer 边界情况', () => {
  let renderer;
  let mockCanvas;
  let mockCtx;
  
  beforeEach(() => {
    renderer = new Renderer();
    mockCanvas = new MockCanvas();
    mockCtx = mockCanvas.getContext('2d');
  });
  
  test('未初始化时 render 不应该报错', () => {
    expect(() => renderer.render({})).not.toThrow();
  });
  
  test('空格子数组时 drawTiles 不应该报错', () => {
    renderer.init(mockCanvas, mockCtx);
    renderer.setScreenSize(375, 667);
    
    expect(() => renderer.drawTiles([])).not.toThrow();
  });
  
  test('null renderState 时 render 不应该报错', () => {
    renderer.init(mockCanvas, mockCtx);
    renderer.setScreenSize(375, 667);
    
    expect(() => renderer.render(null)).not.toThrow();
  });
  
  test('drawAnimatingTile 对非动画格子不应该报错', () => {
    renderer.init(mockCanvas, mockCtx);
    renderer.setScreenSize(375, 667);
    
    const tile = createMockTile({ animating: false });
    
    expect(() => renderer.drawAnimatingTile(tile)).not.toThrow();
  });
  
  test('drawDisappearEffect 对非消失状态格子不应该报错', () => {
    renderer.init(mockCanvas, mockCtx);
    renderer.setScreenSize(375, 667);
    
    const tile = createMockTile({ state: UnitState.IDLE });
    
    expect(() => renderer.drawDisappearEffect(tile)).not.toThrow();
  });
});
