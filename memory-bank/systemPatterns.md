# 系统模式

## 架构模式

### 前端架构
- **Next.js App Router** - 基于文件系统的路由架构
- **React组件模式** - 功能型和展示型组件的分离
- **客户端组件** - 使用"use client"指令的交互式组件
- **服务端组件** - 数据获取和初始化的服务端组件

### 数据流
```
lib/data.ts (数据源) → React组件 (状态管理) → SVG (视图渲染)
```

## 设计模式

### 状态管理
- 使用React Hooks (useState, useEffect)管理组件状态
- 组件间通过props传递数据和回调函数

### 组合模式
- 通过组件组合构建复杂UI (RadarVisualization, BlipList等)
- 使用Radix UI原子组件构建更复杂的UI组件

### 数据过滤模式
- 通过useEffect和依赖数组实现响应式数据过滤

## 技术雷达特定模式

### 四象限模型
- 将内容分为四个象限(如：工具、平台、技术、语言与框架)
- 每个象限占据雷达图的1/4区域

### 采纳阶段分层
- 采用同心圆表示不同的采纳阶段(采纳、试用、评估、暂缓)
- 从内到外表示从"已采纳"到"保留观望"的过渡

### 优化的分布算法
当前项目使用优化的力导向算法在扇形区域内放置数据点：

```typescript
// lib/radar_distribution.ts中实现的优化算法
export function distributeBlips(
  blips: Blip[],
  quadrants: Quadrant[],
  rings: Ring[],
  width: number,
  height: number
): Blip[] {
  // 基于象限和环计算初始位置
  const blipsWithPositions = [...blips].map((blip) => {
    const position = calculateInitialPosition(blip, quadrants, rings, width, height);
    return { ...blip, position };
  });

  // 应用力导向算法避免重叠
  return applyForceDirected(blipsWithPositions, quadrants, rings, width, height);
}
```

### 碰撞检测和避免
- 使用力导向算法进行点的位置调整
- 考虑点之间的距离，避免重叠
- 保持点在正确的象限和环内

## 交互模式
- **响应式设计** - 适应不同屏幕尺寸的布局
- **模态对话框** - 点击数据点显示详细信息
- **过滤和搜索** - 通过quadrant和ring过滤数据点
- **视图切换** - 雷达视图和列表视图的切换
- **无障碍设计** - 键盘导航和屏幕阅读器支持 