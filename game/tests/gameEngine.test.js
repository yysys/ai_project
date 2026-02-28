const GameEngine = require('../utils/gameEngine');
const { GameState, UnitState, Direction } = require('../utils/constants');

describe('GameEngine', () => {
  let gameEngine;
  let mockCanvas;
  let mockCtx;

  beforeEach(() => {
    gameEngine = new GameEngine();
    
    mockCanvas = {
      width: 375,
      height: 667
    };
    
    mockCtx = {
      clearRect: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      strokeStyle: '',
      lineWidth: 1,
      stroke: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillText: jest.fn(),
      font: '',
      textAlign: '',
      textBaseline: ''
    };
    
    gameEngine.init(mockCanvas, mockCtx, 375, 667);
  });

  afterEach(() => {
    gameEngine.destroy();
  });

  describe('初始化', () => {
    it('应该正确初始化游戏引擎', () => {
      expect(gameEngine.isInitialized).toBe(true);
      expect(gameEngine.getState().status).toBe(GameState.IDLE);
    });

    it('应该正确设置屏幕尺寸', () => {
      expect(gameEngine.screenWidth).toBe(375);
      expect(gameEngine.screenHeight).toBe(667);
    });
  });

  describe('状态管理', () => {
    it('应该正确获取游戏状态', () => {
      const state = gameEngine.getState();
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('elapsedTime');
      expect(state).toHaveProperty('moveCount');
    });

    it('状态变更应该触发事件', () => {
      const stateChangeListener = jest.fn();
      gameEngine.on('stateChange', stateChangeListener);
      
      gameEngine.startLevel(1);
      
      expect(stateChangeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          oldStatus: GameState.IDLE,
          newStatus: GameState.PLAYING
        })
      );
    });
  });

  describe('事件系统', () => {
    it('应该正确注册和触发事件', () => {
      const callback = jest.fn();
      gameEngine.on('test', callback);
      
      gameEngine.emit('test', { data: 'test' });
      
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('应该正确取消事件监听', () => {
      const callback = jest.fn();
      const unsubscribe = gameEngine.on('test', callback);
      
      unsubscribe();
      gameEngine.emit('test', { data: 'test' });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('once 应该只触发一次', () => {
      const callback = jest.fn();
      gameEngine.eventSystem.once('test', callback);
      
      gameEngine.emit('test', { data: 1 });
      gameEngine.emit('test', { data: 2 });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('关卡控制', () => {
    it('应该正确启动关卡', () => {
      const result = gameEngine.startLevel(1);
      
      expect(result).toBe(true);
      expect(gameEngine.getState().status).toBe(GameState.PLAYING);
      expect(gameEngine.getState().currentLevelId).toBe(1);
    });

    it('启动关卡应该触发 levelStart 事件', () => {
      const listener = jest.fn();
      gameEngine.on('levelStart', listener);
      
      gameEngine.startLevel(1);
      
      expect(listener).toHaveBeenCalledWith({ levelId: 1 });
    });

    it('未初始化时启动关卡应该失败', () => {
      const uninitializedEngine = new GameEngine();
      
      const result = uninitializedEngine.startLevel(1);
      
      expect(result).toBe(false);
    });
  });

  describe('暂停和恢复', () => {
    beforeEach(() => {
      gameEngine.startLevel(1);
    });

    it('应该正确暂停游戏', () => {
      gameEngine.pause();
      
      expect(gameEngine.getState().status).toBe(GameState.PAUSED);
      expect(gameEngine.getState().isPaused).toBe(true);
    });

    it('应该正确恢复游戏', () => {
      gameEngine.pause();
      gameEngine.resume();
      
      expect(gameEngine.getState().status).toBe(GameState.PLAYING);
      expect(gameEngine.getState().isPaused).toBe(false);
    });

    it('暂停应该触发事件', () => {
      const listener = jest.fn();
      gameEngine.on('pause', listener);
      
      gameEngine.pause();
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('重置', () => {
    beforeEach(() => {
      gameEngine.startLevel(1);
    });

    it('应该正确重置关卡', () => {
      gameEngine.stateManager.setState({ moveCount: 5, elapsedTime: 10 });
      
      gameEngine.reset();
      
      expect(gameEngine.getState().moveCount).toBe(0);
      expect(gameEngine.getState().elapsedTime).toBe(0);
    });

    it('重置应该触发事件', () => {
      const listener = jest.fn();
      gameEngine.on('levelReset', listener);
      
      gameEngine.reset();
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('点击处理', () => {
    beforeEach(() => {
      gameEngine.startLevel(1);
    });

    it('非 PLAYING 状态下点击应该返回 false', () => {
      gameEngine.pause();
      
      const result = gameEngine.handleClick(100, 100);
      
      expect(result).toBe(false);
    });

    it('点击空白区域应该返回 false', () => {
      const result = gameEngine.handleClick(0, 0);
      
      expect(result).toBe(false);
    });
  });

  describe('销毁', () => {
    it('应该正确销毁游戏引擎', () => {
      gameEngine.startLevel(1);
      
      gameEngine.destroy();
      
      expect(gameEngine.canvas).toBeNull();
      expect(gameEngine.ctx).toBeNull();
      expect(gameEngine.isInitialized).toBe(false);
      expect(gameEngine.getState().status).toBe(GameState.IDLE);
    });

    it('销毁应该触发事件', () => {
      const listener = jest.fn();
      gameEngine.on('destroy', listener);
      
      gameEngine.destroy();
      
      expect(listener).toHaveBeenCalled();
    });
  });
});

describe('StateManager', () => {
  const StateManager = GameEngine.StateManager;
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('状态获取和设置', () => {
    it('应该正确获取状态', () => {
      const state = stateManager.getState();
      
      expect(state.status).toBe(GameState.IDLE);
    });

    it('应该正确设置状态', () => {
      stateManager.setState({ status: GameState.PLAYING });
      
      expect(stateManager.getState().status).toBe(GameState.PLAYING);
    });

    it('设置状态应该返回新对象', () => {
      const state1 = stateManager.getState();
      stateManager.setState({ status: GameState.PLAYING });
      const state2 = stateManager.getState();
      
      expect(state1).not.toBe(state2);
    });
  });

  describe('监听器', () => {
    it('应该正确添加监听器', () => {
      const listener = jest.fn();
      stateManager.subscribe(listener);
      
      stateManager.setState({ status: GameState.PLAYING });
      
      expect(listener).toHaveBeenCalled();
    });

    it('应该正确移除监听器', () => {
      const listener = jest.fn();
      const unsubscribe = stateManager.subscribe(listener);
      
      unsubscribe();
      stateManager.setState({ status: GameState.PLAYING });
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('重置', () => {
    it('应该正确重置状态', () => {
      stateManager.setState({
        status: GameState.PLAYING,
        elapsedTime: 100,
        moveCount: 10
      });
      
      stateManager.reset();
      
      const state = stateManager.getState();
      expect(state.status).toBe(GameState.IDLE);
      expect(state.elapsedTime).toBe(0);
      expect(state.moveCount).toBe(0);
    });
  });
});

describe('EventSystem', () => {
  const EventSystem = GameEngine.EventSystem;
  let eventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  describe('事件注册和触发', () => {
    it('应该正确注册和触发事件', () => {
      const callback = jest.fn();
      eventSystem.on('test', callback);
      
      eventSystem.emit('test', { value: 1 });
      
      expect(callback).toHaveBeenCalledWith({ value: 1 });
    });

    it('应该支持多个监听器', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      eventSystem.on('test', callback1);
      eventSystem.on('test', callback2);
      
      eventSystem.emit('test', {});
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('事件移除', () => {
    it('应该正确移除事件监听器', () => {
      const callback = jest.fn();
      eventSystem.on('test', callback);
      
      eventSystem.off('test', callback);
      eventSystem.emit('test', {});
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('应该清除所有事件', () => {
      const callback = jest.fn();
      eventSystem.on('test', callback);
      
      eventSystem.clear();
      eventSystem.emit('test', {});
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
