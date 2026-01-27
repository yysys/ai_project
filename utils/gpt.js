// utils/gpt.js
const config = require('../config/config.js')

class GPTUtil {
  constructor() {
    this.apiKey = config.gpt.apiKey
    this.model = config.gpt.model
  }

  // 调用GPT模型获取图片
  async getImage(prompt) {
    try {
      // 这里应该调用OpenAI API获取图片
      // 由于微信小程序的限制，需要通过后端服务调用
      // 这里我们模拟返回图片URL
      console.log('GPT prompt:', prompt)
      
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          // 返回模拟的图片URL
          const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`
          resolve(imageUrl)
        }, 1000)
      })
    } catch (error) {
      console.error('GPT API error:', error)
      return null
    }
  }

  // 生成无人机相关的图片
  async getDroneImage(type) {
    let prompt = ''
    
    switch (type) {
      case 'drone':
        prompt = 'drone flying in the sky, realistic, high quality'
        break
      case 'map':
        prompt = 'realistic map view from above, terrain, high quality'
        break
      case 'logo':
        prompt = 'drone logo, minimalist design, blue color scheme'
        break
      default:
        prompt = 'drone flight interface, modern design'
    }
    
    return this.getImage(prompt)
  }
}

module.exports = new GPTUtil()