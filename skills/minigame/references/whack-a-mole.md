# 打地鼠 (Whack-a-Mole)

## 游戏机制
- 多个洞，随机出现地鼠
- 点击/触摸地鼠得分
- 倒计时模式
- 连击加分

## 核心参数
```javascript
const CONFIG = {
  holes: 9, // 3x3 网格
  gameDuration: 30, // 秒
  moleShowMin: 0.6, // 最短出现时间
  moleShowMax: 1.2, // 最长出现时间
  spawnInterval: 0.4, // 生成间隔
  pointsPerHit: 10,
  comboWindow: 1.5, // 连击时间窗口
  comboMultiplier: [1, 2, 3, 5, 8], // 连击倍率
}
```

## 洞的布局
```javascript
const HOLE_POSITIONS = [
  { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 },
  { x: 100, y: 320 }, { x: 200, y: 320 }, { x: 300, y: 320 },
  { x: 100, y: 440 }, { x: 200, y: 440 }, { x: 300, y: 440 },
]
```

## 地鼠行为
```javascript
class Mole {
  constructor(holeIndex) {
    this.holeIndex = holeIndex
    this.pos = HOLE_POSITIONS[holeIndex]
    this.state = 'hidden' // hidden | rising | shown | hiding
    this.showTimer = 0
    this.showDuration = CONFIG.moleShowMin + Math.random() * (CONFIG.moleShowMax - CONFIG.moleShowMin)
    this.bonus = Math.random() < 0.15 // 15% 概率出现金色地鼠（双倍分）
  }

  update(dt) {
    this.showTimer += dt
    if (this.showTimer >= this.showDuration) {
      this.hide()
    }
  }

  getDisplayY() {
    // 弹出动画：用正弦缓动
    const progress = Math.min(this.showTimer / 0.15, 1) // 0.15s 弹出
    const eased = Math.sin(progress * Math.PI / 2) // ease-out
    return this.pos.y + 60 * (1 - eased)
  }
}
```

## 视觉设计
- 洞用椭圆绘制，带阴影增加深度
- 地鼠圆形身体 + 小耳朵
- 金色地鼠带闪光效果
- 被击中时地鼠缩回 + 星星粒子
- 打击特效："+10" 文字弹出

## 音效
- 地鼠出现：pop 音效
- 击中：hit 音效 + 叮咚
- 连击：音调递增
- 金色地鼠：特殊音效
- 游戏结束：下降音阶