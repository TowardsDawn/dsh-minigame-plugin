# 俄罗斯方块 (Tetris)

## 方块定义
```javascript
const PIECES = [
  { // I
    shape: [[1,1,1,1]],
    color: '#00f0f0',
  },
  { // O
    shape: [[1,1],[1,1]],
    color: '#f0f000',
  },
  { // T
    shape: [[0,1,0],[1,1,1]],
    color: '#a000f0',
  },
  { // S
    shape: [[0,1,1],[1,1,0]],
    color: '#00f000',
  },
  { // Z
    shape: [[1,1,0],[0,1,1]],
    color: '#f00000',
  },
  { // J
    shape: [[1,0,0],[1,1,1]],
    color: '#0000f0',
  },
  { // L
    shape: [[0,0,1],[1,1,1]],
    color: '#f0a000',
  },
]
```

## 方块旋转
```javascript
function rotateMatrix(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  const rotated = []
  for (let c = 0; c < cols; c++) {
    rotated[c] = []
    for (let r = rows - 1; r >= 0; r--) {
      rotated[c][rows - 1 - r] = matrix[r][c]
    }
  }
  return rotated
}

// 带碰撞检测的旋转
Piece.prototype.rotate = function(grid) {
  const rotated = rotateMatrix(this.shape)
  if (this.canPlace(rotated, this.x, this.y, grid)) {
    this.shape = rotated
  }
  // 墙踢：尝试左右偏移
  else if (this.canPlace(rotated, this.x + 1, this.y, grid)) {
    this.shape = rotated
    this.x += 1
  }
  else if (this.canPlace(rotated, this.x - 1, this.y, grid)) {
    this.shape = rotated
    this.x -= 1
  }
}
```

## 消行检测
```javascript
function clearLines(grid) {
  let linesCleared = 0
  for (let r = grid.length - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell !== null)) {
      grid.splice(r, 1)
      grid.unshift(new Array(COLS).fill(null))
      linesCleared++
      r++ // 重新检查当前行
    }
  }
  return linesCleared
}
```

## 计分系统
```javascript
const SCORE_TABLE = {
  1: 100,   // 单消
  2: 300,   // 双消
  3: 500,   // 三消
  4: 800,   // 四消 (Tetris!)
}
// 分数 = 基础分 * (level + 1)
```

## 操作
- 左/右箭头：移动
- 上箭头：旋转
- 下箭头：软降（加速下落）
- 空格：硬降（直接落底）
- 移动端：虚拟按钮 + 滑动手势

## 视觉增强
- 方块带 3D 边框效果
- 消行闪光动画
- Ghost piece（预览落点）
- 分数弹出动画
- 级别提升特效