# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # ESLint 检查
npm test             # 运行所有测试
npm test -- --watch  # 监听模式
npm test -- path/to/test.ts  # 运行单个测试文件
npm run ladle:serve  # 启动组件开发服务器 (端口 61001)
npm run migrate-to-sqlite  # 从 JSON 导入数据到 SQLite
```

## 架构概览

这是一个 Next.js 15 + React 19 的技术雷达可视化应用，数据存储在本地 SQLite，支持 AI 自动分类。

### 数据流

```
SQLite (data/techradar.db) ← /api/radar/sync → 前端渲染
```

- 新增技术点通过 `/api/radar/blip` 创建 Log 记录，可选 AI 分类（DeepSeek）
- 同步操作遍历未处理的 Log，创建/更新 Blip（全部在 SQLite 中完成）
- 前端通过 `/api/radar/data` 获取雷达数据

### 核心模块

- **`lib/db.ts`** - SQLite 数据库连接（better-sqlite3）、表初始化（WAL 模式）
- **`lib/sqlite-db.ts`** - CRUD 操作层，输出 PascalCase DTO 兼容前端
- **`lib/radar-service.ts`** - 业务逻辑：同步数据库、添加 Log、创建编辑记录
- **`lib/data.ts`** - 雷达配置（四环: Adopt/Trial/Assess/Hold，环宽比例 0.4/0.3/0.2/0.1），新鲜度衰减计算，点移动状态计算
- **`lib/radar_distribution.ts`** - 点位分布算法，使用确定性随机（seededRandom）和黄金比分割保证同一 ID 位置一致
- **`lib/ai-classifier.ts`** - DeepSeek + Langfuse 集成，自动象限分类
- **`lib/auth.ts`** - Zustand 持久化管理员状态（localStorage 键: `admin-auth`）

### 认证机制

管理员操作（添加/编辑/同步）受 `middleware.ts` 保护，检查请求头 `X-Admin-Auth: true`。前端通过 `/api/admin/verify` 验证密钥，Zustand 管理状态。

### 多雷达支持

`data/radar_configs.json` 定义多个雷达配置（技术雷达、个人成长雷达等），每个配置包含象限定义、标签列表和 AI 分类 Prompt ID。

### UI 组件

- 基于 Radix UI + shadcn/ui 组件库（`components/ui/`）
- 雷达可视化为自定义 SVG（`components/radar-visualization.tsx`）
- 路径别名: `@/*` 映射到项目根目录

## 环境变量

```bash
DEEPSEEK_API_KEY=    # DeepSeek API 密钥
ADMIN_KEY=           # 管理员密钥（不要用 NEXT_PUBLIC_ 前缀）
```

## 关键类型

核心类型定义在 `lib/types.ts`：`Blip`（技术点）、`RecordChangeLog`（变更日志）、`Quadrant`（象限）、`Ring`（采纳环）、`RadarData`（完整雷达数据）、`RadarConfig`（雷达配置）。

## 数据库

- SQLite 文件: `data/techradar.db`（已在 .gitignore 中忽略）
- 表: `blips`（技术点）和 `logs`（变更日志）
- ID 在每个 radar_id 内唯一，schema 使用 `UNIQUE(radar_id, id)` 约束
- 迁移脚本: `scripts/migrate-to-sqlite.ts`，从 `public/data/*.json` 导入

## 注意事项

- `next.config.mjs` 中 ESLint 和 TypeScript 构建错误被忽略
- 测试使用 Jest + jsdom + Testing Library，配置在 `jest.config.js`
- Ladle stories 文件以 `.stories.tsx` 结尾，放在组件同级目录
