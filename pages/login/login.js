// login.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
      // 跳转到飞行页面
      wx.switchTab({
        url: '../flight/flight'
      })
    }
  },

  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      // 保存用户信息
      wx.setStorageSync('userInfo', e.detail.userInfo)
      
      // 登录
      wx.login({
        success: res => {
          console.log('Login code:', res.code)
          // 这里可以发送code到后台换取openId等信息
          
          // 跳转到飞行页面
          wx.switchTab({
            url: '../flight/flight'
          })
        }
      })
    }
  }
})