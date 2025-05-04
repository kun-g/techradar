# 贡献指南

感谢您对技术雷达项目的关注！本文档将指导您如何为项目做出贡献。

## 开始之前

在开始贡献之前，请确保您已经：

1. 阅读了[README.md](../README.md)文件，了解项目的基本信息
2. 了解项目的架构和设计理念
3. 熟悉React、Next.js和TypeScript等相关技术

## 贡献流程

### 1. 设置开发环境

首先，您需要将项目克隆到本地并设置开发环境：

```bash
# 克隆仓库
git clone https://github.com/your-username/techradar.git
cd techradar

# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev
```

### 2. 创建分支

为您的贡献创建一个新的分支：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-you-are-fixing
```

### 3. 进行开发

在您的分支上进行开发。请确保：

- 遵循项目的代码规范和风格
- 为新功能编写测试
- 保持代码简洁和可维护

### 4. 测试

开发完成后，运行测试以确保代码质量：

```bash
npm run test
# 或
pnpm test
```

### 5. 提交变更

提交您的变更，使用清晰的提交信息：

```bash
git add .
git commit -m "描述你的变更"
```

我们使用以下前缀来分类提交：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码风格变更（不影响代码功能）
- `refactor:` 代码重构
- `test:` 添加或修改测试
- `chore:` 构建过程或辅助工具的变动

例如：
```bash
git commit -m "feat: 添加历史数据对比功能"
```

### 6. 推送并创建Pull Request

将您的分支推送到远程仓库并创建一个Pull Request：

```bash
git push origin feature/your-feature-name
```

然后在GitHub上创建一个Pull Request，清晰描述您的变更内容和目的。

## 代码规范

### JavaScript/TypeScript规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript类型安全原则

### 组件开发规范

- 使用函数组件和Hooks，避免使用类组件
- 组件名使用PascalCase命名
- 文件名应与组件名一致
- 每个组件文件应该只导出一个主要组件
- 较大的组件可以拆分为多个小组件

### 测试规范

- 组件应该有对应的单元测试
- 使用Jest和React Testing Library进行测试
- 测试文件名格式为`[ComponentName].test.tsx`

## 架构决策记录

重要的架构决策应记录在项目的架构决策记录(ADR)中。请参阅`doc/adr`目录了解更多信息。

## 问题反馈

如果您发现任何问题或有任何建议，请通过GitHub Issues提交反馈。在创建新Issue之前，请先检查是否已存在相关的Issue。

## 行为准则

请保持尊重、包容和建设性的交流态度。我们希望共同创建一个友好、开放的社区环境。

感谢您的贡献！ 