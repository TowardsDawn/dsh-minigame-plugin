# UI 自适应与多机型适配

确保游戏在 PC、平板、手机等各种设备上都有良好的 UI 布局和交互体验。

## 响应式布局策略

### 游戏画布自适应

```javascript
// 全屏自适应画布
function setupCanvas() {
  const canvas = document.getElementById('game')
  const dpr = window.devicePixelRatio || 1

  function resize() {
    const container = canvas.parentElement || document.body
    const w = container.clientWidth
    const h = container.clientHeight

    // 保持游戏设计比例（如 4:3 或 16:9）
    const designRatio = 4 / 3
    let gameW, gameH

    if (w / h > designRatio) {
      // 宽度更宽，以高度为准
      gameH = h
      gameW = h * designRatio
    } else {
      // 高度更高，以宽度为准
      gameW = w
      gameH = w / designRatio
    }

    canvas.style.width = gameW + 'px'
    canvas.style.height = gameH + 'px'
    canvas.width = gameW * dpr
    canvas.height = gameH * dpr

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // 更新游戏坐标系
    return { width: gameW, height: gameH, scale: gameW / designWidth }
  }

  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', () => {
    setTimeout(resize, 300) // 等待旋转完成
  })

  return resize()
}
```

### 布局模式切换

```javascript
// 根据屏幕方向切换布局
function getLayoutMode() {
  const isLandscape = window.innerWidth > window.innerHeight
  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024

  if (isMobile && !isLandscape) return 'mobile-portrait'
  if (isMobile && isLandscape) return 'mobile-landscape'
  if (isTablet) return 'tablet'
  return 'desktop'
}

// 根据布局模式调整 UI
function adaptUI(layout) {
  const configs = {
    'mobile-portrait': {
      fontSize: 14, buttonSize: 48, padding: 12,
      showSidebar: false, showVirtualControls: true,
      gameAreaRatio: 0.65,
    },
    'mobile-landscape': {
      fontSize: 16, buttonSize: 40, padding: 8,
      showSidebar: false, showVirtualControls: false,
      gameAreaRatio: 0.85,
    },
    'tablet': {
      fontSize: 18, buttonSize: 52, padding: 16,
      showSidebar: true, showVirtualControls: false,
      gameAreaRatio: 0.75,
    },
    'desktop': {
      fontSize: 20, buttonSize: 56, padding: 20,
      showSidebar: true, showVirtualControls: false,
      gameAreaRatio: 0.7,
    },
  }
  return configs[layout] || configs['desktop']
}
```

## 虚拟操控杆（移动端）

```javascript
class VirtualJoystick {
  constructor(x, y, radius) {
    this.baseX = x
    this.baseY = y
    this.baseRadius = radius
    this.thumbRadius = radius * 0.4
    this.thumbX = x
    this.thumbY = y
    this.active = false
    this.touchId = null
    this.dx = 0 // -1 ~ 1
    this.dy = 0 // -1 ~ 1
  }

  handleTouchStart(touch) {
    const dist = Math.hypot(touch.x - this.baseX, touch.y - this.baseY)
    if (dist < this.baseRadius * 1.5) {
      this.active = true
      this.touchId = touch.id
      this.updateThumb(touch.x, touch.y)
    }
  }

  handleTouchMove(touch) {
    if (this.active && touch.id === this.touchId) {
      this.updateThumb(touch.x, touch.y)
    }
  }

  handleTouchEnd(touch) {
    if (touch.id === this.touchId) {
      this.active = false
      this.touchId = null
      this.thumbX = this.baseX
      this.thumbY = this.baseY
      this.dx = 0
      this.dy = 0
    }
  }

  updateThumb(tx, ty) {
    const dx = tx - this.baseX
    const dy = ty - this.baseY
    const dist = Math.hypot(dx, dy)
    const maxDist = this.baseRadius - this.thumbRadius

    if (dist > maxDist) {
      this.thumbX = this.baseX + (dx / dist) * maxDist
      this.thumbY = this.baseY + (dy / dist) * maxDist
      this.dx = dx / dist
      this.dy = dy / dist
    } else {
      this.thumbX = tx
      this.thumbY = ty
      this.dx = dx / maxDist
      this.dy = dy / maxDist
    }
  }

  draw(ctx) {
    // 底座
    ctx.beginPath()
    ctx.arc(this.baseX, this.baseY, this.baseRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 摇杆
    ctx.beginPath()
    ctx.arc(this.thumbX, this.thumbY, this.thumbRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fill()
  }
}
```

## 虚拟按钮（移动端）

```javascript
class VirtualButton {
  constructor(x, y, w, h, label, key) {
    this.x = x; this.y = y
    this.w = w; this.h = h
    this.label = label
    this.key = key // 对应键盘按键
    this.pressed = false
    this.touchId = null
  }

  contains(tx, ty) {
    return tx >= this.x && tx <= this.x + this.w &&
           ty >= this.y && ty <= this.y + this.h
  }

  handleTouchStart(touch) {
    if (this.contains(touch.x, touch.y)) {
      this.pressed = true
      this.touchId = touch.id
    }
  }

  handleTouchEnd(touch) {
    if (touch.id === this.touchId) {
      this.pressed = false
      this.touchId = null
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.pressed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'
    roundRect(ctx, this.x, this.y, this.w, this.h, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${this.h * 0.4}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2)
  }
}
```

## 安全区域适配

```css
/* 刘海屏、底部横条适配 */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

body {
  padding:
    var(--safe-top)
    var(--safe-right)
    var(--safe-bottom)
    var(--safe-left);
  /* 或者使用 viewport-fit */
}

/* iOS 全屏适配 */
@supports(padding: max(0px)) {
  body {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
```

```html
<!-- viewport meta 标签 -->
<meta name="viewport" content="
  width=device-width,
  initial-scale=1.0,
  maximum-scale=1.0,
  user-scalable=no,
  viewport-fit=cover
">
```

## 键盘 + 触屏双模式

```javascript
class InputManager {
  constructor() {
    this.keys = {}
    this.touches = {}
    this.isMobile = false
    this.setupKeyboard()
    this.setupTouch()
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true
      this.isMobile = false // 检测到键盘，切换为 PC 模式
    })
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false
    })
  }

  setupTouch() {
    const canvas = document.getElementById('game')

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      this.isMobile = true
      for (const touch of e.changedTouches) {
        this.touches[touch.identifier] = this.getCanvasPos(touch)
      }
    }, { passive: false })

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      for (const touch of e.changedTouches) {
        this.touches[touch.identifier] = this.getCanvasPos(touch)
      }
    }, { passive: false })

    canvas.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        delete this.touches[touch.identifier]
      }
    })
  }

  getCanvasPos(touch) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  isKeyDown(key) { return !!this.keys[key] }
  getTouchPositions() { return Object.values(this.touches) }
}
```

## 字体缩放适配

```javascript
// 不同屏幕尺寸使用不同字体大小
function getResponsiveFontSize(baseSize) {
  const vw = window.innerWidth
  if (vw < 375) return baseSize * 0.8
  if (vw < 768) return baseSize
  if (vw < 1024) return baseSize * 1.2
  return baseSize * 1.4
}

// 使用 CSS clamp 实现流畅缩放
const style = document.createElement('style')
style.textContent = `
  .game-title { font-size: clamp(18px, 5vw, 48px); }
  .game-score { font-size: clamp(14px, 3vw, 28px); }
  .game-button { font-size: clamp(14px, 2.5vw, 20px); }
`
document.head.appendChild(style)
```

## 横竖屏切换

```javascript
// 横屏锁定提示（竖屏游戏）
function showRotateHint() {
  if (window.innerWidth > window.innerHeight) return // 已经是横屏

  const hint = document.createElement('div')
  hint.id = 'rotate-hint'
  hint.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); z-index: 9999;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #fff; font-size: 20px;
  `
  hint.innerHTML = `
    <div style="font-size: 60px; animation: rotate 1.5s ease-in-out infinite">📱</div>
    <p style="margin-top: 20px">请旋转设备</p>
    <p style="font-size: 14px; opacity: 0.6">Please rotate your device</p>
  `
  document.body.appendChild(hint)
}

// 监听横竖屏切换
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    const hint = document.getElementById('rotate-hint')
    if (window.innerWidth > window.innerHeight) {
      hint?.remove()
    } else {
      if (!hint) showRotateHint()
    }
  }, 300)
})
```

## 鼠标/触屏自适应

```javascript
// 鼠标悬停效果仅在桌面端生效
const isTouchDevice = 'ontouchstart' in window

if (!isTouchDevice) {
  // 桌面端专属：hover 效果、右键菜单
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  canvas.style.cursor = 'pointer'
}

// 通用：pointer 事件（统一鼠标和触屏）
canvas.addEventListener('pointerdown', (e) => {
  const pos = { x: e.offsetX, y: e.offsetY }
  handleInput(pos)
})

// 移动端防止双击缩放和长按菜单
canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false })
canvas.style.touchAction = 'none' // CSS 方式禁用浏览器手势
canvas.style.webkitUserSelect = 'none'
canvas.style.userSelect = 'none'
```

## 视口单位与比例

```css
/* 使用 vw/vh 保持元素比例 */
.game-container {
  width: min(100vw, 100vh * 1.33); /* 限制最大宽度，保持 4:3 */
  height: min(100vh, 100vw * 0.75);
  margin: auto;
}

/* aspect-ratio 现代方案 */
.game-canvas {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 100vh;
}
```

## 适配检查清单

- [ ] 320px 宽度（iPhone SE）正常显示
- [ ] 375px 宽度（iPhone 6/7/8）正常显示
- [ ] 414px 宽度（iPhone 11）正常显示
- [ ] 768px 宽度（iPad）正常显示
- [ ] 1024px+ 宽度（桌面）正常显示
- [ ] 横屏和竖屏都能正常游玩
- [ ] 刘海屏安全区域无遮挡
- [ ] 触屏操作区域足够大（最小 44x44px）
- [ ] 文字在各种尺寸下清晰可读
- [ ] 虚拟按钮在游戏区域之外，不遮挡游戏画面