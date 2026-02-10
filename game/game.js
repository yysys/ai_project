const GameEngine = require('./utils/gameEngine');
const logger = require('./utils/logger');

let gameEngine;
let canvas;
let ctx;
let screenWidth;
let screenHeight;
let currentLevelId = 1;
let gameActive = false;

function initGame() {
  logger.log('=== initGame 被调用 ===');
  try {
    if (typeof tt === 'undefined') {
      logger.error('tt object is not available');
      console.error('tt object is not available');
      return;
    }

    if (typeof tt.createCanvas !== 'function') {
      logger.error('tt.createCanvas is not a function');
      console.error('tt.createCanvas is not a function');
      return;
    }

    logger.log('创建 canvas...');
    console.log('创建 canvas...');
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

    logger.log('注册 onTouchStart 事件监听器...');
    tt.onTouchStart((e) => {
      logger.log('=== onTouchStart 触发 ===');
      logger.log('gameActive:', gameActive);
      logger.log('触摸事件对象类型:', typeof e);
      logger.log('触摸事件:', JSON.stringify(e));
      
      if (!gameActive) {
        logger.log('gameActive 为 false，忽略触摸');
        return;
      }

      const touch = e.touches ? e.touches[0] : null;
      logger.log('touch 对象:', touch);
      if (touch) {
        logger.log('触摸坐标:', touch.clientX, touch.clientY);
        gameEngine.handleClick(touch.clientX, touch.clientY);
      } else {
        logger.error('touch 对象为 null!');
      }
    });
    logger.log('onTouchStart 事件监听器已注册');

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
