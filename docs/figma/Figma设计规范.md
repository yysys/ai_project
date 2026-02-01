# Figma设计规范 - 猪了个猪（点击跑动版）

## Figma项目结构

### 1. 页面结构（Pages）

#### 1.1 Design System（设计系统）
- Colors（色彩系统）
- Typography（字体系统）
- Components（组件库）
- Icons（图标库）
- Assets（资源素材）

#### 1.2 Screens（界面设计）
- Home Screen（主页）
- Game Screen（游戏页）
- Result Screen（结果页）
- Setting Screen（设置页）
- Leaderboard Screen（排行榜页）
- Shop Screen（商店页）

#### 1.3 Prototypes（原型设计）
- User Flow（用户流程）
- Interaction Flow（交互流程）

---

## 色彩系统（Colors）

### 主色调（Primary Colors）
```
Primary Pink: #FF6B9D
Primary Pink Light: #FF8FB1
Primary Pink Dark: #E85A8A
```

### 辅助色（Secondary Colors）
```
Yellow: #FFD93D
Yellow Light: #FFE566
Yellow Dark: #E6C235
```

### 背景色（Background Colors）
```
Background: #FFF5F8
Background Light: #FFF0F5
Background Dark: #FFE9F0
Game Background: #F0FFF4（草地绿）
```

### 文字色（Text Colors）
```
Text Primary: #333333
Text Secondary: #666666
Text Tertiary: #999999
Text White: #FFFFFF
```

### 状态色（Status Colors）
```
Success: #52C41A
Warning: #FAAD14
Error: #F5222D
Info: #1890FF
```

### 猪猪类型色（Pig Type Colors）
```
Normal Pig: #FF6B9D（粉色）
Fast Pig: #FFD93D（黄色）
Jump Pig: #52C41A（绿色）
Bomb Pig: #F5222D（红色）
Magnet Pig: #1890FF（蓝色）
```

---

## 字体系统（Typography）

### 字体家族（Font Family）
```
Primary Font: PingFang SC
Fallback Font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

### 字号规范（Font Sizes）
```
H1: 32px / 48px line-height
H2: 28px / 42px line-height
H3: 24px / 36px line-height
H4: 20px / 30px line-height
Body Large: 18px / 27px line-height
Body: 16px / 24px line-height
Body Small: 14px / 21px line-height
Caption: 12px / 18px line-height
```

### 字重（Font Weight）
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

## 组件规范（Components）

### 1. 猪猪组件（Pig Component）

#### 设计规格
```
Width: 60px
Height: 60px
Border Radius: 30px
Shadow: 0 4px 8px rgba(0,0,0,0.1)
Background: #FF6B9D
```

#### 状态样式
```
Idle（空闲）:
  - Scale: 1
  - Opacity: 1
  - Animation: Gentle bounce

Hover（悬停）:
  - Scale: 1.05
  - Opacity: 1
  - Shadow: 0 8px 16px rgba(0,0,0,0.15)

Selected（选中）:
  - Scale: 1.1
  - Opacity: 1
  - Shadow: 0 12px 24px rgba(0,0,0,0.2)
  - Border: 3px solid #FF6B9D

Running（跑动）:
  - Scale: 1
  - Opacity: 1
  - Animation: Running animation
  - Trail effect

Disabled（禁用）:
  - Scale: 1
  - Opacity: 0.5
  - Shadow: none
```

#### 猪猪类型设计
```
Normal Pig（普通猪猪）:
  - Color: #FF6B9D
  - Features: Round body, small ears
  - Speed: Normal

Fast Pig（快速猪猪）:
  - Color: #FFD93D
  - Features: Streamlined body, small wings
  - Speed: Fast (1.5x)

Jump Pig（跳跃猪猪）:
  - Color: #52C41A
  - Features: Strong legs, spring-like
  - Speed: Normal
  - Ability: Can jump over obstacles

Bomb Pig（炸弹猪猪）:
  - Color: #F5222D
  - Features: Fuse on head, explosive look
  - Speed: Normal
  - Ability: Explodes on obstacle collision

Magnet Pig（磁铁猪猪）:
  - Color: #1890FF
  - Features: Magnet symbol, metallic look
  - Speed: Normal
  - Ability: Attracts nearby items
```

#### 动画效果
```
Idle Animation:
  - Duration: 2s
  - Easing: ease-in-out
  - Keyframes:
    0%: translateY(0), scale(1)
    50%: translateY(-5px), scale(1.02)
    100%: translateY(0), scale(1)

Running Animation:
  - Duration: 0.5s
  - Easing: linear
  - Keyframes:
    0%: rotate(0deg)
    25%: rotate(5deg)
    50%: rotate(0deg)
    75%: rotate(-5deg)
    100%: rotate(0deg)

Click Animation:
  - Duration: 150ms
  - Easing: ease-out
  - Keyframes:
    0%: scale(1)
    50%: scale(1.2)
    100%: scale(1)
```

---

### 2. 障碍物组件（Obstacle Component）

#### 石头（Rock）
```
Width: 80px
Height: 80px
Shape: Irregular rock shape
Color: #8B7355
Shadow: 0 4px 8px rgba(0,0,0,0.2)
```

#### 水坑（Puddle）
```
Width: 100px
Height: 60px
Shape: Ellipse
Color: #87CEEB (with transparency)
Opacity: 0.6
Animation: Gentle ripple
```

#### 陷阱（Trap）
```
Width: 60px
Height: 60px
Shape: Spiked circle
Color: #FF6B6B
Animation: Pulsing danger
```

#### 弹簧（Spring）
```
Width: 50px
Height: 80px
Shape: Coil spring
Color: #FFD93D
Animation: Bouncing
```

---

### 3. 道具组件（Item Component）

#### 星星（Star）
```
Width: 40px
Height: 40px
Shape: 5-pointed star
Color: #FFD700
Animation: Rotating and glowing
```

#### 金币（Coin）
```
Width: 36px
Height: 36px
Shape: Circle
Color: #FFD700
Animation: Spinning
```

#### 宝石（Gem）
```
Width: 32px
Height: 32px
Shape: Diamond
Color: #9370DB
Animation: Shimmering
```

#### 钥匙（Key）
```
Width: 40px
Height: 40px
Shape: Key
Color: #FFD700
Animation: Slight floating
```

---

### 4. 按钮组件（Button Component）

#### 主要按钮（Primary Button）
```
Width: 120px
Height: 48px
Border Radius: 24px
Background: Linear gradient(135deg, #FF6B9D, #FF8FB1)
Text: 16px, Bold, #FFFFFF
Shadow: 0 4px 12px rgba(255,107,157,0.3)
```

#### 次要按钮（Secondary Button）
```
Width: 120px
Height: 48px
Border Radius: 24px
Background: #FFFFFF
Border: 2px solid #FF6B9D
Text: 16px, Bold, #FF6B9D
Shadow: 0 2px 8px rgba(0,0,0,0.1)
```

#### 圆形按钮（Circle Button）
```
Width: 48px
Height: 48px
Border Radius: 24px
Background: rgba(255,107,157,0.1)
Icon: 24px
```

#### 状态样式
```
Normal:
  - Scale: 1
  - Opacity: 1

Hover:
  - Scale: 1.05
  - Opacity: 1

Pressed:
  - Scale: 0.95
  - Opacity: 0.9

Disabled:
  - Scale: 1
  - Opacity: 0.5
  - Cursor: not-allowed
```

---

### 5. 游戏区域组件（Game Area Component）

#### 设计规格
```
Width: 100% (responsive)
Height: 100% - top bar - bottom bar
Background: #F0FFF4 (草地绿)
Border Radius: 16px
Shadow: inset 0 2px 8px rgba(0,0,0,0.05)
```

#### 背景元素
```
Grass Pattern:
  - Color: #90EE90
  - Pattern: Grass blades
  - Opacity: 0.3

Decorations:
  - Flowers, trees, fences
  - Random placement
  - Parallax effect (optional)
```

---

### 6. 信息栏组件（Info Bar Component）

#### 顶部信息栏
```
Height: 60px
Background: rgba(255,255,255,0.9)
Border Bottom: 1px solid #F0F0F0
Padding: 16px
```

#### 信息项
```
Level Indicator:
  - Icon: 24px
  - Text: "第 X 关"
  - Font: 16px, Bold

Timer:
  - Icon: 24px
  - Text: "MM:SS"
  - Font: 16px, Bold
  - Color: #FF6B9D (when < 30s)

Progress:
  - Progress Bar: 200px × 8px
  - Text: "X/Y"
  - Font: 14px
```

---

### 7. 弹窗组件（Modal Component）

#### 设计规格
```
Width: 320px
Height: Auto
Border Radius: 16px
Background: #FFFFFF
Shadow: 0 8px 32px rgba(0,0,0,0.2)
```

#### 内容布局
```
Header:
  - Height: 60px
  - Padding: 16px
  - Border-bottom: 1px solid #F0F0F0

Body:
  - Padding: 24px 16px
  - Min-height: 100px

Footer:
  - Height: 60px
  - Padding: 16px
  - Border-top: 1px solid #F0F0F0
```

---

### 8. 进度条组件（Progress Component）

#### 设计规格
```
Width: 280px
Height: 8px
Border Radius: 4px
Background: #F0F0F0
```

#### 进度样式
```
Progress Bar:
  - Height: 8px
  - Border Radius: 4px
  - Background: Linear gradient(90deg, #FF6B9D, #FFD93D)
  - Animation: Smooth transition
```

---

## 图标规范（Icons）

### 图标尺寸
```
Small: 16px
Medium: 24px
Large: 32px
Extra Large: 48px
```

### 图标风格
```
Style: Line icon / Filled icon
Stroke Width: 2px
Corner Radius: 2px
Color: #333333
```

### 主要图标列表
```
Home Icon: 首页图标
Game Icon: 游戏图标
Setting Icon: 设置图标
Rank Icon: 排行榜图标
Shop Icon: 商店图标
Share Icon: 分享图标
Hint Icon: 提示图标
Reset Icon: 重置图标
Pause Icon: 暂停图标
Play Icon: 播放图标
Close Icon: 关闭图标
Check Icon: 确认图标
Star Icon: 星星图标
Coin Icon: 金币图标
Gem Icon: 宝石图标
Key Icon: 钥匙图标
```

---

## 动画规范（Animations）

### 猪猪跑动动画
```
Duration: Based on distance
Speed: 100px/s (normal pig)
Easing: linear
Properties:
  - transform: translate(x, y)
  - opacity: 1
  - Animation: Running wobble
```

### 点击反馈动画
```
Duration: 150ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(1) → scale(1.2) → scale(1)
```

### 碰撞动画
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(1) → scale(1.3)
  - opacity: 1 → 0
  - filter: blur(0px) → blur(4px)
```

### 胜利动画
```
Duration: 500ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(0.8) → scale(1.2) → scale(1)
  - opacity: 0 → 1
  - Confetti effect
```

### 失败动画
```
Duration: 500ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(1) → scale(0.8)
  - opacity: 1 → 0.7
  - Shake effect
```

### 页面切换动画
```
Duration: 250ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: translateX(100%) → translateX(0)
  - opacity: 0 → 1
```

### 弹窗动画
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(0.8) → scale(1)
  - opacity: 0 → 1
```

---

## 响应式设计（Responsive Design）

### 屏幕尺寸适配
```
Small Screen: < 375px
  - Pig Size: 50px × 50px
  - Button Size: 100px × 40px
  - Font Size: -2px

Medium Screen: 375px - 414px
  - Pig Size: 60px × 60px
  - Button Size: 120px × 48px
  - Font Size: Base

Large Screen: > 414px
  - Pig Size: 70px × 70px
  - Button Size: 140px × 56px
  - Font Size: +2px
```

### 安全区域适配
```
Status Bar Height: 44px
Bottom Safe Area: 34px
Side Safe Area: 44px
```

---

## 原型交互（Prototypes）

### 交互流程
```
1. 用户点击猪猪
   - 猪猪高亮显示
   - 播放点击动画
   - 猪猪开始沿直线跑动

2. 猪猪跑动
   - 显示跑动轨迹
   - 碰撞检测
   - 到达目标或障碍物

3. 游戏结束
   - 显示结果弹窗
   - 显示得分和星级
   - 提供操作按钮
```

### 手势操作
```
Tap: 点击猪猪
Drag: 拖拽猪猪（可选）
Swipe: 滑动切换页面
Pinch: 缩放（暂不使用）
```

---

## 设计交付（Design Handoff）

### 导出资源
```
Images: PNG @2x, @3x
Icons: SVG
Fonts: TTF, WOFF2
Animations: Lottie files (optional)
```

### 命名规范
```
Images: [type]_[name]_[size]@[scale].png
  - Example: pig_normal_60x60@2x.png

Icons: [name]_[size].svg
  - Example: home_24.svg

Components: [ComponentName]
  - Example: PigComponent
```

### 标注规范
```
Dimensions: px
Colors: Hex (#FF6B9D)
Spacing: px
Typography: Font size / Line height
Animations: Duration, Easing, Keyframes
```

---

## 设计资源（Assets）

### 图片资源
```
Pig Sprites: 5种不同类型的猪猪
Background: 游戏背景图（草地主题）
UI Elements: UI装饰元素
Obstacles: 障碍物图片
Items: 道具图片
```

### 音频资源
```
Background Music: 背景音乐
Sound Effects:
  - Click sound
  - Running sound
  - Collision sound
  - Success sound
  - Fail sound
  - Collect sound
```

### 字体资源
```
PingFang SC: 主字体
Custom Font: 自定义字体（如有）
```

---

## 设计检查清单（Design Checklist）

### 视觉检查
- [ ] 色彩符合品牌规范
- [ ] 字体大小和层级正确
- [ ] 间距和对齐一致
- [ ] 图标风格统一
- [ ] 猪猪设计可爱且易识别

### 交互检查
- [ ] 所有状态都有反馈
- [ ] 动画流畅自然
- [ ] 手势操作合理
- [ ] 无障碍设计考虑
- [ ] 点击区域足够大

### 技术检查
- [ ] 响应式适配完成
- [ ] 资源导出格式正确
- [ ] 命名规范统一
- [ ] 标注清晰完整
- [ ] 动画性能优化

---

**文档版本**：v2.0
**最后更新**：2026-02-01
**设计工具**：Figma
**设计团队**：UI/UX团队
