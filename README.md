# 无人机飞行微信小程序

这是一个无人机飞行微信小程序，支持微信用户登录，通过手机陀螺仪控制无人机飞行角度，以及加速/减速控制。

## 项目结构

```
drone_flight_miniprogram/
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── config/             # 配置文件
│   └── config.js       # 配置管理
├── images/             # 图片资源（预先生成）
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── login/          # 登录页
│   └── flight/         # 飞行控制页
└── utils/              # 工具类
```

## 开发流程

### 1. 生成图片

在开发阶段，需要预先调用GPT生成图片并保存到 `images` 文件夹。

```bash
# 安装依赖
npm install axios

# 生成图片
node generate-images.js
```

图片生成脚本会根据 `generate-images.js` 中的 prompt 配置，调用GPT生成所需的图片，并保存到 `drone_flight_miniprogram/images` 文件夹。

### 2. 配置

在 `drone_flight_miniprogram/config/config.js` 中配置相关参数：

```javascript
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
```

### 3. 运行微信小程序

1. 打开微信开发者工具
2. 导入 `drone_flight_miniprogram` 目录
3. 点击「编译」按钮运行小程序

## 功能说明

### 微信登录
- 支持微信用户登录
- 登录后可享受完整的飞行控制体验

### 无人机飞行控制
- 通过手机陀螺仪控制无人机飞行角度
- 点击按钮控制无人机的加速和减速
- 实时显示无人机的速度、高度和方向

### 图片管理
- 所有图片在开发阶段预先生成并保存到本地
- 运行微信小程序时直接使用本地图片，不调用GPT

## 技术实现

- **前端框架**：微信小程序原生框架
- **陀螺仪控制**：使用微信小程序的 `wx.startGyroscope` API
- **图片生成**：在开发阶段通过GPT生成图片
- **状态管理**：使用微信小程序的页面数据管理

## 注意事项

1. 请确保在开发阶段生成所有需要的图片
2. 运行微信小程序时不需要调用GPT，所有图片都使用本地存储的版本
3. 如需更新图片，重新运行 `generate-images.js` 脚本即可

## 测试

在 `test` 目录下有完整的测试代码，可用于测试各个功能模块：

```bash
# 运行测试
node test/utils/config.test.js
node test/utils/gpt.test.js
node test/utils/imageStorage.test.js
node test/pages/login.test.js
node test/pages/flight.test.js
```
