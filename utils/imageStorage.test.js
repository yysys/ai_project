/**
 * 测试图片存储功能
 */

const { mockWxEnvironment } = require('./mock-wx');

// 模拟环境
mockWxEnvironment();

// 测试图片存储工具
const imageStorage = require('./imageStorage.js');

console.log('=== 测试图片存储功能 ===');

// 测试图片存储工具初始化
console.log('1. 测试图片存储工具初始化:');
console.log('  图片存储工具存在:', !!imageStorage);
console.log('  downloadAndSaveImage 方法存在:', typeof imageStorage.downloadAndSaveImage === 'function');
console.log('  getSavedImages 方法存在:', typeof imageStorage.getSavedImages === 'function');
console.log('  deleteSavedImage 方法存在:', typeof imageStorage.deleteSavedImage === 'function');

// 测试下载和存储图片
console.log('\n2. 测试下载和存储图片:');

const testImageUrl = 'https://example.com/test-image.png';

imageStorage.downloadAndSaveImage(testImageUrl, 'test')
  .then(localPath => {
    console.log('  下载和存储图片成功:', !!localPath);
    console.log('  本地路径格式正确:', typeof localPath === 'string' && localPath.includes('/'));
  })
  .catch(error => {
    console.log('  下载和存储图片失败:', error.message);
  });

// 测试获取保存的图片列表
console.log('\n3. 测试获取保存的图片列表:');

imageStorage.getSavedImages()
  .then(fileList => {
    console.log('  获取保存的图片列表成功:', !!fileList);
    console.log('  文件列表格式正确:', Array.isArray(fileList));
    console.log('  文件列表长度:', fileList.length);
  })
  .catch(error => {
    console.log('  获取保存的图片列表失败:', error.message);
  });

// 测试删除保存的图片
console.log('\n4. 测试删除保存的图片:');

const testFilePath = '/mock/path/to/image.png';

imageStorage.deleteSavedImage(testFilePath)
  .then(success => {
    console.log('  删除保存的图片成功:', success);
  })
  .catch(error => {
    console.log('  删除保存的图片失败:', error.message);
  });

console.log('\n=== 图片存储测试完成 ===');
