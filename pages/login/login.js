// login.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 加载相关
    loadingProgress: 0,
    loadingStatus: '准备加载...',
    showLoginModal: false,
    // 游戏状态
    soundStatus: '开启',
    videoQuality: '高清',
    connectionStatus: '稳定'
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
      return
    }
    
    // 开始加载游戏资源
    this.loadGameResources()
  },

  // 加载游戏资源
  loadGameResources() {
    const resources = [
      { name: '游戏logo', size: 15 },
      { name: '游戏视频', size: 30 },
      { name: '游戏音效', size: 20 },
      { name: '无人机模型', size: 20 },
      { name: '地图资源', size: 15 }
    ]
    
    let progress = 0
    let currentResourceIndex = 0
    const gameAudio = wx.createInnerAudioContext()
    
    const loadInterval = setInterval(() => {
      if (currentResourceIndex < resources.length) {
        const currentResource = resources[currentResourceIndex]
        progress += 1
        
        if (progress >= resources.slice(0, currentResourceIndex + 1).reduce((sum, r) => sum + r.size, 0)) {
          currentResourceIndex++
        }
        
        this.setData({
          loadingProgress: progress,
          loadingStatus: currentResourceIndex < resources.length ? `加载中: ${resources[currentResourceIndex].name}` : '加载完成，准备进入游戏'
        })
      } else {
        clearInterval(loadInterval)
        // 启用游戏音效
        gameAudio.src = '../../assets/audio/bg-music.mp3'
        gameAudio.loop = true
        gameAudio.play()
        
        // 显示登录弹窗
        setTimeout(() => {
          this.setData({
            showLoginModal: true
          })
        }, 500)
      }
    }, 100)
  },

  // 关闭登录弹窗
  closeLoginModal() {
    this.setData({
      showLoginModal: false
    })
  },

  // 登录按钮点击事件
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      // 保存用户信息
      wx.setStorageSync('userInfo', e.detail.userInfo)
      
      // 播放登录音效
      this.playLoginSound()
      
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
  },
  
  // 播放登录音效
  playLoginSound() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = '../../assets/audio/login-sound.mp3'
    innerAudioContext.play()
    innerAudioContext.onEnded(() => {
      innerAudioContext.destroy()
    })
  }
})