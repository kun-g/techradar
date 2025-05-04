# 技术雷达

技术雷达是一个可视化工具，用于跟踪和展示技术趋势、工具和框架的采用状态。它将技术项目按照不同的象限和采用阶段进行分类，帮助团队做出更明智的技术决策。

## 主要特点

- **四象限布局**：技术项目按照不同领域（如工具、平台、技术和框架等）分类
- **采用阶段**：从内到外分为试验、采用、评估和暂缓四个阶段
- **数据点可视化**：每个技术项目以点的形式展示在雷达图上
- **交互式体验**：支持点击和悬停查看详细信息

## 使用方法

1. 在雷达图上查看当前技术分布
2. 点击数据点查看详细信息
3. 使用筛选功能关注特定象限或阶段
4. 定期更新雷达图以反映技术趋势变化

## 技术实现

本项目基于以下技术构建：
- **Next.js 和 React**：现代化的前端框架
- **TypeScript**：提供类型安全的开发体验
- **Tailwind CSS**：实现灵活的样式管理
- **Recharts**：数据可视化库
- **Jest**：单元测试框架

## 开发指南

### 环境设置

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

### 项目结构

```
techradar/
├── app/             # Next.js应用页面
├── components/      # React组件
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