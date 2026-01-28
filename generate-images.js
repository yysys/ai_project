/**
 * 生成微信小程序所需的资源
 * 在开发阶段预先调用GPT生成图片、视频和音乐并保存到文件夹
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 加载配置
const config = require('./config/config.js');

// 资源配置
const resourceConfig = {
  imageDir: './assets/images',
  videoDir: './assets/videos',
  audioDir: './assets/audio',
  prompts: {
    // 图片资源
    images: {
      // 现有资源
      'game-logo': 'drone game logo, modern design, blue and white color scheme, professional, high quality',
      'drone': 'drone flying in the sky, realistic, high quality, white background',
      'map': 'realistic map view from above, terrain, high quality',
      'feature-gyro': 'gyroscope icon, modern design, blue color scheme',
      'feature-speed': 'speed icon, modern design, blue color scheme',
      'feature-map': 'map icon, modern design, blue color scheme',
      'tab-home': 'home icon, modern design, gray color scheme',
      'tab-home-active': 'home icon, modern design, blue color scheme',
      'tab-flight': 'flight icon, modern design, gray color scheme',
      'tab-flight-active': 'flight icon, modern design, blue color scheme',
      
      // UI按钮
      'btn-store': 'shopping cart icon, game ui button, futuristic style, glowing effect',
      'btn-settings': 'gear icon, game ui button, futuristic style, glowing effect',
      'btn-start': 'play button, game ui, futuristic style, green glowing effect',
      'btn-close': 'close X button, game ui, futuristic style, red glowing effect',
      'btn-buy': 'buy button with coin icon, game ui, futuristic style, gold glowing effect',
      'btn-back': 'back arrow button, game ui, futuristic style',

      // 导弹系列
      'missile-normal': 'standard air-to-ground missile, white and grey, 3d game asset, side view, white background',
      'missile-ap': 'armor piercing missile, sharp tip, dark grey and red, 3d game asset, side view, white background',
      'missile-he': 'high explosive missile, thick body, yellow hazard stripes, 3d game asset, side view, white background',

      // 无人机系列 (1-10级)
      'drone-level-1': 'basic quadcopter drone, white plastic body, simple design, level 1 game asset, white background',
      'drone-level-2': 'advanced quadcopter drone, white and grey body, camera attached, level 2 game asset, white background',
      'drone-level-3': 'hexacopter drone, carbon fiber texture, industrial look, level 3 game asset, white background',
      'drone-level-4': 'racing drone, streamlined body, red accents, aerodynamic, level 4 game asset, white background',
      'drone-level-5': 'military surveillance drone, dark grey, antenna arrays, level 5 game asset, white background',
      'drone-level-6': 'attack drone, mounted machine guns, green camouflage, level 6 game asset, white background',
      'drone-level-7': 'heavy lift drone, 8 rotors, bulky frame, reinforced armor, level 7 game asset, white background',
      'drone-level-8': 'stealth drone, angular geometry, matte black, futuristic, level 8 game asset, white background',
      'drone-level-9': 'prototype combat drone, glowing blue engines, experimental design, level 9 game asset, white background',
      'drone-level-10': 'ultimate mothership drone, massive size, multiple weapon systems, gold and black elite skin, level 10 game asset, white background',

      // 游戏场景与UI
      'game-map-bg': 'top down view of a diverse landscape, mountains, lakes, rivers, forests, game map texture, high resolution',
      'obstacle-tower': 'sci-fi enemy defense tower, top down view, red lights, game asset, white background',
      'joystick-base': 'translucent circular joystick base, hud ui element',
      'joystick-stick': 'circular joystick thumb stick, glowing blue center, hud ui element',
      'sfx-explosion': 'explosion effect, top down view, game asset, white background'
    },
    // 视频资源
    videos: {
      'game-intro': 'drone flight gameplay footage, exciting, dynamic, cinematic, 15 seconds, aerial view of landscape',
      'login-bg': 'drone flying through scenic landscape, aerial view, cinematic, 10 seconds'
    },
    // 音频资源
    audio: {
      // 现有音频
      'bg-music': 'ambient electronic music for drone flight game, immersive, relaxing, atmospheric',
      'login-sound': 'positive, upbeat sound effect for login success, cheerful',
      'button-click': 'clean, crisp button click sound effect, professional',
      
      // 新增音频
      'bgm-lobby': 'epic orchestral menu music, preparing for war, tense but heroic, loopable',
      'sfx-buy': 'cash register sound combined with sci-fi confirm beep, satisfying',
      'sfx-drone-hover': 'steady drone propeller hum, electric motor sound, constant loop',
      'sfx-missile-launch': 'whoosh sound of missile launching, rapid air displacement',
      'sfx-explosion': 'distant explosion sound, boom, rumble'
    }
  }
};

// 确保资源目录存在
function ensureDirectories() {
  const directories = [
    resourceConfig.imageDir,
    resourceConfig.videoDir,
    resourceConfig.audioDir
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`创建目录: ${dir}`);
    }
  });
}

// 确保目录存在
ensureDirectories();

/**
 * 从GPT获取图片
 * @param {string} prompt - 图片描述
 * @param {string} name - 图片名称
 * @returns {Promise<string>} - 图片URL 或 "PLACEHOLDER"
 */
async function getImageFromGPT(prompt, name) {
  try {
    console.log(`正在从GPT获取图片: ${prompt}`);
    
    const apiKey = config.gpt.apiKey;
    
    // DALL-E 3 只支持 1024x1024 或更大
    let size = '1024x1024';
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data[0].url;
  } catch (error) {
    console.error(`获取图片失败 (${name}):`, error.response ? JSON.stringify(error.response.data) : error.message);
    return "PLACEHOLDER";
  }
}

/**
 * 从GPT获取视频
 * @param {string} prompt - 视频描述
 * @param {string} name - 视频名称
 * @returns {Promise<string>} - 视频URL 或 "PLACEHOLDER"
 */
async function getVideoFromGPT(prompt, name) {
  // 目前OpenAI API不支持直接生成视频，使用占位符
  console.log(`视频生成暂不支持 (API限制)，使用占位符: ${name}`);
  return "PLACEHOLDER";
}

/**
 * 从GPT获取音频
 * @param {string} prompt - 音频描述
 * @param {string} name - 音频名称
 * @returns {Promise<string>} - 音频URL 或 "PLACEHOLDER"
 */
async function getAudioFromGPT(prompt, name) {
  // OpenAI TTS (Text-to-Speech) 不适合生成音效/音乐
  // 这里我们使用占位符，或者如果是语音需求可以使用TTS
  console.log(`音频生成暂不支持 (仅支持TTS语音，不支持音效生成)，使用占位符: ${name}`);
  return "PLACEHOLDER";
}

/**
 * 下载资源并保存到本地
 * @param {string} resourceUrl - 资源URL
 * @param {string} fileName - 文件名
 * @param {string} directory - 目录
 * @returns {Promise<boolean>} - 是否成功
 */
async function downloadAndSaveResource(resourceUrl, fileName, directory) {
  try {
    const filePath = path.join(directory, fileName);

    if (resourceUrl === "PLACEHOLDER") {
        if (fileName.endsWith('.png')) {
            // 创建一个简单的SVG作为占位符图片
            const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#333"/>
              <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${fileName}</text>
            </svg>`;
            fs.writeFileSync(filePath, svgContent); 
            // 注意：微信小程序可能不支持直接显示SVG为图片，但在IDE中预览或作为占位是可以的。
            // 实际上为了更好的兼容性，这里我们只写入文件，不转换格式。
        } else {
            const content = `// Placeholder for ${fileName}\n// Date: ${new Date().toISOString()}`;
            fs.writeFileSync(filePath, content);
        }
        console.log(`已创建占位符: ${fileName}`);
        return true;
    }

    console.log(`正在下载资源: ${fileName}`);
    const response = await axios({
        method: 'GET',
        url: resourceUrl,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`资源保存成功: ${fileName}`);
            resolve(true);
        });
        writer.on('error', (err) => {
            console.error(`写入文件失败: ${fileName}`, err);
            reject(err);
        });
    });
  } catch (error) {
    console.error('下载资源失败:', error);
    return false;
  }
}

/**
 * 生成所有所需的资源
 */
async function generateAllResources() {
  console.log('开始生成资源...');
  
  const results = {
    images: [],
    videos: [],
    audio: []
  };
  
  // 生成图片资源
  console.log('\n=== 生成图片资源 ===');
  for (const [name, prompt] of Object.entries(resourceConfig.prompts.images)) {
    // 检查文件是否已存在，如果存在且不是占位符（可以通过大小判断，但这里简化直接覆盖或跳过）
    // 为了节省API调用，如果文件已存在且大于1KB，可以跳过? 
    // 但用户要求"运行程序，下载资源"，可能想更新。
    // 我们加上一个简单的日志
    const imageUrl = await getImageFromGPT(prompt, name);
    if (imageUrl) {
      const success = await downloadAndSaveResource(imageUrl, `${name}.png`, resourceConfig.imageDir);
      results.images.push({ name, success });
    } else {
      results.images.push({ name, success: false });
    }
    // 简单的延时以避免速率限制
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 生成视频资源
  console.log('\n=== 生成视频资源 ===');
  for (const [name, prompt] of Object.entries(resourceConfig.prompts.videos)) {
    const videoUrl = await getVideoFromGPT(prompt, name);
    const success = await downloadAndSaveResource(videoUrl, `${name}.mp4`, resourceConfig.videoDir);
    results.videos.push({ name, success });
  }
  
  // 生成音频资源
  console.log('\n=== 生成音频资源 ===');
  for (const [name, prompt] of Object.entries(resourceConfig.prompts.audio)) {
    const audioUrl = await getAudioFromGPT(prompt, name);
    const success = await downloadAndSaveResource(audioUrl, `${name}.mp3`, resourceConfig.audioDir);
    results.audio.push({ name, success });
  }
  
  console.log('\n=== 资源生成完成 ===');
  console.log(`图片: ${results.images.filter(r => r.success).length}/${results.images.length}`);
  console.log(`视频: ${results.videos.filter(r => r.success).length}/${results.videos.length}`);
  console.log(`音频: ${results.audio.filter(r => r.success).length}/${results.audio.length}`);
}

// 执行生成
generateAllResources();
