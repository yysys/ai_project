const GameEngine = require('./utils/gameEngine');

let gameEngine;
let canvas;
let ctx;
let screenWidth;
let screenHeight;
let currentLevelId = 1;
let gameActive = false;

function initGame() {
  try {
    if (typeof tt === 'undefined') {
      console.error('tt object is not available');
      return;
    }

    if (typeof tt.createCanvas !== 'function') {
      console.error('tt.createCanvas is not a function');
      return;
    }

    canvas = tt.createCanvas();
    ctx = canvas.getContext('2d');

    screenWidth = tt.getSystemInfoSync().windowWidth;
    screenHeight = tt.getSystemInfoSync().windowHeight;

    canvas.width = screenWidth;
    canvas.height = screenHeight;

    gameEngine = new GameEngine();
    gameEngine.init(canvas, ctx, screenWidth, screenHeight);

    gameEngine.onWin = () => {
      handleWin();
    };

    gameEngine.onLose = () => {
      handleLose();
    };

    gameEngine.onUpdate = (elapsedTime) => {
      updateUI(elapsedTime);
    };

    tt.onTouchStart((e) => {
      if (!gameActive) {
        return;
      }

      const touch = e.touches[0];
      gameEngine.handleClick(touch.clientX, touch.clientY);
    });

    startLevel(1);
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

function startLevel(levelId) {
  currentLevelId = levelId || 1;
  const success = gameEngine.startLevel(currentLevelId);
  if (success) {
    gameActive = true;
  } else {
    tt.showToast({
      title: '关卡加载失败',
      icon: 'none'
    });
  }
}

function handleWin() {
  gameActive = false;
  const level = gameEngine.levelManager.getCurrentLevel();
  const stars = level.stars;
  const score = level.score;

  tt.showModal({
    title: '恭喜过关！',
    content: `获得 ${stars} 星，得分：${score}`,
    showCancel: false,
    success: () => {
      if (currentLevelId < 10) {
        startLevel(currentLevelId + 1);
      } else {
        tt.showModal({
          title: '通关！',
          content: '恭喜你完成了所有关卡！',
          showCancel: false
        });
      }
    }
  });
}

function handleLose() {
  gameActive = false;
  tt.showModal({
    title: '游戏失败',
    content: '要重新开始吗？',
    success: (res) => {
      if (res.confirm) {
        startLevel(currentLevelId);
      }
    }
  });
}

function updateUI(elapsedTime) {
}

setTimeout(() => {
  initGame();
}, 100);
