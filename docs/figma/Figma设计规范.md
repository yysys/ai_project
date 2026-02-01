# Figma设计规范 - 猪了个猪（菜狗与狼群版）

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
- Level Selection Screen（关卡选择页）
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

### 角色类型色（Character Type Colors）
```
Vegetable Dog: #52C41A（绿色）
Normal Wolf: #FF6B9D（粉色）
Fast Wolf: #FFD93D（黄色）
Cooperative Wolf: #9254DE（紫色）
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

### 1. 菜狗组件（Vegetable Dog Component）

#### 设计规格
```
Width: 80px
Height: 80px
Border Radius: 40px
Shadow: 0 4px 8px rgba(0,0,0,0.1)
Background: #52C41A
```

#### 状态样式
```
Idle（空闲）:
  - Scale: 1
  - Opacity: 1
  - Animation: Gentle bounce

Scared（害怕）:
  - Scale: 0.95
  - Opacity: 1
  - Animation: Shaking
  - Color: #FFD93D

Protected（被保护）:
  - Scale: 1
  - Opacity: 1
  - Shield Effect: Glowing blue
  - Border: 3px solid #1890FF

Caught（被抓）:
  - Scale: 0.8
  - Opacity: 0.7
  - Animation: Fading
  - Color: #F5222D
```

#### 生命值显示
```
Health Bar:
  - Width: 60px
  - Height: 8px
  - Border Radius: 4px
  - Background: rgba(0,0,0,0.1)
  - Fill: #52C41A
  - Position: Top center of dog
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

Scared Animation:
  - Duration: 0.5s
  - Easing: ease-in-out
  - Keyframes:
    0%: rotate(0deg)
    25%: rotate(-3deg)
    50%: rotate(0deg)
    75%: rotate(3deg)
    100%: rotate(0deg)
```

---

### 2. 狼组件（Wolf Component）

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

Hunting（猎中）:
  - Scale: 1.05
  - Opacity: 1
  - Animation: Aggressive movement
  - Eyes: Red glow

Caught（抓到菜狗）:
  - Scale: 1.2
  - Opacity: 1
  - Animation: Victory pose
```

#### 狼类型设计
```
Normal Wolf（普通狼）:
  - Color: #FF6B9D
  - Features: Round body, small ears
  - Speed: Normal

Fast Wolf（快速狼）:
  - Color: #FFD93D
  - Features: Streamlined body, small wings
  - Speed: Fast (1.5x)

Cooperative Wolf（协作狼）:
  - Color: #9254DE
  - Features: Team badge, coordinated look
  - Speed: Normal
  - Ability: Coordinates with other wolves
```

#### 方向指示器
```
Direction Indicator:
  - Size: 20px × 20px
  - Position: Top right of wolf
  - Shape: Arrow
  - Colors:
    Left Up: #FF6B9D
    Left Down: #FFD93D
    Right Up: #52C41A
    Right Down: #9254DE
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

### 3. 方向组件（Direction Component）

#### 四个对角线方向
```
Direction: Left Up (左上）
  - Angle: 225°
  - Vector: { x: -1, y: -1 }
  - Icon: Arrow pointing top-left

Direction: Left Down (左下）
  - Angle: 135°
  - Vector: { x: -1, y: 1 }
  - Icon: Arrow pointing bottom-left

Direction: Right Up (右上）
  - Angle: 315°
  - Vector: { x: 1, y: -1 }
  - Icon: Arrow pointing top-right

Direction: Right Down (右下）
  - Angle: 45°
  - Vector: { x: 1, y: 1 }
  - Icon: Arrow pointing bottom-right
```

#### 方向指示器设计
```
Size: 24px × 24px
Shape: Arrow
Stroke Width: 3px
Color: #333333
Background: rgba(255,255,255,0.8)
Border Radius: 4px
```

---

### 4. 道具组件（Item Component）

#### 护盾道具（Shield Item）
```
Width: 40px
Height: 40px
Shape: Circle with shield icon
Color: #1890FF
Animation: Rotating and glowing
Duration: 5s
```

#### 障碍道具（Barrier Item）
```
Width: 50px
Height: 50px
Shape: Square with barrier icon
Color: #FAAD14
Animation: Pulsing
Duration: 10s
```

#### 陷阱道具（Trap Item）
```
Width: 40px
Height: 40px
Shape: Circle with trap icon
Color: #F5222D
Animation: Spinning
Duration: 8s
```

---

### 5. 按钮组件（Button Component）

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

### 11. 游戏区域组件（Game Area Component）

#### 设计规格
```
Width: 100% (responsive)
Height: 100% - top bar - bottom bar
Background: #F0FFF4 (草地绿）
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

#### 游戏网格集成
```
Game Grid:
  - 100个长方形小单元
  - 10列 × 10行布局
  - 每个单元32px × 48px
  - 四个方向指示器（左上、左下、右上、右下）
  - 支持菜狗和狼的放置和移动
```

---

### 6. 关卡选择页组件（Level Selection Component）

#### 设计规格
```
Width: 100% (responsive)
Height: 100% - top bar - bottom bar
Background: #FFF5F8
```

#### 关卡按钮设计
```
Level Button:
  - Width: 80px
  - Height: 80px
  - Border Radius: 12px
  - Background: Linear gradient(135deg, #FF6B9D, #FF8FB1)
  - Text: 24px, Bold, #FFFFFF
  - Shadow: 0 4px 12px rgba(255,107,157,0.3)
  - Spacing: 16px
```

#### 关卡状态样式
```
Unlocked（已解锁）:
  - Background: Linear gradient(135deg, #FF6B9D, #FF8FB1)
  - Opacity: 1
  - Text Color: #FFFFFF
  - Clickable: Yes

Locked（未解锁）:
  - Background: #E0E0E0
  - Opacity: 0.6
  - Text Color: #999999
  - Clickable: No
  - Lock Icon: Visible

Completed（已完成）:
  - Background: Linear gradient(135deg, #52C41A, #73D13D)
  - Opacity: 1
  - Text Color: #FFFFFF
  - Star Rating: Visible
  - Clickable: Yes

Current（当前关卡）:
  - Background: Linear gradient(135deg, #FFD93D, #FFE566)
  - Opacity: 1
  - Text Color: #333333
  - Border: 3px solid #FF6B9D
  - Clickable: Yes
```

#### 关卡网格布局
```
Grid Layout:
  - Columns: 5
  - Rows: 2
  - Gap: 16px
  - Padding: 24px
  - Total Levels: 10
```

#### 星级评定
```
Star Rating:
  - Size: 12px
  - Color: #FFD93D
  - Position: Bottom center of level button
  - Spacing: 2px
```

---

### 7. 游戏网格组件（Game Grid Component）

#### 设计规格
```
Width: 100% (responsive)
Height: 100% - top bar - bottom bar
Background: #F0FFF4 (草地绿）
Border Radius: 16px
Shadow: inset 0 2px 8px rgba(0,0,0,0.05)
```

#### 网格布局
```
Grid Layout:
  - Total Cells: 120
  - Layout Type: Diagonal (斜向排列)
  - Cell Width: 20px
  - Cell Height: 40px
  - Cell Rotation: 45度 或 135度 (两种旋转方向)
  - Grid Gap: 5px (单元格间距，避免旋转后重叠)
  - Padding: 12px
  - Grid Columns: 12
  - Grid Rows: 10
```

#### 斜向排列说明
```
Cell Rotation Layout:
  - 每个单元格旋转45度
  - 形成菱形视觉效果
  - 网格间距12px，避免旋转后重叠
  - 四个角分别对应四个方向：
    * 顶部角：左上方向
    * 左侧角：左下方向
    * 右侧角：右上方向
    * 底部角：右下方向
  - 便于菜狗和狼沿对角线方向移动
```

#### 单元格设计
```
Cell (长方形小单元):
  - Width: 20px
  - Height: 40px
  - Rotation: 45度 或 135度 (两种旋转方向)
  - Border Radius: 2px
  - Background: #FFFFFF
  - Border: 1px solid #E8F5E9
  - Shadow: 0 1px 3px rgba(0,0,0,0.05)
```

#### 单元格旋转说明
```
Cell Rotation:
  - 单元格有两种旋转角度：45度 和 135度
  - 45度旋转：形成右上-左下方向的菱形
  - 135度旋转：形成左上-右下方向的菱形
  - 两种旋转交替排列，形成四个方向的视觉效果
  - 网格间距12px，避免旋转后重叠
  - 四个角分别对应四个方向：
    * 45度旋转：
      - 顶部角：左上方向
      - 左侧角：左下方向
      - 右侧角：右上方向
      - 底部角：右下方向
    * 135度旋转：
      - 顶部角：右上方向
      - 左侧角：左上方向
      - 右侧角：右下方向
      - 底部角：左下方向
  - 便于菜狗和狼沿对角线方向移动
```

#### 单元格方向指示
```
Direction Indicators:
  - Left Up (左上): 单元格左上角
  - Left Down (左下): 单元格左下角
  - Right Up (右上): 单元格右上角
  - Right Down (右下): 单元格右下角

Direction Arrow:
  - Size: 8px × 8px
  - Color: #52C41A
  - Shape: Triangle
  - Position: Corner of cell
```

#### 单元格状态
```
Empty (空):
  - Background: #FFFFFF
  - Opacity: 1

Occupied (被占用):
  - Background: #FF6B9D
  - Opacity: 1

Selected (选中):
  - Background: #FFD93D
  - Opacity: 1
  - Border: 2px solid #FF6B9D

Highlighted (高亮):
  - Background: #FFE566
  - Opacity: 0.8
```

---

### 8. 信息栏组件（Info Bar Component）

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

Dog Health:
  - Health Bar: 100px × 8px
  - Text: "生命: X/3"
  - Font: 14px
  - Color: #52C41A
```

---

### 9. 弹窗组件（Modal Component）

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

### 10. 进度条组件（Progress Component）

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
Shield Icon: 护盾图标
Barrier Icon: 障碍图标
Trap Icon: 陷阱图标
Health Icon: 生命值图标
Direction Icons: 四个方向图标
```

---

## 动画规范（Animations）

### 关卡按钮动画
```
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(1) → scale(1.1) → scale(1)
  - opacity: 1
```

### 关卡解锁动画
```
Duration: 500ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(0.8) → scale(1)
  - opacity: 0 → 1
  - Confetti effect
```

### 单元格选中动画
```
Duration: 150ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: scale(1) → scale(1.05) → scale(1)
  - background-color: #FFFFFF → #FFD93D
```

### 单元格移动动画
```
Duration: Based on distance
Easing: linear
Properties:
  - transform: translate(x, y)
  - opacity: 1
  - Trail effect
```

### 狼跑动动画
```
Duration: Based on distance
Speed: 120px/s (normal wolf)
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
  - Dog Size: 70px × 70px
  - Wolf Size: 50px × 50px
  - Button Size: 100px × 40px
  - Font Size: -2px

Medium Screen: 375px - 414px
  - Dog Size: 80px × 80px
  - Wolf Size: 60px × 60px
  - Button Size: 120px × 48px
  - Font Size: Base

Large Screen: > 414px
  - Dog Size: 90px × 90px
  - Wolf Size: 70px × 70px
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
1. 用户点击狼
   - 狼高亮显示
   - 播放点击动画
   - 狼开始沿对角线跑动

2. 狼跑动
   - 显示跑动轨迹
   - 显示方向指示器
   - 碰撞检测
   - 到达边界或菜狗

3. 游戏结束
   - 显示结果弹窗
   - 显示得分和星级
   - 提供操作按钮
```

### 手势操作
```
Tap: 点击狼
Drag: 拖拽狼（可选）
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
  - Example: dog_normal_80x80@2x.png
  - Example: wolf_normal_60x60@2x.png

Icons: [name]_[size].svg
  - Example: home_24.svg
  - Example: direction_left_up_24.svg

Components: [ComponentName]
  - Example: DogComponent
  - Example: WolfComponent
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
Dog Sprites: 菜狗精灵图
Wolf Sprites: 狼精灵图（3种类型）
Background: 游戏背景图（草地主题）
UI Elements: UI装饰元素
Items: 道具图片
Directions: 方向指示器图标
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
  - Dog scared sound
  - Wolf hunting sound
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
- [ ] 菜狗和狼设计可爱且易识别
- [ ] 方向指示器清晰可见

### 交互检查
- [ ] 所有状态都有反馈
- [ ] 动画流畅自然
- [ ] 手势操作合理
- [ ] 无障碍设计考虑
- [ ] 点击区域足够大
- [ ] 方向指示准确

### 技术检查
- [ ] 响应式适配完成
- [ ] 资源导出格式正确
- [ ] 命名规范统一
- [ ] 标注清晰完整
- [ ] 动画性能优化

---

**文档版本**：v3.0
**最后更新**：2026-02-01
**设计工具**：Figma
**设计团队**：UI/UX团队
