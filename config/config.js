// config.js
module.exports = {
  // GPT配置
  gpt: {
    apiKey: '', // 请在实际使用时填写
    model: 'gpt-4-vision-preview',
    maxTokens: 1000,
    temperature: 0.0
  },
  // 微信小程序配置
  wechat: {
    appId: '', // 请在实际使用时填写
    appSecret: '' // 请在实际使用时填写
  },
  // 服务器配置
  server: {
    baseUrl: '' // 请在实际使用时填写
  },
  // 图片存储配置
  image: {
    storagePath: 'images/gpt/',
    maxSize: 5 * 1024 * 1024 // 5MB
  }
}