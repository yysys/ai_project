const GameStateManager = require('../utils/gameStateManager');
const { GameState, UnitType, UnitState, DIRECTION_VECTORS } = require('../utils/constants');

describe('GameStateManager', () => {
  let gameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
  });

  describe('constructor', () => {
    test('should initialize with IDLE state', () => {
      expect(gameStateManager.getState()).toBe(GameState.IDLE);
    });

    test('should initialize with empty listeners', () => {
      expect(gameStateManager.listeners).toEqual([]);
    });
  });

  describe('setState', () => {
    test('should update state', () => {
      gameStateManager.setState(GameState.RUNNING);
      expect(gameStateManager.getState()).toBe(GameState.RUNNING);
    });

    test('should set start time when transitioning to RUNNING', () => {
      gameStateManager.setState(GameState.RUNNING);
      expect(gameStateManager.startTime).toBeGreaterThan(0);
    });

    test('should notify listeners on state change', () => {
      const listener = jest.fn();
      gameStateManager.addListener(listener);
      
      gameStateManager.setState(GameState.RUNNING);
      
      expect(listener).toHaveBeenCalledWith(GameState.RUNNING, GameState.IDLE);
    });
  });

  describe('getState', () => {
    test('should return current state', () => {
      gameStateManager.setState(GameState.PAUSED);
      expect(gameStateManager.getState()).toBe(GameState.PAUSED);
    });
  });

  describe('isRunning', () => {
    test('should return true when running', () => {
      gameStateManager.setState(GameState.RUNNING);
      expect(gameStateManager.isRunning()).toBe(true);
    });

    test('should return false when not running', () => {
      gameStateManager.setState(GameState.PAUSED);
      expect(gameStateManager.isRunning()).toBe(false);
    });
  });

  describe('isPaused', () => {
    test('should return true when paused', () => {
      gameStateManager.setState(GameState.PAUSED);
      expect(gameStateManager.isPaused()).toBe(true);
    });

    test('should return false when not paused', () => {
      gameStateManager.setState(GameState.RUNNING);
      expect(gameStateManager.isPaused()).toBe(false);
    });
  });

  describe('isGameOver', () => {
    test('should return true when won', () => {
      gameStateManager.setState(GameState.WIN);
      expect(gameStateManager.isGameOver()).toBe(true);
    });

    test('should return true when lost', () => {
      gameStateManager.setState(GameState.LOSE);
      expect(gameStateManager.isGameOver()).toBe(true);
    });

    test('should return false when not game over', () => {
      gameStateManager.setState(GameState.RUNNING);
      expect(gameStateManager.isGameOver()).toBe(false);
    });
  });

  describe('pause', () => {
    test('should pause when running', () => {
      gameStateManager.setState(GameState.RUNNING);
      gameStateManager.pause();
      
      expect(gameStateManager.getState()).toBe(GameState.PAUSED);
      expect(gameStateManager._isPaused).toBe(true);
    });

    test('should not pause when not running', () => {
      gameStateManager.setState(GameState.IDLE);
      gameStateManager.pause();
      
      expect(gameStateManager.getState()).toBe(GameState.IDLE);
    });
  });

  describe('resume', () => {
    test('should resume when paused', () => {
      gameStateManager.setState(GameState.RUNNING);
      gameStateManager.pause();
      gameStateManager.resume();
      
      expect(gameStateManager.getState()).toBe(GameState.RUNNING);
      expect(gameStateManager._isPaused).toBe(false);
    });

    test('should not resume when not paused', () => {
      gameStateManager.setState(GameState.IDLE);
      gameStateManager.resume();
      
      expect(gameStateManager.getState()).toBe(GameState.IDLE);
    });
  });

  describe('start', () => {
    test('should set state to RUNNING', () => {
      gameStateManager.start();
      expect(gameStateManager.getState()).toBe(GameState.RUNNING);
    });
  });

  describe('win', () => {
    test('should set state to WIN', () => {
      gameStateManager.win();
      expect(gameStateManager.getState()).toBe(GameState.WIN);
    });
  });

  describe('lose', () => {
    test('should set state to LOSE', () => {
      gameStateManager.lose();
      expect(gameStateManager.getState()).toBe(GameState.LOSE);
    });
  });

  describe('reset', () => {
    test('should reset to IDLE state', () => {
      gameStateManager.setState(GameState.RUNNING);
      gameStateManager.elapsedTime = 10;
      gameStateManager.pause();
      
      gameStateManager.reset();
      
      expect(gameStateManager.getState()).toBe(GameState.IDLE);
      expect(gameStateManager.elapsedTime).toBe(0);
      expect(gameStateManager.isPaused()).toBe(false);
    });
  });

  describe('getElapsedTime', () => {
    test('should return elapsed time when running', () => {
      gameStateManager.setState(GameState.RUNNING);
      
      const elapsed = gameStateManager.getElapsedTime();
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    test('should not update elapsed time when paused', () => {
      gameStateManager.setState(GameState.RUNNING);
      gameStateManager.pause();
      
      const elapsed1 = gameStateManager.getElapsedTime();
      const elapsed2 = gameStateManager.getElapsedTime();
      
      expect(elapsed1).toBe(elapsed2);
    });
  });

  describe('addListener', () => {
    test('should add listener', () => {
      const listener = jest.fn();
      gameStateManager.addListener(listener);
      
      expect(gameStateManager.listeners).toContain(listener);
    });
  });

  describe('removeListener', () => {
    test('should remove listener', () => {
      const listener = jest.fn();
      gameStateManager.addListener(listener);
      gameStateManager.removeListener(listener);
      
      expect(gameStateManager.listeners).not.toContain(listener);
    });

    test('should not error when removing non-existent listener', () => {
      const listener = jest.fn();
      expect(() => {
        gameStateManager.removeListener(listener);
      }).not.toThrow();
    });
  });

  describe('notifyListeners', () => {
    test('should notify all listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      gameStateManager.addListener(listener1);
      gameStateManager.addListener(listener2);
      
      gameStateManager.setState(GameState.RUNNING);
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
