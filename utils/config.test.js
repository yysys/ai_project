/**
 * 测试配置文件管理功能
 */

const { mockWxEnvironment } = require('./mock-wx');

// 模拟环境
mockWxEnvironment();

// 测试配置文件
const config = require('../config/config.js');

console.log('=== 测试配置文件管理 ===');

// 测试配置文件结构
console.log('1. 测试配置文件结构:');
console.log('  GPT 配置存在:', !!config.gpt);
console.log('  微信配置存在:', !!config.wechat);
console.log('  服务器配置存在:', !!config.server);
console.log('  图片存储配置存在:', !!config.image);

// 测试 GPT 配置
console.log('\n2. 测试 GPT 配置:');
console.log('  API Key 格式正确:', typeof config.gpt.apiKey === 'string');
console.log('  模型设置正确:', config.gpt.model === 'gpt-4-vision-preview');
console.log('  Max Tokens 设置正确:', config.gpt.maxTokens === 1000);
console.log('  Temperature 设置正确:', config.gpt.temperature === 0.0);

// 测试图片存储配置
console.log('\n3. 测试图片存储配置:');
console.log('  存储路径设置正确:', config.image.storagePath === 'images/gpt/');
console.log('  最大文件大小设置正确:', config.image.maxSize === 5 * 1024 * 1024);

console.log('\n=== 配置文件测试完成 ===');
