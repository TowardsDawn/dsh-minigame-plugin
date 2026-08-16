# 跑酷游戏 (Runner)

## 核心机制
- 无限卷轴背景（视差滚动）
- 玩家固定在左侧，世界向右移动
- 障碍物从右侧生成，向左移动
- 跳跃/滑铲躲避障碍物
- 速度逐渐递增
- 分数 = 存活时间/距离

## 核心参数
```javascript
const CONFIG = {
  groundY: 400,
  playerX: 100,
  playerWidth: 40,
  playerHeight: 60,
  jumpForce: 500,
  gravity: 1500,
  baseSpeed: 300,
  maxSpeed: 800,
  speedIncrement: 0.5, // 每秒加速
  obstacleInterval: 1.5, // 初始间隔秒
  minInterval: 0.6,
}
```

## 视差滚动背景
```javascript
class Background {
  constructor() {
    this.layers = [
      { speed: 0.2, color: '#1a1a2e', elements: [] }, // 远山
      { speed: 0.5, color: '#16213e', elements: [] }, // 建筑
      { speed: 1.0, color: '#0f3460', elements: [] }, // 地面
    ]
  }

  update(speed, dt) {
    for (const layer of this.layers) {
      layer.offset = (layer.offset || 0) + speed * layer.speed * dt
      if (layer.offset > canvas.width) layer.offset -= canvas.width
    }
  }

  draw(ctx) {
    for (const layer of this.layers) {
      ctx.fillStyle = layer.color
      // 绘制两个副本实现无缝滚动
      ctx.fillRect(-layer.offset, 0, canvas.width, canvas.height)
      ctx.fillRect(canvas.width - layer.offset, 0, canvas.width, canvas.height)
    }
  }
}
```

## 障碍物类型
```javascript
const OBSTACLES = [
  { type: 'small', width: 30, height: 40, yOffset: 0 },   // 小障碍（跳跃）
  { type: 'tall', width: 30, height: 70, yOffset: -30 },   // 高障碍（滑铲）
  { type: 'double', width: 80, height: 40, yOffset: 0 },    // 双障碍（长按跳跃）
  { type: 'flying', width: 40, height: 30, yOffset: -100 }, // 飞行障碍（滑铲）
]
```

## 操作映射
- 空格/点击/上滑：跳跃
- 下键/下滑：滑铲
- 支持二段跳

## 跳跃实现
```javascript
class Player {
  jump() {
    if (this.jumps > 0) {
      this.vy = -CONFIG.jumpForce
      this.jumps--
      this.onGround = false
    }
  }

  update(dt) {
    this.vy += CONFIG.gravity * dt
    this.y += this.vy * dt

    if (this.y >= CONFIG.groundY) {
      this.y = CONFIG.groundY
      this.vy = 0
      this.onGround = true
      this.jumps = 2 // 二段跳
    }

    if (this.sliding) {
      this.displayHeight = this.height * 0.5
      this.displayY = this.y + this.height * 0.5
    }
  }
}
```

## 难度曲线
- 速度线性递增
- 障碍物生成间隔递减
- 出现更多复合障碍物组合
- 每 500 分显示里程碑提示