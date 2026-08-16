# 记忆翻牌 (Memory Card)

## 游戏机制
- 卡牌面朝下排列
- 每次翻两张，匹配则消除
- 全部匹配完成胜利
- 记录步数和时间

## 核心参数
```javascript
const CONFIG = {
  pairs: 8, // 8 对 = 16 张牌
  cols: 4,
  rows: 4,
  cardWidth: 80,
  cardHeight: 100,
  cardGap: 10,
  flipDuration: 0.3, // 翻牌动画秒数
  revealDuration: 0.8, // 不匹配时展示时间
}
```

## 卡牌数据
```javascript
const CARD_SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑']
// 或使用 emoji / 颜色 / 图标

function createDeck() {
  const deck = []
  for (let i = 0; i < CONFIG.pairs; i++) {
    deck.push({ id: i, symbol: CARD_SYMBOLS[i], matched: false })
    deck.push({ id: i, symbol: CARD_SYMBOLS[i], matched: false })
  }
  // Fisher-Yates 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}
```

## 翻牌动画
```javascript
class Card {
  constructor(data) {
    this.data = data
    this.flipped = false
    this.flipProgress = 0 // 0 = 背面, 1 = 正面
    this.matched = false
  }

  update(dt) {
    const target = this.flipped ? 1 : 0
    this.flipProgress += (target - this.flipProgress) * 10 * dt
    // 超过 0.5 时切换显示的图案
  }

  draw(ctx, x, y) {
    const scale = Math.abs(Math.cos(this.flipProgress * Math.PI))
    const w = CONFIG.cardWidth * scale
    ctx.save()
    ctx.translate(x + CONFIG.cardWidth / 2, y + CONFIG.cardHeight / 2)
    ctx.scale(scale, 1)

    if (this.flipProgress < 0.5) {
      // 背面
      this.drawBack(ctx, -CONFIG.cardWidth / 2, -CONFIG.cardHeight / 2)
    } else {
      // 正面
      this.drawFront(ctx, -CONFIG.cardWidth / 2, -CONFIG.cardHeight / 2)
    }
    ctx.restore()
  }
}
```

## 视觉设计
- 卡牌背面：统一花纹或颜色
- 卡牌正面：彩色背景 + emoji 符号
- 匹配成功：绿色边框 + 缩小消失动画
- 匹配失败：短暂闪烁红色后翻回
- hover 效果：轻微放大

## 计分
- 显示步数（翻转次数）
- 显示用时
- 记录最佳成绩（最少步数）
- 星级评价：步数越少星星越多