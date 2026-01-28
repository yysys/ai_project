// 游戏数据配置

// 无人机等级数据
const droneLevels = Array.from({ length: 10 }, (_, i) => {
  const level = i + 1;
  return {
    level: level,
    name: `MK-${level} 猎鹰`,
    hp: Math.floor(100 * Math.pow(1.2, i)), // 血量每级增加20%
    attack: Math.floor(10 * Math.pow(1.15, i)), // 攻击每级增加15%
    speed: Math.floor(10 + i * 2), // 速度线性增加
    price: Math.floor(1000 * Math.pow(1.5, i)), // 价格指数增长
    desc: `第${level}代高性能战斗无人机`
  };
});

// 导弹类型数据
const missileTypes = [
  {
    id: 'normal',
    name: '标准导弹',
    damage: 50,
    speed: 15,
    radius: 5,
    price: 100,
    desc: '通用型空对地导弹'
  },
  {
    id: 'ap',
    name: '穿甲弹',
    damage: 120,
    speed: 20,
    radius: 2,
    price: 300,
    desc: '高穿透力，适合攻击重装甲目标'
  },
  {
    id: 'he',
    name: '高爆弹',
    damage: 80,
    speed: 12,
    radius: 15,
    price: 500,
    desc: '大范围爆炸伤害，适合清理集群目标'
  }
];

module.exports = {
  droneLevels,
  missileTypes
};
