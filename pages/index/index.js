// index.js
Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 跳转到飞行页面
  goToFlight() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.redirectTo({
        url: '../login/login'
      })
      return
    }
    
    // 跳转到飞行页面
    wx.switchTab({
      url: '../flight/flight'
    })
  }
})