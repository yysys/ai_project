/**
 * 测试 GPT 工具功能
 */

const { mockWxEnvironment } = require('./mock-wx');

// 模拟环境
mockWxEnvironment();

// 测试 GPT 工具
const gptUtil = require('../../drone_flight_miniprogram/utils/gpt.js');

console.log('=== 测试 GPT 工具功能 ===');

// 测试 GPT 工具初始化
console.log('1. 测试 GPT 工具初始化:');
console.log('  GPT 工具存在:', !!gptUtil);
console.log('  getImage 方法存在:', typeof gptUtil.getImage === 'function');
console.log('  getDroneImage 方法存在:', typeof gptUtil.getDroneImage === 'function');

// 测试获取图片
console.log('\n2. 测试获取图片:');

gptUtil.getImage('test prompt')
  .then(imageUrl => {
    console.log('  获取图片成功:', !!imageUrl);
    console.log('  图片 URL 格式正确:', typeof imageUrl === 'string' && imageUrl.includes('http'));
  })
  .catch(error => {
    console.log('  获取图片失败:', error.message);
  });

// 测试获取无人机图片
console.log('\n3. 测试获取无人机图片:');

gptUtil.getDroneImage('drone')
  .then(imageUrl => {
    console.log('  获取无人机图片成功:', !!imageUrl);
    console.log('  图片 URL 格式正确:', typeof imageUrl === 'string' && imageUrl.includes('http'));
  })
  .catch(error => {
    console.log('  获取无人机图片失败:', error.message);
  });

// 测试获取地图图片
console.log('\n4. 测试获取地图图片:');

gptUtil.getDroneImage('map')
  .then(imageUrl => {
    console.log('  获取地图图片成功:', !!imageUrl);
    console.log('  图片 URL 格式正确:', typeof imageUrl === 'string' && imageUrl.includes('http'));
  })
  .catch(error => {
    console.log('  获取地图图片失败:', error.message);
  });

console.log('\n=== GPT 工具测试完成 ===');
