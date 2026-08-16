# 平台跳跃 (Platformer)

## 核心参数
```javascript
const CONFIG = {
  gravity: 980,
  playerSpeed: 250,
  jumpForce: -420,
  playerWidth: 32,
  playerHeight: 48,
  groundY: 500,
  tileSize: 32,
}
```

## 物理系统
```javascript
class Player {
  constructor(x, y) {
    this.x = x; this.y = y
    this.vx = 0; this.vy = 0
    this.width = CONFIG.playerWidth
    this.height = CONFIG.playerHeight
    this.onGround = false
  }

  update(dt, platforms) {
    // 水平移动
    this.vx = 0
    if (keys.left) this.vx = -CONFIG.playerSpeed
    if (keys.right) this.vx = CONFIG.playerSpeed

    // 重力
    this.vy += CONFIG.gravity * dt

    // 跳跃
    if (keys.jump && this.onGround) {
      this.vy = CONFIG.jumpForce
      this.onGround = false
    }

    // 移动 + 碰撞
    this.x += this.vx * dt
    this.resolveCollisionX(platforms)
    this.y += this.vy * dt
    this.resolveCollisionY(platforms)
  }

  resolveCollisionX(platforms) {
    for (const p of platforms) {
      if (this.overlaps(p)) {
        if (this.vx > 0) {
          this.x = p.x - this.width
        } else if (this.vx < 0) {
          this.x = p.x + p.width
        }
        this.vx = 0
      }
    }
  }

  resolveCollisionY(platforms) {
    this.onGround = false
    for (const p of platforms) {
      if (this.overlaps(p)) {
        if (this.vy > 0) {
          this.y = p.y - this.height
          this.onGround = true
        } else if (this.vy < 0) {
          this.y = p.y + p.height
        }
        this.vy = 0
      }
    }
  }

  overlaps(p) {
    return (
      this.x < p.x + p.width &&
      this.x + this.width > p.x &&
      this.y < p.y + p.height &&
      this.y + this.height > p.y
    )
  }
}
```

## 摄像机系统
```javascript
class Camera {
  constructor(width, height) {
    this.x = 0; this.y = 0
    this.width = width; this.height = height
  }

  follow(target, worldWidth, worldHeight) {
    // 平滑跟随
    this.x += (target.x - this.width / 2 - this.x) * 0.1
    this.y += (target.y - this.height / 2 - this.y) * 0.1

    // 边界限制
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.width))
    this.y = Math.max(0, Math.min(this.y, worldHeight - this.height))
  }

  apply(ctx) {
    ctx.translate(-this.x, -this.y)
  }
}
```

## 关卡设计
- 使用 Tile Map 数据格式
- 数字映射到不同平台类型
```javascript
const TILE_TYPES = {
  0: null,     // 空
  1: 'ground', // 地面
  2: 'brick',  // 砖块
  3: 'spike',  // 尖刺（伤害）
  4: 'coin',   // 金币
  5: 'goal',   // 终点
}

const level1 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,2,2,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [1,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0,1,1,1],
]
```

## 动画状态
- 空闲、跑步、跳跃、下落
- 每个状态对应不同帧范围
- 根据 vx、vy 和 onGround 切换状态