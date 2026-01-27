/**
 * 测试飞行页面功能
 */

const { mockWxEnvironment, mockWx } = require('../utils/mock-wx');

// 模拟环境
mockWxEnvironment();

// 测试飞行页面
const flightPage = require('../../drone_flight_miniprogram/pages/flight/flight.js');

console.log('=== 测试飞行页面功能 ===');

// 测试飞行页面初始化
console.log('1. 测试飞行页面初始化:');
console.log('  飞行页面存在:', !!flightPage);
console.log('  data 对象存在:', !!flightPage.data);

// 测试数据结构
console.log('\n2. 测试数据结构:');
console.log('  droneStatus 存在:', !!flightPage.data.droneStatus);
console.log('  mapImage 存在:', !!flightPage.data.mapImage);
console.log('  loading 初始值:', flightPage.data.loading);

// 测试方法存在性
console.log('\n3. 测试方法存在性:');
console.log('  getMapImage 方法存在:', typeof flightPage.getMapImage === 'function');
console.log('  getDroneImage 方法存在:', typeof flightPage.getDroneImage === 'function');

// 模拟页面实例
const flightPageInstance = {
  ...flightPage,
  data: { ...flightPage.data },
  setData(data) {
    this.data = { ...this.data, ...data };
    console.log('  setData 调用:', data);
  }
};

// 测试加载图片
console.log('\n4. 测试加载图片:');

// 调用获取地图图片
flightPageInstance.getMapImage();

// 调用获取无人机图片
flightPageInstance.getDroneImage();

console.log('\n=== 飞行页面测试完成 ===');
