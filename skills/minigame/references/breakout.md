# 弹球消砖块 (Breakout)

## 游戏元素
- **挡板**：底部水平移动，键盘/触屏控制
- **球**：反弹运动，碰撞检测
- **砖块**：网格排列，不同颜色/生命值
- **计分**：每块砖不同分数
- **生命**：3条命，球落底扣命

## 核心参数
```javascript
const CONFIG = {
  paddleWidth: 100,
  paddleHeight: 15,
  paddleY: 0, // 距底部距离
  paddleSpeed: 500,
  ballRadius: 8,
  ballSpeed: 400,
  rows: 5,
  cols: 10,
  brickWidth: 60,
  brickHeight: 20,
  brickPadding: 4,
  brickOffsetTop: 40,
  brickOffsetLeft: 20,
  lives: 3,
}
```

## 碰撞检测要点
1. 球与挡板：检测球底是否进入挡板区域，根据碰撞位置偏转角度
2. 球与砖块：遍历砖块数组，检测矩形与圆形碰撞
3. 球与墙壁：左右墙反弹 x 方向，顶墙反弹 y 方向
4. 球落底：y > canvas.height 时扣命

## 反弹角度计算
```javascript
// 根据球击中挡板的位置调整反弹角度
function hitPaddle(ball, paddle) {
  const hitPos = (ball.x - paddle.x) / paddle.width // 0~1
  const angle = (hitPos - 0.5) * Math.PI * 0.7 // -63° ~ +63°
  const speed = ball.speed * 1.02 // 逐渐加速
  ball.vx = speed * Math.sin(angle)
  ball.vy = -speed * Math.cos(angle)
}
```

## 砖块颜色方案
```javascript
const ROW_COLORS = ['#ff4757', '#ff6b81', '#ffa502', '#7bed9f', '#70a1ff']
// 或暗色主题
const ROW_COLORS_DARK = ['#ff4757', '#e84393', '#6c5ce7', '#00cec9', '#fdcb6e']
```

## 粒子特效
- 砖块被击中时生成粒子爆炸
- 粒子颜色与砖块颜色匹配
- 粒子有重力下落效果
- 10-15 个粒子，生命 0.5-1s

## 移动端适配
- 挡板跟随手指 x 坐标
- 挡板宽度适配屏幕宽度
- 点击/触摸任意位置发射球