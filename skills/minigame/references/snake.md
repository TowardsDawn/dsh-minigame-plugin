# 贪吃蛇 (Snake)

## 游戏机制
- 蛇在网格中移动，方向键盘控制
- 吃到食物增长身体
- 撞墙或撞自己则游戏结束
- 分数 = 吃到的食物数量
- 速度逐渐递增

## 核心参数
```javascript
const CONFIG = {
  gridSize: 20,
  canvasWidth: 400,
  canvasHeight: 400,
  initialSpeed: 150, // ms per move
  minSpeed: 60,
  speedIncrement: 2,
}
```

## 数据结构
```javascript
class Snake {
  constructor() {
    this.body = [
      { x: 10, y: 10 }, // 头
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]
    this.direction = { x: 1, y: 0 }
    this.nextDirection = { x: 1, y: 0 }
    this.growing = false
  }

  move() {
    this.direction = this.nextDirection
    const head = {
      x: this.body[0].x + this.direction.x,
      y: this.body[0].y + this.direction.y,
    }
    this.body.unshift(head)
    if (!this.growing) {
      this.body.pop()
    }
    this.growing = false
  }

  grow() { this.growing = true }

  checkCollision(cols, rows) {
    const head = this.body[0]
    // 撞墙
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return true
    // 撞自己
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) return true
    }
    return false
  }
}
```

## 食物生成
```javascript
function spawnFood(snake, cols, rows) {
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }
  } while (snake.body.some(s => s.x === pos.x && s.y === pos.y))
  return pos
}
```

## 视觉建议
- 蛇身用渐变色段，头部特殊标记
- 食物带脉冲动画
- 网格背景线（淡色）
- 可以添加粒子拖尾效果

## 方向控制
- 方向键/WASD
- 不能反向移动（防止瞬间死亡）
- 移动端：滑动手势或虚拟方向键