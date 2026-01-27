/**
 * 测试登录页面功能
 */

const { mockWxEnvironment, mockWx } = require('../utils/mock-wx');

// 模拟环境
mockWxEnvironment();

// 保存 Page 函数的调用参数
let loginPageConfig = null;
const originalPage = global.Page;
global.Page = function(config) {
  console.log('Page initialized with config:', Object.keys(config));
  loginPageConfig = config;
  return originalPage(config);
};

// 导入登录页面
require('./login/login.js');

const loginPage = loginPageConfig;

console.log('=== 测试登录页面功能 ===');

// 测试登录页面初始化
console.log('1. 测试登录页面初始化:');
console.log('  登录页面存在:', !!loginPage);
console.log('  data 对象存在:', !!loginPage.data);
console.log('  onLoad 方法存在:', typeof loginPage.onLoad === 'function');
console.log('  onGetUserInfo 方法存在:', typeof loginPage.onGetUserInfo === 'function');

// 测试数据结构
console.log('\n2. 测试数据结构:');
if (loginPage.data) {
  console.log('  userInfo 初始值:', loginPage.data.userInfo);
  console.log('  hasUserInfo 初始值:', loginPage.data.hasUserInfo);
  console.log('  canIUse 初始值:', loginPage.data.canIUse);
} else {
  console.log('  data 对象不存在');
}

// 测试 onLoad 方法
console.log('\n3. 测试 onLoad 方法:');

// 模拟页面实例
const loginPageInstance = {
  ...loginPage,
  data: { ...loginPage.data },
  setData(data) {
    this.data = { ...this.data, ...data };
    console.log('  setData 调用:', data);
  }
};

// 调用 onLoad
loginPageInstance.onLoad();

// 测试 onGetUserInfo 方法
console.log('\n4. 测试 onGetUserInfo 方法:');

// 模拟用户信息
const mockUserInfo = {
  detail: {
    userInfo: {
      nickName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      gender: 1
    }
  }
};

// 模拟 wx.redirectTo
const originalRedirectTo = wx.redirectTo;
wx.redirectTo = function(options) {
  console.log('  重定向到:', options.url);
};

// 调用 onGetUserInfo
loginPageInstance.onGetUserInfo(mockUserInfo);

// 恢复原始方法
wx.redirectTo = originalRedirectTo;

console.log('\n=== 登录页面测试完成 ===');
