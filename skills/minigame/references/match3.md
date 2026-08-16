# 消除游戏 (Match-3)

## 网格系统
```javascript
const GRID = {
  rows: 8,
  cols: 8,
  cellSize: 50,
  colors: ['#ff4757', '#ff6b81', '#ffa502', '#2ed573', '#1e90ff', '#a55eea'],
  types: 6, // 糖果种类数
}

class Grid {
  constructor() {
    this.cells = []
    this.selected = null
    this.init()
  }

  init() {
    for (let r = 0; r < GRID.rows; r++) {
      this.cells[r] = []
      for (let c = 0; c < GRID.cols; c++) {
        let type
        do {
          type = Math.floor(Math.random() * GRID.types)
        } while (this.wouldMatch(r, c, type))
        this.cells[r][c] = { type, row: r, col: c }
      }
    }
  }

  wouldMatch(row, col, type) {
    // 检查水平方向
    if (col >= 2 &&
      this.cells[row][col - 1]?.type === type &&
      this.cells[row][col - 2]?.type === type) return true
    // 检查垂直方向
    if (row >= 2 &&
      this.cells[row - 1]?.[col]?.type === type &&
      this.cells[row - 2]?.[col]?.type === type) return true
    return false
  }

  findMatches() {
    const matches = new Set()
    // 水平三连
    for (let r = 0; r < GRID.rows; r++) {
      for (let c = 0; c < GRID.cols - 2; c++) {
        if (this.cells[r][c] && this.cells[r][c + 1] && this.cells[r][c + 2]) {
          if (this.cells[r][c].type === this.cells[r][c + 1].type &&
              this.cells[r][c].type === this.cells[r][c + 2].type) {
            matches.add(`${r},${c}`)
            matches.add(`${r},${c + 1}`)
            matches.add(`${r},${c + 2}`)
          }
        }
      }
    }
    // 垂直三连
    for (let r = 0; r < GRID.rows - 2; r++) {
      for (let c = 0; c < GRID.cols; c++) {
        if (this.cells[r][c] && this.cells[r + 1][c] && this.cells[r + 2][c]) {
          if (this.cells[r][c].type === this.cells[r + 1][c].type &&
              this.cells[r][c].type === this.cells[r + 2][c].type) {
            matches.add(`${r},${c}`)
            matches.add(`${r + 1},${c}`)
            matches.add(`${r + 2},${c}`)
          }
        }
      }
    }
    return matches
  }

  removeMatches(matches) {
    for (const key of matches) {
      const [r, c] = key.split(',').map(Number)
      this.cells[r][c] = null
    }
  }

  applyGravity() {
    for (let c = 0; c < GRID.cols; c++) {
      let writeRow = GRID.rows - 1
      for (let r = GRID.rows - 1; r >= 0; r--) {
        if (this.cells[r][c] !== null) {
          this.cells[writeRow][c] = this.cells[r][c]
          this.cells[writeRow][c].row = writeRow
          writeRow--
        }
      }
      // 填充新糖果
      for (let r = writeRow; r >= 0; r--) {
        this.cells[r][c] = {
          type: Math.floor(Math.random() * GRID.types),
          row: r,
          col: c,
        }
      }
    }
  }
}
```

## 交换检测
- 相邻糖果才能交换
- 交换后必须形成三连
- 不形成三连则交换回去
- 使用动画过渡

## 连锁消除
- 消除后重力下落
- 下落可能形成新的三连（连锁）
- 连锁加分递增（1x, 2x, 3x...）
- 四连、五连特殊效果

## 特效
- 消除时的粒子爆发
- 下落动画
- 连锁消除时的屏幕震动
- 音效：消除、连锁、无效操作