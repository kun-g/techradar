# 使用Vercel Blob存储技术雷达数据

本文档介绍如何使用Vercel Blob来存储和管理技术雷达的JSON数据文件。

## 简介

技术雷达应用程序使用两种JSON文件来存储数据：
- `{radarId}_blips.json` - 存储雷达点数据
- `{radarId}_logs.json` - 存储变更历史数据

以前，这些文件存储在项目的`public/data`目录中。现在，我们添加了使用Vercel Blob存储服务的支持，这样可以：
1. 减少Git仓库大小
2. 提高数据访问速度
3. 支持更大的数据集
4. 更好的数据版本控制和备份

## 设置Vercel Blob

### 1. 安装依赖

```bash
npm install @vercel/blob
# 或
pnpm add @vercel/blob
# 或
yarn add @vercel/blob
```

### 2. 配置环境变量

你需要在`.env`文件或Vercel部署设置中添加以下环境变量：

```
BLOB_READ_WRITE_URL=您的Vercel Blob读写URL
```

要获取这些值：
1. 登录[Vercel仪表板](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击"Storage"选项卡
4. 选择"Blob"或创建一个新的Blob存储
5. 复制读写URL

### 3. 迁移现有数据

项目提供了一个迁移脚本，可以将现有的JSON文件从`public/data`目录迁移到Vercel Blob：

```bash
npm run migrate-to-blob
# 或
pnpm migrate-to-blob
# 或
yarn migrate-to-blob
```

## 使用Blob存储

### 自动使用

应用程序已配置为优先从Vercel Blob获取数据。如果失败，会回退到从`public/data`目录读取。

### 手动操作

可以使用以下API端点手动操作Blob数据：

#### 上传数据

```http
PUT /api/blob
Content-Type: application/json

{
  "radarId": "tech",
  "type": "blips",
  "content": [{"数据内容": "..."}]
}
```

#### 获取数据

```http
GET /api/blob?radarId=tech&type=blips
```

#### 列出所有Blob

```http
GET /api/blob?list=true
```

#### 删除数据

```http
DELETE /api/blob?radarId=tech&type=blips
```

## 技术实现

项目通过以下文件支持Blob存储：

1. `lib/blob-storage.ts` - 提供Blob存储的核心功能
2. `lib/data.ts` - 已更新以优先从Blob获取数据
3. `lib/notion.ts` - 已更新以同时将数据保存到Blob
4. `app/api/blob/route.ts` - 提供API端点操作Blob数据
5. `scripts/migrate-to-blob.ts` - 数据迁移脚本

## 排错

如果遇到问题：

- 确保环境变量已正确设置
- 检查网络请求日志是否有错误响应
- 使用API端点的响应来诊断问题 