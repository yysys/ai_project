// flight.js

Page({
  data: {
    droneStatus: {
      speed: 0,
      altitude: 0,
      direction: 0
    },
    rotation: 0,
    gyroStatus: '未激活',
    gyroscope: null
  },

  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.redirectTo({
        url: '../login/login'
      })
      return
    }

    // 初始化无人机状态
    this.initDroneStatus()
    
    // 初始化陀螺仪
    this.initGyroscope()
  },

  onUnload() {
    // 停止陀螺仪
    if (this.data.gyroscope) {
      wx.stopGyroscope()
    }
  },

  // 初始化无人机状态
  initDroneStatus() {
    this.setData({
      droneStatus: {
        speed: 0,
        altitude: 0,
        direction: 0
      }
    })
  },

  // 初始化陀螺仪
  initGyroscope() {
    wx.startGyroscope({
      interval: 'game',
      success: () => {
        this.setData({ gyroStatus: '已激活' })
        
        wx.onGyroscopeChange(res => {
          // 计算旋转角度
          const rotation = res.x * 90
          this.setData({ rotation })
          
          // 根据陀螺仪数据更新无人机方向
          this.updateDroneDirection(rotation)
        })
      },
      fail: () => {
        this.setData({ gyroStatus: '激活失败' })
        wx.showToast({
          title: '陀螺仪无法使用',
          icon: 'none'
        })
      }
    })
  },

  // 更新无人机方向
  updateDroneDirection(rotation) {
    const newDirection = (this.data.droneStatus.direction + rotation) % 360
    this.setData({
      droneStatus: {
        ...this.data.droneStatus,
        direction: newDirection
      }
    })
  },

  // 加速
  increaseSpeed() {
    const newSpeed = Math.min(this.data.droneStatus.speed + 5, 100)
    this.setData({
      droneStatus: {
        ...this.data.droneStatus,
        speed: newSpeed
      }
    })
  },

  // 减速
  decreaseSpeed() {
    const newSpeed = Math.max(this.data.droneStatus.speed - 5, 0)
    this.setData({
      droneStatus: {
        ...this.data.droneStatus,
        speed: newSpeed
      }
    })
  }
})