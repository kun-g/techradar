# 系统模式

## 架构模式

### 前端架构
- **MVVM模式** - 使用Vue.js实现的Model-View-ViewModel架构
- **组件化设计** - 将雷达图、数据选择器等作为独立组件
- **声明式渲染** - 通过Vue模板语法实现UI与数据的绑定

### 数据流
```
radarData.js (数据源) → Vue实例 (数据处理) → SVG (视图渲染)
```

## 设计模式

### 观察者模式
- Vue.js内部使用观察者模式实现数据与视图的双向绑定
- 当数据变化时，自动更新相应的视图元素

### 工厂模式
- 通过`calculatePosition`函数为每个数据点创建坐标

### 策略模式
- 通过不同的雷达数据配置实现不同的展示策略

## 技术雷达特定模式

### 四象限模型
- 将内容分为四个象限(例如：技能、工具、思想、技术)
- 每个象限占据雷达图的1/4区域

### 采纳阶段分层
- 采用同心圆表示不同的采纳阶段
- 从内到外表示从"已采纳"到"保留观望"的过渡

### 随机分布算法
当前项目使用简单随机算法在扇形区域内放置数据点：
```javascript
function calculatePosition(quadrant, stage, circles) {
    let fromR = 0
    let toR = circles[stage].r
    if (stage > 0) {
        fromR = circles[stage-1].r
    }
    let x = (toR-fromR)/2 + fromR
    let t = (Math.PI/2) * Math.random() + (Math.PI*quadrant/2)
    let y = x*Math.sin(t)
    x *= Math.cos(t)

    return { x, y }
}
```

### 可改进的分布算法
当前算法的问题在于没有考虑点之间的距离，导致点可能聚集在一起。可改进的方向：
- 引入最小距离约束
- 实现碰撞检测和调整
- 采用力导向布局算法

## 交互模式
- **悬停高亮** - 鼠标悬停时改变数据点颜色
- **点击交互** - 点击时触发事件(当前仅记录日志)
- **数据集切换** - 通过下拉列表切换不同的雷达数据集 