# 技术上下文

## 前端技术栈

### 核心框架
- **Next.js** - React框架，提供SSR、路由等功能
- **React** - 用于构建用户界面的JavaScript库
- **TypeScript** - 强类型的JavaScript超集
- **Tailwind CSS** - 实用优先的CSS框架
- **Radix UI** - 无样式、可访问性强的React组件库

### 可视化技术
- **SVG** - 可缩放矢量图形，用于绘制雷达图
- **Framer Motion** - React动画库，用于UI动效

## 开发工具

### 版本控制
- **Git** - 代码版本控制系统

### 开发工具
- **VS Code / WebStorm** - 代码编辑器
- **Chrome DevTools** - 浏览器调试工具
- **npm / pnpm** - 包管理工具

## 技术约束

### 兼容性
- 现代浏览器支持(Chrome, Firefox, Safari, Edge)
- 需要支持SVG和现代JavaScript特性

### 性能考量
- 随着数据点增多，需考虑渲染性能
- 大量SVG元素可能导致页面响应延迟

## 部署环境

### 托管选项
- 可部署到Vercel, Netlify等Next.js友好的平台
- 也可部署到任何支持Node.js的服务器

### 资源要求
- Node.js环境
- 无需后端数据库

## 当前技术实现

### 数据布局解决方案
- 已实现优化的数据点分布算法(radar_distribution.ts)
- 使用改进的力导向算法避免数据点重叠

### 交互功能
- 支持点击显示详细信息模态框
- 悬停效果增强
- 搜索和筛选功能

### 视觉设计
- 使用Tailwind CSS实现响应式设计
- 适应不同屏幕尺寸的界面布局
- 暗色/亮色主题支持

## 技术亮点

### 组件化架构
- 将雷达图拆分为多个独立组件(radar-visualization, radar-blips等)
- 使用React Hooks管理状态和副作用

### 优化的数据可视化
- 智能数据点分布算法避免重叠
- 交互式视图切换(雷达视图/列表视图)

### 性能优化
- 组件懒加载
- 状态管理优化 