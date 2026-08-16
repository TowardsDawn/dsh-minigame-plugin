# 性能优化与包体优化

确保小游戏在各种设备上流畅运行，包体尽可能小，加载尽可能快。

## 包体优化

### 单文件策略
- 所有 CSS/JS 内嵌在 HTML 中，零额外请求
- 使用 SVG data URI 替代图片资源
- 程序化生成图形（Canvas 绘制），避免引用外部图片

### 代码压缩
```javascript
// 发布前用工具压缩，开发时保持可读性
// 推荐使用 terser 或 esbuild 压缩 JS
// 使用 csso 或 clean-css 压缩 CSS
// 使用 html-minifier 压缩 HTML

// 手动减重技巧：
// 1. 变量名缩短（仅在发布版本）
// 2. 移除 console.log
// 3. 合并重复代码
// 4. 使用简写属性和箭头函数
```

### 字体内嵌
```html
<style>
/* 只内嵌需要的字符，用 base64 编码 */
@font-face {
  font-family: 'GameFont';
  src: url(data:font/woff2;base64,...) format('woff2');
  /* 如果只需要数字和英文，subset 字体 */
  unicode-range: U+0020-007F;
}
</style>
```

### 目标包体
- 2D 简单游戏（贪吃蛇、打地鼠）：< 5 KB
- 2D 中等游戏（弹球、2048、射击）：< 15 KB
- 2D 复杂游戏（平台跳跃、消除）：< 40 KB
- 含字体文件：< 80 KB
- 3D 游戏（含模型、纹理、音频）：< 128 MB

## 渲染性能

### Canvas 优化
```javascript
// 1. 离屏 Canvas 预渲染静态内容
const offscreen = document.createElement('canvas')
const offCtx = offscreen.getContext('2d')
// 把不常变的背景、网格等预渲染到离屏 Canvas
// 游戏循环中只需要 drawImage 贴过来

function renderBackground() {
  offscreen.width = canvas.width
  offscreen.height = canvas.height
  // 绘制静态背景...
  // 只调用一次，或变化时才重绘
}

function render() {
  ctx.drawImage(offscreen, 0, 0) // 极快
  // 再绘制动态元素...
}

// 2. 脏矩形渲染（只重绘变化区域）
// 只 clearRect 变化的区域，而非整个画布

// 3. 批量绘制相同样式
// 先设置 fillStyle，再批量绘制所有同色矩形
ctx.fillStyle = '#ff4757'
bricks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h))

// 4. 避免状态切换
// 减少 save/restore 调用
// 手动管理状态而非频繁 save/restore

// 5. 避免浮点坐标
// 对像素游戏，使用 Math.round 或位运算取整
ctx.fillRect(x | 0, y | 0, w | 0, h | 0)

// 6. 粒子优化
// 超过 200 个粒子时，改用 ImageData 批量操作像素
```

### requestAnimationFrame 优化
```javascript
// 1. 根据性能动态调整
let fps = 60
let frameCount = 0
let fpsTimer = 0

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05)

  // 每秒检测一次 FPS
  frameCount++
  fpsTimer += dt
  if (fpsTimer >= 1) {
    fps = frameCount
    frameCount = 0
    fpsTimer = 0
  }

  update(dt)
  render()
  requestAnimationFrame(loop)
}

// 2. 低性能设备降级
function getQualityLevel() {
  // 根据屏幕尺寸和像素比判断
  const pixels = screen.width * screen.height * devicePixelRatio
  if (pixels < 500000) return 'low'     // 低端设备
  if (pixels < 2000000) return 'medium'  // 中端设备
  return 'high'                           // 高端设备
}

const quality = getQualityLevel()
const PARTICLE_COUNTS = { low: 20, medium: 50, high: 100 }
const maxParticles = PARTICLE_COUNTS[quality]
```

## 内存管理

```javascript
// 对象池模式（避免频繁 GC）
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  acquire() {
    const obj = this.pool.pop() || this.createFn()
    this.resetFn(obj)
    return obj
  }

  release(obj) {
    this.pool.push(obj)
  }
}

// 粒子池
const particlePool = new ObjectPool(
  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '', size: 0, active: false }),
  (p) => { p.active = false; p.life = 0 },
  200
)

// 永远不要创建临时对象在游戏循环中
// 错误：循环中 new Particle(...)
// 正确：从池中取，用完归还
```

## 电源与电池优化

```javascript
// 1. 页面不可见时暂停
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause()
    // 暂停音频上下文
    sfx.ctx.suspend()
  } else {
    sfx.ctx.resume()
  }
})

// 2. 闲置时降帧率
let idleTimer = 0
const IDLE_TIMEOUT = 5 // 5 秒无操作
if (noUserInput) {
  idleTimer += dt
  if (idleTimer > IDLE_TIMEOUT) {
    // 降低到 30fps
    skipFrame = !skipFrame
  }
}

// 3. 非焦点时降帧率
window.addEventListener('blur', () => targetFPS = 15)
window.addEventListener('focus', () => targetFPS = 60)
```

## 加载优化

```html
<!-- 1. 关键 CSS 内联 -->
<style>/* 首屏关键样式 */</style>

<!-- 2. 非关键资源延迟加载 -->
<link rel="preload" as="font" href="game-font.woff2" crossorigin>

<!-- 3. 使用 loading 占位 -->
<div id="loading">Loading...</div>
<script>
// 游戏初始化完成后移除 loading
window.addEventListener('load', () => {
  document.getElementById('loading').remove()
  game.start()
})
</script>
```

## 适配多机型检测

```javascript
// 设备能力检测
const DEVICE = {
  isMobile: /Mobi|Android/i.test(navigator.userAgent),
  isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
  isAndroid: /Android/i.test(navigator.userAgent),
  touchSupported: 'ontouchstart' in window,
  screenWidth: Math.min(screen.width, screen.height),
  pixelRatio: window.devicePixelRatio || 1,
  memory: navigator.deviceMemory || 4, // GB
  cores: navigator.hardwareConcurrency || 4,
}

// 根据设备调整参数
function getDeviceConfig() {
  if (DEVICE.screenWidth < 375) {
    return { uiScale: 0.8, particles: 15, effects: 'minimal' }
  }
  if (DEVICE.screenWidth < 768) {
    return { uiScale: 1.0, particles: 30, effects: 'medium' }
  }
  return { uiScale: 1.2, particles: 60, effects: 'full' }
}
```

## 性能禁忌

- 不要在游戏循环中创建对象（触发 GC jank）
- 不要使用 `ctx.shadowBlur` 大量绘制（极耗时）
- 不要在渲染循环中读取 `getImageData`（强制 GPU-CPU 同步）
- 不要使用 `setTimeout` 做动画（用 rAF）
- 不要忘记 `passive: true` 的事件监听器（影响滚动性能）
- 避免 CSS `filter` 和 `backdrop-filter` 在低端设备上大量使用