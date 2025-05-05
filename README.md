# 技术雷达

技术雷达是一个可视化工具，用于跟踪和展示技术趋势、工具和框架的采用状态。它将技术项目按照不同的象限和采用阶段进行分类，帮助团队做出更明智的技术决策。

## 主要特点

- **四象限布局**：技术项目按照不同领域（如工具、平台、技术和框架等）分类
- **采用阶段**：从内到外分为试验、采用、评估和暂缓四个阶段
- **数据点可视化**：每个技术项目以点的形式展示在雷达图上
- **交互式体验**：支持点击和悬停查看详细信息
- **AI辅助分类**：使用AI自动判断技术项目的象限分类

## 使用方法

1. 在雷达图上查看当前技术分布
2. 点击数据点查看详细信息
3. 使用筛选功能关注特定象限或阶段
4. 添加新技术时，AI自动推荐适合的象限分类
5. 定期更新雷达图以反映技术趋势变化

## 技术实现

本项目基于以下技术构建：
- **Next.js 和 React**：现代化的前端框架
- **TypeScript**：提供类型安全的开发体验
- **Tailwind CSS**：实现灵活的样式管理
- **Recharts**：数据可视化库
- **Jest**：单元测试框架
- **Ladle**：组件开发和测试工具

## 开发指南

### 环境设置

创建一个名为`.env.local`的文件在项目根目录，并添加以下环境变量：

```bash
# Notion API密钥和数据库ID
NOTION_API_KEY=your_notion_api_key
NOTION_BLIPS_DATABASE_ID=your_notion_blips_database_id
NOTION_LOGS_DATABASE_ID=your_notion_logs_database_id

# DeepSeek API密钥用于自动分类
DEEPSEEK_API_KEY=your_deepseek_api_key
```

然后安装依赖并启动开发服务器：

```bash
# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev

# 运行测试
npm run test
# 或
pnpm test
```

### 使用 Ladle 进行组件开发

[Ladle](https://ladle.dev/) 是一个轻量级的组件开发和测试工具，类似于 Storybook。它可以帮助您独立开发、测试和文档化组件。

#### 启动 Ladle 服务

```bash
# 启动 Ladle 开发服务器
npm run ladle:serve
# 或
pnpm ladle:serve
```

此命令会启动一个本地服务器（默认端口：61001），您可以在浏览器中访问 http://localhost:61001/ 查看组件库。

#### 构建静态组件库

```bash
# 构建 Ladle 静态站点
npm run ladle:build
# 或
pnpm ladle:build
```

此命令会在 `build` 目录下生成静态文件，可以部署到任何静态网站托管服务。

#### 创建组件故事

在组件目录中创建以 `.stories.tsx` 结尾的文件：

```tsx
// components/my-component/my-component.stories.tsx
import type { Story } from "@ladle/react";
import MyComponent from "./my-component";

export const Basic: Story = () => <MyComponent text="Hello World" />;

export const WithCustomColor: Story = () => (
  <MyComponent text="Custom Color" color="blue" />
);
```

#### 特殊组件功能

雷达图组件支持以下特殊功能：

- **数据点朝向**：通过 `factTo` 属性控制数据点弧线的朝向
- **数据点状态**：通过 `movement` 属性展示数据点的状态变化（移入、移出、新增、不变）

```tsx
<RadarBlip 
  blip={techBlip} 
  rings={ringData}
  onBlipClick={handleClick}
  factTo={{ x: 200, y: 300 }} // 指定弧线朝向坐标
/>
```

### 项目结构

```
techradar/
├── app/             # Next.js应用页面
├── components/      # React组件
│   └── radar/       # 雷达图相关组件
│       └── *.stories.tsx  # 组件故事文件
├── .ladle/          # Ladle 配置文件
├── lib/            # 通用库和工具函数
├── public/         # 静态资源
├── styles/         # 全局样式
├── __tests__/      # 测试文件
└── doc/            # 项目文档
```

## 贡献指南

1. Fork该仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 架构决策记录

本项目使用架构决策记录(ADR)来记录重要的架构决策。详情请参见`doc/adr`目录。