// pages/game/game.js
const { droneLevels, missileTypes } = require('../../utils/gameData.js');

const FPS = 30;
const FRAME_TIME = 1000 / FPS;
const MAX_SPEED = 100; // km/h
const SPEED_STEP = 2; // 加减速步长
const TURN_SPEED = 5; // 转向速度
const MISSILE_SPEED = 0.00015; // 导弹速度 (度/帧)
const DRONE_MOVE_FACTOR = 0.00001; // 无人机移动系数

Page({
  data: {
    // 地图相关
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [],
    
    // HUD数据
    altitude: 100,
    speed: 0,
    score: 0,
    
    // 摇杆UI状态
    stickX: 0,
    stickY: 0,
    
    // 控制状态
    accelerating: false,
    decelerating: false
  },

  onLoad(options) {
    this.initGameSystem();
  },

  onReady() {
    this.mapCtx = wx.createMapContext('gameMap');
    this.audioCtx = wx.createInnerAudioContext();
    this.startGameLoop();
  },

  onUnload() {
    this.stopGameLoop();
    if (this.audioCtx) this.audioCtx.destroy();
  },

  // === 初始化系统 ===
  initGameSystem() {
    // 初始位置
    this.dronePos = { 
      lat: 23.099994, 
      lng: 113.324520,
      heading: 0 // 0=North, 90=East
    };

    // 摇杆逻辑状态
    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      dx: 0,
      dy: 0,
      angle: 0,
      power: 0 // 0-1 推力
    };

    // 游戏对象
    this.missiles = [];
    this.explosions = [];
    
    // 生成障碍物
    this.obstacles = [];
    for (let i = 0; i < 5; i++) {
      this.obstacles.push({
        id: 100 + i,
        latitude: this.dronePos.lat + (Math.random() - 0.5) * 0.005,
        longitude: this.dronePos.lng + (Math.random() - 0.5) * 0.005,
        width: 40,
        height: 40,
        iconPath: '../../assets/images/obstacle-tower.png', // 需要生成
        hp: 100
      });
    }

    this.updateMarkers();
  },

  // === 摇杆交互 ===
  onTouchStart(e) {
    const touch = e.touches[0];
    this.joystick.active = true;
    this.joystick.startX = touch.clientX;
    this.joystick.startY = touch.clientY;
  },

  onTouchMove(e) {
    if (!this.joystick.active) return;
    const touch = e.touches[0];
    
    let dx = touch.clientX - this.joystick.startX;
    let dy = touch.clientY - this.joystick.startY;
    
    // 限制半径
    const maxRadius = 50;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      dx *= ratio;
      dy *= ratio;
    }

    // 更新UI
    this.setData({
      stickX: dx,
      stickY: dy
    });

    // 更新逻辑状态
    this.joystick.dx = dx / maxRadius; // -1 to 1
    this.joystick.dy = dy / maxRadius; // -1 to 1
  },

  onTouchEnd() {
    this.joystick.active = false;
    this.joystick.dx = 0;
    this.joystick.dy = 0;
    this.setData({ stickX: 0, stickY: 0 });
  },

  // === 游戏主循环 ===
  startGameLoop() {
    this.gameTimer = setInterval(() => {
      this.updatePhysics();
      this.updateGameLogic();
      this.render();
    }, FRAME_TIME);
  },

  stopGameLoop() {
    clearInterval(this.gameTimer);
  },

  // 物理更新
  updatePhysics() {
    // 1. 速度控制
    let currentSpeed = this.data.speed;
    if (this.data.accelerating && currentSpeed < MAX_SPEED) {
      currentSpeed += SPEED_STEP;
    } else if (this.data.decelerating && currentSpeed > 0) {
      currentSpeed -= SPEED_STEP;
    }
    
    // 2. 位置更新
    // 摇杆控制移动方向，stickY < 0 是向上(北)
    if (Math.abs(this.joystick.dx) > 0.1 || Math.abs(this.joystick.dy) > 0.1) {
      // 摇杆控制平移
      // 纬度增加 = 北 (dy < 0)
      // 经度增加 = 东 (dx > 0)
      this.dronePos.lat -= this.joystick.dy * currentSpeed * DRONE_MOVE_FACTOR;
      this.dronePos.lng += this.joystick.dx * currentSpeed * DRONE_MOVE_FACTOR;
      
      // 计算朝向 (用于发射导弹方向)
      // atan2(y, x) -> 0 is East. We want 0 is North.
      // North: dx=0, dy=-1. atan2(-1, 0) = -PI/2.
      // Let's use standard atan2 and convert.
      this.dronePos.heading = Math.atan2(this.joystick.dy, this.joystick.dx);
    } else if (currentSpeed > 0) {
      // 如果有速度但没摇杆，保持惯性 (沿当前Heading飞行)
      this.dronePos.lat -= Math.sin(this.dronePos.heading) * currentSpeed * DRONE_MOVE_FACTOR;
      this.dronePos.lng += Math.cos(this.dronePos.heading) * currentSpeed * DRONE_MOVE_FACTOR;
    }

    // 3. 导弹飞行
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.lat += m.vLat;
      m.lng += m.vLng;
      m.life--;
      
      // 移除超时导弹
      if (m.life <= 0) {
        this.missiles.splice(i, 1);
      }
    }

    this.data.speed = currentSpeed; // 暂存，render时统一setData
  },

  // 逻辑更新 (碰撞检测等)
  updateGameLogic() {
    // 检测导弹命中障碍物
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      let hit = false;
      
      for (let j = this.obstacles.length - 1; j >= 0; j--) {
        const obs = this.obstacles[j];
        const dist = this.getDistance(m.lat, m.lng, obs.latitude, obs.longitude);
        
        // 简单碰撞判定 (距离小于阈值)
        if (dist < 0.0002) { // 约20米
          this.createExplosion(obs.latitude, obs.longitude);
          this.obstacles.splice(j, 1); // 移除障碍物
          this.missiles.splice(i, 1); // 移除导弹
          this.data.score += 100;
          hit = true;
          this.playSound('sfx-explosion');
          break;
        }
      }
      if (hit) break;
    }
    
    // 清理爆炸特效
    const now = Date.now();
    this.explosions = this.explosions.filter(e => now - e.startTime < 500);
  },

  // 渲染更新
  render() {
    // 构建Markers列表
    const markers = [];
    
    // 1. 障碍物
    markers.push(...this.obstacles);
    
    // 2. 导弹 (使用marker显示)
    this.missiles.forEach((m, index) => {
      markers.push({
        id: 200 + index,
        latitude: m.lat,
        longitude: m.lng,
        width: 15,
        height: 15,
        iconPath: '../../assets/images/missile-normal.png',
        // 旋转导弹图片使其朝向飞行方向
        rotate: m.angle * 180 / Math.PI + 90 
      });
    });

    // 3. 爆炸 (作为marker)
    this.explosions.forEach((e, index) => {
      markers.push({
        id: 300 + index,
        latitude: e.lat,
        longitude: e.lng,
        width: 40,
        height: 40,
        iconPath: '../../assets/images/sfx-explosion.png' // 假设有爆炸图
      });
    });

    // 4. 无人机 (作为Marker，或者使用cover-view)
    // 如果用 map 的 center 来追踪无人机，无人机始终在屏幕中心
    // 我们这里为了简单，用 Marker 表示无人机位置，并让 Map Center 跟随
    markers.push({
      id: 0,
      latitude: this.dronePos.lat,
      longitude: this.dronePos.lng,
      width: 40,
      height: 40,
      iconPath: '../../assets/images/drone-level-1.png', // 动态读取等级
      anchor: {x: 0.5, y: 0.5},
      rotate: 0 // 无人机始终朝北，或者随摇杆转动
    });

    this.setData({
      latitude: this.dronePos.lat,
      longitude: this.dronePos.lng,
      markers: markers,
      speed: Math.floor(this.data.speed),
      score: this.data.score
    });
  },

  // === 辅助功能 ===
  startAccelerate() { this.setData({ accelerating: true }); },
  stopAccelerate() { this.setData({ accelerating: false }); },
  startDecelerate() { this.setData({ decelerating: true }); },
  stopDecelerate() { this.setData({ decelerating: false }); },

  fireMissile() {
    const angle = this.dronePos.heading || -Math.PI / 2; // 默认朝北
    
    this.missiles.push({
      lat: this.dronePos.lat,
      lng: this.dronePos.lng,
      vLat: Math.sin(angle) * MISSILE_SPEED * -1, // y轴向下增加，纬度向上增加，反一下? 
      // 摇杆dy向下正，纬度向上正。
      // dy < 0 -> Up -> Lat increase.
      // sin(angle): if angle=-PI/2 (Up), sin=-1. Lat should increase.
      // So vLat = sin * speed * -1 is correct.
      vLng: Math.cos(angle) * MISSILE_SPEED,
      angle: angle,
      life: 100 // 存活帧数
    });
    
    this.playSound('sfx-missile-launch');
  },

  createExplosion(lat, lng) {
    this.explosions.push({
      lat, lng, startTime: Date.now()
    });
  },

  getDistance(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
  },

  updateMarkers() {
    // 初始渲染
    this.render();
  },

  playSound(name) {
    const ctx = wx.createInnerAudioContext();
    ctx.src = `../../assets/audio/${name}.mp3`;
    ctx.play();
  }
});
