# 射击游戏 (Shooter)

## 基本架构
- 玩家在底部移动，发射子弹向上
- 敌人从顶部生成，向下移动
- 碰撞检测：子弹击中敌人 + 敌人碰撞玩家
- 波次系统：每波敌人数量递增
- 分数和生命系统

## 核心参数
```javascript
const CONFIG = {
  playerSpeed: 400,
  playerWidth: 40,
  playerHeight: 40,
  bulletSpeed: 600,
  bulletWidth: 4,
  bulletHeight: 12,
  fireRate: 0.2, // 秒
  enemySpeed: 150,
  enemyWidth: 35,
  enemyHeight: 35,
  enemySpawnRate: 1.0,
  maxLives: 3,
}
```

## 对象池模式
```javascript
class Pool {
  constructor(createFn) {
    this.items = []
    this.createFn = createFn
  }

  get() {
    return this.items.find(i => !i.active) || this.create()
  }

  create() {
    const item = this.createFn()
    this.items.push(item)
    return item
  }

  getActive() {
    return this.items.filter(i => i.active)
  }
}

// 使用
const bulletPool = new Pool(() => ({ x: 0, y: 0, active: false }))
const bullet = bulletPool.get()
bullet.x = player.x
bullet.y = player.y
bullet.active = true
```

## 敌人生成模式
```javascript
// 直线排列
function spawnLine(row, count, speed) {
  const spacing = canvas.width / (count + 1)
  for (let i = 0; i < count; i++) {
    spawnEnemy(spacing * (i + 1), -row * 40, speed)
  }
}

// V 字形
function spawnVFormation(y, count, speed) {
  const center = canvas.width / 2
  for (let i = 0; i < count; i++) {
    const offset = i * 30
    spawnEnemy(center - offset, y - offset, speed)
    spawnEnemy(center + offset, y - offset, speed)
  }
}

// 随机
function spawnRandom(count, speed) {
  for (let i = 0; i < count; i++) {
    spawnEnemy(Math.random() * canvas.width, -20, speed + Math.random() * 50)
  }
}
```

## 碰撞检测
```javascript
function checkBulletEnemyCollisions(bullets, enemies) {
  for (const bullet of bullets.getActive()) {
    for (const enemy of enemies) {
      if (!enemy.active) continue
      if (rectCollide(
        { x: bullet.x, y: bullet.y, w: CONFIG.bulletWidth, h: CONFIG.bulletHeight },
        { x: enemy.x, y: enemy.y, w: CONFIG.enemyWidth, h: CONFIG.enemyHeight }
      )) {
        bullet.active = false
        enemy.active = false
        score += enemy.points
        spawnExplosion(enemy.x, enemy.y)
        sfx.hit()
      }
    }
  }
}
```

## 爆炸粒子效果
```javascript
function spawnExplosion(x, y, color = '#ff6b6b') {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5
    const speed = 100 + Math.random() * 150
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.8,
      color,
      size: 2 + Math.random() * 3,
    })
  }
}
```

## 道具系统
- 三连射：拾取后短暂发射三颗子弹
- 护盾：抵挡一次伤害
- 加速：短暂提升移动速度
- 清屏炸弹：消灭所有敌人