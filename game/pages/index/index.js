const app = getApp();

Page({
  data: {
    version: '1.0.0'
  },

  onLoad() {
    console.log('主页加载');
  },

  onShow() {
    console.log('主页显示');
  },

  startGame() {
    wx.navigateTo({
      url: '/pages/level/level'
    });
  },

  openSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  }
});
