// pages/lobby/lobby.js
const { droneLevels, missileTypes } = require('../../utils/gameData.js');

Page({
  data: {
    userInfo: null,
    coins: 1000, // 初始金币
    currentDroneLevel: 1, // 当前拥有的最高等级无人机
    
    // 弹窗状态
    showStore: false,
    showSettings: false,
    currentStoreTab: 'drones', // 'drones' or 'missiles'
    
    // 设置状态
    gameSoundEnabled: true,
    droneSoundEnabled: true,
    
    // 数据源
    droneLevels: droneLevels,
    missileTypes: missileTypes
  },

  onLoad() {
    this.loadUserData();
    this.loadSettings();
    this.initBGM();
  },

  onShow() {
    // 每次显示页面刷新数据
    this.loadUserData();
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = wx.getStorageSync('userInfo');
    const coins = wx.getStorageSync('coins') || 5000; // 默认给5000金币方便测试
    const currentDroneLevel = wx.getStorageSync('droneLevel') || 1;
    
    this.setData({
      userInfo,
      coins,
      currentDroneLevel
    });
  },

  // 加载设置
  loadSettings() {
    const gameSound = wx.getStorageSync('gameSoundEnabled');
    const droneSound = wx.getStorageSync('droneSoundEnabled');
    
    this.setData({
      gameSoundEnabled: gameSound === '' ? true : gameSound,
      droneSoundEnabled: droneSound === '' ? true : droneSound
    });
  },

  // 初始化背景音乐
  initBGM() {
    this.bgmContext = wx.createInnerAudioContext();
    this.bgmContext.src = '../../assets/audio/bgm-lobby.mp3';
    this.bgmContext.loop = true;
    
    if (this.data.gameSoundEnabled) {
      this.bgmContext.play();
    }
  },

  // 开始游戏
  startGame() {
    wx.showToast({
      title: '正在进入战场...',
      icon: 'loading',
      duration: 1000
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/game/game',
      });
    }, 1000);
  },

  // 打开商城
  openStore() {
    this.setData({ showStore: true });
  },

  // 关闭商城
  closeStore() {
    this.setData({ showStore: false });
  },

  // 切换商城Tab
  switchStoreTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentStoreTab: tab });
  },

  // 购买无人机
  buyDrone(e) {
    const item = e.currentTarget.dataset.item;
    
    if (this.data.coins < item.price) {
      wx.showToast({ title: '金币不足', icon: 'none' });
      return;
    }
    
    if (this.data.currentDroneLevel >= item.level) {
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: `确定花费 ${item.price} 金币购买 ${item.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          const newCoins = this.data.coins - item.price;
          this.setData({
            coins: newCoins,
            currentDroneLevel: item.level
          });
          
          // 保存数据
          wx.setStorageSync('coins', newCoins);
          wx.setStorageSync('droneLevel', item.level);
          
          wx.showToast({ title: '购买成功', icon: 'success' });
        }
      }
    });
  },

  // 购买导弹
  buyMissile(e) {
    const item = e.currentTarget.dataset.item;
    
    if (this.data.coins < item.price) {
      wx.showToast({ title: '金币不足', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认购买',
      content: `确定花费 ${item.price} 金币购买 ${item.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          const newCoins = this.data.coins - item.price;
          // 增加库存逻辑这里简化为仅扣费，实际项目应增加库存数量
          this.setData({
            coins: newCoins
          });
          
          wx.setStorageSync('coins', newCoins);
          wx.showToast({ title: '购买成功', icon: 'success' });
        }
      }
    });
  },

  // 打开设置
  openSettings() {
    this.setData({ showSettings: true });
  },

  // 关闭设置
  closeSettings() {
    this.setData({ showSettings: false });
  },

  // 切换游戏音效
  toggleGameSound(e) {
    const enabled = e.detail.value;
    this.setData({ gameSoundEnabled: enabled });
    wx.setStorageSync('gameSoundEnabled', enabled);
    
    if (this.bgmContext) {
      if (enabled) {
        this.bgmContext.play();
      } else {
        this.bgmContext.pause();
      }
    }
  },

  // 切换无人机音效
  toggleDroneSound(e) {
    const enabled = e.detail.value;
    this.setData({ droneSoundEnabled: enabled });
    wx.setStorageSync('droneSoundEnabled', enabled);
  },
  
  preventScroll() {}
});
