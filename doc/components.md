# 组件使用指南

本文档描述了技术雷达项目中的主要组件及其使用方法。

## 核心组件

### 1. 雷达图组件 (RadarChart)

雷达图是本项目的核心可视化组件，用于展示技术在不同象限和采用阶段的分布。

#### 基本用法

```jsx
import { RadarChart } from '@/components/RadarChart';

// 使用示例
<RadarChart 
  data={techData} 
  width={800} 
  height={600} 
  onPointClick={handlePointClick} 
/>
```

#### 属性

| 属性名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| data | TechItem[] | 技术数据点数组 | [] |
| width | number | 图表宽度 | 800 |
| height | number | 图表高度 | 800 |
| onPointClick | function | 点击数据点时的回调函数 | undefined |
| showLegend | boolean | 是否显示图例 | true |

### 2. 列表视图组件 (ListView)

列表视图组件提供了另一种查看和筛选技术数据的方式。

#### 基本用法

```jsx
import { ListView } from '@/components/ListView';

// 使用示例
<ListView 
  data={techData} 
  onItemClick={handleItemClick} 
/>
```

#### 属性

| 属性名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| data | TechItem[] | 技术数据点数组 | [] |
| onItemClick | function | 点击列表项时的回调函数 | undefined |
| sortBy | string | 排序字段 | 'name' |
| sortDirection | 'asc'/'desc' | 排序方向 | 'asc' |

### 3. 搜索和过滤组件 (FilterBar)

用于提供数据搜索和过滤功能的组件。

#### 基本用法

```jsx
import { FilterBar } from '@/components/FilterBar';

// 使用示例
<FilterBar 
  onSearch={handleSearch} 
  onQuadrantFilter={handleQuadrantFilter}
  onRingFilter={handleRingFilter}
/>
```

#### 属性

| 属性名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| onSearch | function | 搜索关键词变化时的回调 | undefined |
| onQuadrantFilter | function | 象限筛选变化时的回调 | undefined |
| onRingFilter | function | 采用阶段筛选变化时的回调 | undefined |
| defaultQuadrant | string | 默认选中的象限 | 'all' |
| defaultRing | string | 默认选中的采用阶段 | 'all' |

### 4. 详情模态框 (DetailModal)

用于展示技术项目详细信息的模态框组件。

#### 基本用法

```jsx
import { DetailModal } from '@/components/DetailModal';

// 使用示例
<DetailModal 
  item={selectedItem} 
  isOpen={isModalOpen}
  onClose={handleCloseModal}
/>
```

#### 属性

| 属性名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| item | TechItem | 要展示的技术项目数据 | null |
| isOpen | boolean | 模态框是否打开 | false |
| onClose | function | 关闭模态框的回调函数 | undefined |

## 数据类型

主要的数据类型定义如下：

```typescript
// 技术项目数据类型
interface TechItem {
  id: string;
  name: string;
  quadrant: 'tools' | 'techniques' | 'platforms' | 'languages-and-frameworks';
  ring: 'adopt' | 'trial' | 'assess' | 'hold';
  description: string;
  moved?: number; // 变动情况，正数表示前进，负数表示后退
  link?: string;  // 相关链接
}
``` 