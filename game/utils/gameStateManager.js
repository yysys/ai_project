const { GameState } = require('./constants');

class GameStateManager {
  constructor() {
    this.state = GameState.IDLE;
    this.listeners = [];
    this.startTime = 0;
    this.elapsedTime = 0;
    this._isPaused = false;
  }

  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    
    if (newState === GameState.RUNNING) {
      this.startTime = Date.now();
    }
    
    this.notifyListeners(newState, oldState);
  }

  getState() {
    return this.state;
  }

  isRunning() {
    return this.state === GameState.RUNNING;
  }

  isPaused() {
    return this.state === GameState.PAUSED;
  }

  isGameOver() {
    return this.state === GameState.WIN || this.state === GameState.LOSE;
  }

  pause() {
    if (this.state === GameState.RUNNING) {
      this._isPaused = true;
      this.setState(GameState.PAUSED);
    }
  }

  resume() {
    if (this.state === GameState.PAUSED) {
      this._isPaused = false;
      this.setState(GameState.RUNNING);
    }
  }

  start() {
    this.setState(GameState.RUNNING);
  }

  win() {
    this.setState(GameState.WIN);
  }

  lose() {
    this.setState(GameState.LOSE);
  }

  reset() {
    this.setState(GameState.IDLE);
    this.elapsedTime = 0;
    this.isPaused = false;
  }

  getElapsedTime() {
    if (this.state === GameState.RUNNING && !this.isPaused) {
      this.elapsedTime = (Date.now() - this.startTime) / 1000;
    }
    return this.elapsedTime;
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(newState, oldState) {
    this.listeners.forEach(callback => {
      callback(newState, oldState);
    });
  }
}

module.exports = GameStateManager;
