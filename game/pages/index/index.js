const TT = require('../../utils/tt');
const app = getApp();

Page({
  data: {
    version: '1.0.0'
  },

  onLoad() {
  },

  onShow() {
  },

  startGame() {
    TT.navigateTo({
      url: '/pages/level/level'
    });
  },

  openSettings() {
    TT.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  }
});
