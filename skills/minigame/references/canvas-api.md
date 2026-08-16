# Canvas 2D API 速查

## 基础设置
```javascript
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// 高清屏适配
const dpr = window.devicePixelRatio || 1
canvas.width = canvas.clientWidth * dpr
canvas.height = canvas.clientHeight * dpr
ctx.scale(dpr, dpr)
```

## 绘制图形
```javascript
// 矩形
ctx.fillStyle = '#ff6699'
ctx.fillRect(x, y, width, height)
ctx.strokeStyle = '#fff'
ctx.lineWidth = 2
ctx.strokeRect(x, y, width, height)

// 圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// 圆形
ctx.beginPath()
ctx.arc(x, y, radius, 0, Math.PI * 2)
ctx.fill()

// 线段
ctx.beginPath()
ctx.moveTo(x1, y1)
ctx.lineTo(x2, y2)
ctx.stroke()
```

## 文字
```javascript
ctx.font = 'bold 24px "Press Start 2P", monospace'
ctx.fillStyle = '#fff'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2)

// 描边文字
ctx.strokeStyle = '#000'
ctx.lineWidth = 3
ctx.strokeText('SCORE: 100', x, y)
ctx.fillText('SCORE: 100', x, y)
```

## 渐变
```javascript
// 线性渐变
const grad = ctx.createLinearGradient(x1, y1, x2, y2)
grad.addColorStop(0, '#ff6b9d')
grad.addColorStop(1, '#c44569')
ctx.fillStyle = grad

// 径向渐变
const rad = ctx.createRadialGradient(x, y, 0, x, y, radius)
rad.addColorStop(0, '#ffffff')
rad.addColorStop(1, 'rgba(255,107,157,0)')
ctx.fillStyle = rad
```

## 阴影和发光
```javascript
ctx.shadowColor = '#ff6b9d'
ctx.shadowBlur = 20
ctx.shadowOffsetX = 0
ctx.shadowOffsetY = 0
// 绘制发光物体...
ctx.shadowBlur = 0 // 用完重置
```

## 图像
```javascript
const img = new Image()
img.onload = () => ctx.drawImage(img, x, y, w, h)
img.src = 'data:image/svg+xml,...' // 或 data URI

// 裁剪绘制
ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
```

## 变换
```javascript
ctx.save()
ctx.translate(x, y)
ctx.rotate(angle)
ctx.scale(sx, sy)
// 绘制...
ctx.restore()
```

## 透明度与混合
```javascript
ctx.globalAlpha = 0.5
ctx.globalCompositeOperation = 'lighter' // 叠加发光
// 绘制...
ctx.globalAlpha = 1
ctx.globalCompositeOperation = 'source-over'
```

## 裁剪
```javascript
ctx.save()
ctx.beginPath()
ctx.arc(x, y, radius, 0, Math.PI * 2)
ctx.clip()
// 只在圆形区域内绘制
ctx.restore()
```

## 像素操作
```javascript
const imageData = ctx.getImageData(x, y, w, h)
const data = imageData.data
for (let i = 0; i < data.length; i += 4) {
  data[i]     // R (0-255)
  data[i + 1] // G
  data[i + 2] // B
  data[i + 3] // A
}
ctx.putImageData(imageData, x, y)
```

## 性能优化
- 使用离屏 Canvas 预渲染静态内容
- 避免在循环中设置 `ctx.font`
- 批量绘制相同样式的图形
- 使用 `willReadFrequently: true` 如果频繁读取像素
- 对于大量粒子，使用 ImageData 直接操作像素