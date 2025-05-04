# 数据格式文档

本文档详细说明了技术雷达项目中使用的数据格式和结构。

## 技术项目数据结构

技术雷达使用JSON格式存储技术项目数据。每个技术项目包含以下字段：

```typescript
interface TechItem {
  id: string;         // 唯一标识符
  name: string;       // 技术名称
  quadrant: string;   // 所属象限
  ring: string;       // 采用阶段
  description: string; // 技术描述
  moved?: number;     // 变动情况（可选）
  link?: string;      // 相关链接（可选）
}
```

### 字段说明

#### 象限 (quadrant)

象限定义了技术所属的领域类别，包括四种值：

- `tools`: 开发工具和辅助工具
- `techniques`: 开发方法、流程和技巧
- `platforms`: 平台、基础设施和操作系统
- `languages-and-frameworks`: 编程语言和框架

#### 采用阶段 (ring)

采用阶段描述了对技术的推荐使用状态，从内到外分为四个阶段：

- `adopt`: 应当采用的成熟技术
- `trial`: 值得在项目中尝试的技术
- `assess`: 值得探索和了解的技术
- `hold`: 应当慎重使用或逐步淘汰的技术

#### 变动情况 (moved)

变动情况表示技术在采用阶段的变化：

- `1`: 向内圈移动一个阶段（例如从assess到trial）
- `-1`: 向外圈移动一个阶段（例如从trial到assess）
- `0`: 保持不变
- 其他数字: 移动多个阶段

## 数据文件示例

以下是标准数据文件的示例：

```json
{
  "items": [
    {
      "id": "1",
      "name": "React",
      "quadrant": "languages-and-frameworks",
      "ring": "adopt",
      "description": "React是一个用于构建用户界面的JavaScript库，由Facebook开发和维护。",
      "moved": 0,
      "link": "https://reactjs.org/"
    },
    {
      "id": "2",
      "name": "Kubernetes",
      "quadrant": "platforms",
      "ring": "trial",
      "description": "Kubernetes是一个开源的容器编排系统，用于自动化应用程序部署、扩展和管理。",
      "moved": 1
    },
    {
      "id": "3",
      "name": "WebAssembly",
      "quadrant": "languages-and-frameworks",
      "ring": "assess",
      "description": "WebAssembly是一种新的代码类型，可以在现代Web浏览器中运行，提供接近原生的性能。"
    }
  ]
}
```

## 数据加载方式

技术雷达支持多种方式加载数据：

1. **静态JSON文件**: 从项目目录中的静态JSON文件加载
2. **API集成**: 通过REST API从服务器获取数据
3. **本地存储**: 支持从浏览器本地存储中加载数据

### 自定义数据源

要使用自定义数据源，可以修改`lib/data.ts`文件中的数据加载逻辑。 