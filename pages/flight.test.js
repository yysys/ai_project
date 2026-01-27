/**
 * 测试飞行页面功能
 */

const { mockWxEnvironment, mockWx } = require('../utils/mock-wx');

// 模拟环境
mockWxEnvironment();

// 保存 Page 函数的调用参数
let flightPageConfig = null;
const originalPage = global.Page;
global.Page = function(config) {
  console.log('Page initialized with config:', Object.keys(config));
  flightPageConfig = config;
  return originalPage(config);
};

// 导入飞行页面
require('./flight/flight.js');

const flightPage = flightPageConfig;

console.log('=== 测试飞行页面功能 ===');

// 测试飞行页面初始化
console.log('1. 测试飞行页面初始化:');
console.log('  飞行页面存在:', !!flightPage);
console.log('  data 对象存在:', !!flightPage.data);

// 测试数据结构
console.log('\n2. 测试数据结构:');
if (flightPage.data) {
  console.log('  droneStatus 存在:', !!flightPage.data.droneStatus);
  console.log('  rotation 存在:', typeof flightPage.data.rotation === 'number');
  console.log('  gyroStatus 初始值:', flightPage.data.gyroStatus);
}

// 测试方法存在性
console.log('\n3. 测试方法存在性:');
console.log('  initDroneStatus 方法存在:', typeof flightPage.initDroneStatus === 'function');
console.log('  initGyroscope 方法存在:', typeof flightPage.initGyroscope === 'function');
console.log('  increaseSpeed 方法存在:', typeof flightPage.increaseSpeed === 'function');
console.log('  decreaseSpeed 方法存在:', typeof flightPage.decreaseSpeed === 'function');

// 模拟页面实例
const flightPageInstance = {
  ...flightPage,
  data: { ...flightPage.data },
  setData(data) {
    this.data = { ...this.data, ...data };
    console.log('  setData 调用:', data);
  }
};

// 测试初始化无人机状态
console.log('\n4. 测试初始化无人机状态:');
flightPageInstance.initDroneStatus();

// 测试加速和减速
console.log('\n5. 测试加速和减速:');
flightPageInstance.increaseSpeed();
console.log('  加速后速度:', flightPageInstance.data.droneStatus.speed);
flightPageInstance.decreaseSpeed();
console.log('  减速后速度:', flightPageInstance.data.droneStatus.speed);

console.log('\n=== 飞行页面测试完成 ===');
