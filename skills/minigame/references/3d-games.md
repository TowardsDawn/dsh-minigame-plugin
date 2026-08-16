# 3D 游戏开发

支持使用 Three.js 和 Babylon.js 创建 3D 小游戏，包体限制 < 128MB。

## 引擎选择

### Three.js（推荐首选）
- 最流行的 WebGL 3D 库，社区资源丰富
- 轻量灵活，按需引入
- 适合：3D 跑酷、赛车、射击、解谜、物理模拟
- CDN：`<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170/build/three.module.js"}}</script>`
- 包体：~150KB gzipped（核心）

### Babylon.js
- 功能完整的 3D 游戏引擎
- 内置物理引擎、粒子系统、GUI、音频
- 适合：复杂 3D 场景、角色扮演、开放世界
- CDN：`<script src="https://cdn.babylonjs.com/babylon.js"></script>`
- 包体：~500KB gzipped（核心）

### 引擎对比
| 特性 | Three.js | Babylon.js |
|------|----------|------------|
| 学习曲线 | 中等 | 较陡 |
| 开箱即用 | 需要组合 | 功能齐全 |
| 物理引擎 | 需搭配 Cannon-es | 内置 Havok/Ammo |
| 阴影 | 手动配置 | 一键开启 |
| GUI | 需搭配 lil-gui | 内置 GUI |
| 适合场景 | 轻量 3D、创意作品 | 完整 3D 游戏 |

## 3D 游戏类型模板

### 1. 3D 跑酷 (3D Runner)
- 第三人称视角，自动前进
- 三条跑道切换，障碍躲避
- 金币收集、道具系统
- 参考 [3d-runner.md](3d-runner.md)

### 2. 3D 赛车 (Racing)
- 第三人称追尾视角
- 道路生成、转向物理
- 氮气加速、计时赛
- 参考 [3d-racing.md](3d-racing.md)

### 3. 3D 射击 (FPS/TPS)
- 第一/第三人称视角
- 射线检测、子弹轨迹
- 敌人 AI、波次系统
- 参考 [3d-shooter.md](3d-shooter.md)

### 4. 3D 物理解谜
- 物理模拟（重力、碰撞、关节）
- 拖拽交互、机关触发
- 关卡解锁机制

### 5. 3D 弹球
- 3D 弹球台
- 物理反弹、挡板控制
- 得分机关、连击奖励

### 6. 3D 塔防
- 俯视视角
- 炮塔放置、敌人路径
- 升级系统、特效

## Three.js 快速上手

### 基础场景
```javascript
import * as THREE from 'three'

// 场景、相机、渲染器
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0a0f)
scene.fog = new THREE.Fog(0x0a0a0f, 10, 50)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比省性能
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
document.body.appendChild(renderer.domElement)

// 光照
const ambientLight = new THREE.AmbientLight(0x404060, 0.5)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xffffff, 3)
sunLight.position.set(5, 10, 5)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 1024
sunLight.shadow.mapSize.height = 1024
sunLight.shadow.camera.near = 0.5
sunLight.shadow.camera.far = 50
scene.add(sunLight)

// 游戏循环
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)
  update(dt)
  renderer.render(scene, camera)
}
animate()
```

### 几何体速查
```javascript
// 立方体
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff6b9d, roughness: 0.3, metalness: 0.1 })
)
box.castShadow = true
box.receiveShadow = true
scene.add(box)

// 球体
new THREE.SphereGeometry(1, 32, 32)

// 圆柱体
new THREE.CylinderGeometry(0.5, 0.5, 1, 32)

// 平面（地面）
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// 圆环
new THREE.TorusGeometry(1, 0.3, 16, 32)

// 自定义形状（挤出）
const shape = new THREE.Shape()
shape.moveTo(0, 0)
shape.lineTo(1, 0)
shape.lineTo(0.5, 1)
const extrudeSettings = { steps: 1, depth: 0.2, bevelEnabled: true }
new THREE.ExtrudeGeometry(shape, extrudeSettings)
```

### 材质速查
```javascript
// 标准 PBR 材质（推荐）
new THREE.MeshStandardMaterial({ color, roughness, metalness })

// 物理材质（更真实）
new THREE.MeshPhysicalMaterial({
  color, roughness: 0.1, metalness: 0,
  clearcoat: 0.5, clearcoatRoughness: 0.1
})

// 自发光材质
new THREE.MeshStandardMaterial({ color, emissive: 0xff6b9d, emissiveIntensity: 2 })

// 卡通材质（Toon）
new THREE.MeshToonMaterial({ color })

// 半透明
new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.5 })

// 线框
new THREE.MeshBasicMaterial({ color: 0xff6b9d, wireframe: true })
```

### 粒子系统
```javascript
const particleCount = 500
const positions = new Float32Array(particleCount * 3)
const colors = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  colors[i * 3] = Math.random()
  colors[i * 3 + 1] = 0.3 + Math.random() * 0.4
  colors[i * 3 + 2] = 0.5 + Math.random() * 0.5
}

const particles = new THREE.BufferGeometry()
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const particleMat = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
})

const particleSystem = new THREE.Points(particles, particleMat)
scene.add(particleSystem)
```

### 后处理特效
```javascript
// 需要引入 EffectComposer
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

// 泛光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
)
composer.addPass(bloomPass)

// 残影效果
const afterimagePass = new AfterimagePass(0.2)
composer.addPass(afterimagePass)

// 渲染循环中用 composer.render() 替代 renderer.render()
```

## 3D 性能优化

### 几何体优化
- 使用 `InstancedMesh` 批量渲染相同物体（如金币、敌人、树木）
- 低多边形风格（Low Poly）减少面数
- 使用 `BufferGeometry` 而非 `Geometry`
- 合并静态物体为单个几何体

```javascript
// InstancedMesh 批量渲染
const count = 100
const mesh = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xffd700 }),
  count
)
const dummy = new THREE.Object3D()
for (let i = 0; i < count; i++) {
  dummy.position.set(Math.random() * 20 - 10, 0.25, Math.random() * 20 - 10)
  dummy.updateMatrix()
  mesh.setMatrixAt(i, dummy.matrix)
}
scene.add(mesh)
```

### 纹理优化
- 使用压缩纹理格式（KTX2/Basis）
- 纹理尺寸不超过 1024x1024
- 使用 `generateMipmaps: false` 对不需要缩放的纹理
- 复用纹理，避免重复加载

### 渲染优化
- 限制像素比：`Math.min(devicePixelRatio, 2)`
- 使用 `frustumCulled: true`（默认开启）
- 远处物体使用 LOD（Level of Detail）
- 移动端降低阴影质量或关闭阴影
- 使用 `renderer.info.render` 监控 draw calls

### 物理优化
- Cannon-es：轻量级 3D 物理引擎
- 只在必要时检测碰撞，使用空间分区
- 固定时间步长 `1/60`
- 休眠不动的物体

```javascript
// Cannon-es 物理世界
import * as CANNON from 'cannon-es'

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

// 物理材质
const defaultMaterial = new CANNON.Material('default')
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.4,
  restitution: 0.3,
})
world.addContactMaterial(contactMaterial)

// 时间步
const fixedTimeStep = 1 / 60
const maxSubSteps = 3
world.step(fixedTimeStep, dt, maxSubSteps)
```

## Babylon.js 快速上手

```javascript
import * as BABYLON from '@babylonjs/core'

const canvas = document.getElementById('game')
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })

const createScene = () => {
  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.06, 1)

  // 相机
  const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI/2, Math.PI/3, 10, BABYLON.Vector3.Zero(), scene)
  camera.attachControl(canvas, true)

  // 光照
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)

  // 内置物理引擎
  const gravityVector = new BABYLON.Vector3(0, -9.81, 0)
  const physicsPlugin = new BABYLON.HavokPlugin()
  scene.enablePhysics(gravityVector, physicsPlugin)

  // 地面
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene)

  // 球体（带物理）
  const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene)
  sphere.position.y = 5
  new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.5 }, scene)

  // 粒子
  const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene)
  particleSystem.particleTexture = new BABYLON.Texture('data:...', scene)
  particleSystem.emitter = new BABYLON.Vector3(0, 2, 0)
  particleSystem.start()

  return scene
}

const scene = createScene()
engine.runRenderLoop(() => scene.render())
window.addEventListener('resize', () => engine.resize())
```

## 3D 音效（空间音频）

```javascript
// Three.js 空间音频
const listener = new THREE.AudioListener()
camera.add(listener)

const audioLoader = new THREE.AudioLoader()
const sound = new THREE.PositionalAudio(listener)
audioLoader.load('sfx.mp3', (buffer) => {
  sound.setBuffer(buffer)
  sound.setRefDistance(5)
  sound.setRolloffFactor(1)
  sound.setVolume(0.5)
  sound.autoplay = true
})

// 将音源绑定到 3D 物体
const audioSource = new THREE.Object3D()
audioSource.position.set(3, 1, 0)
audioSource.add(sound)
scene.add(audioSource)
```

## 移动端 3D 适配

- 限制像素比 ≤ 2
- 减少阴影贴图分辨率（512 或更低）
- 关闭抗锯齿
- 使用低多边形模型
- 触摸控制：单指旋转视角，双指缩放
- 虚拟摇杆控制移动

## 3D 游戏包体管理

- 总包体 < 128MB（含模型、纹理、音频）
- 模型优先使用程序化几何体，减少外部模型依赖
- 必须使用外部模型时，优先 GLTF/GLB 格式
- 纹理使用 WebP 或压缩格式
- 音频使用 MP3 128kbps 或 Opus
- 使用 `compression` 工具压缩静态资源