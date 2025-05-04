# Ladle 组件开发指南

[Ladle](https://ladle.dev/) 是一个轻量级的 React 组件开发和测试工具，类似于 Storybook，但启动速度更快、配置更简单。本指南将帮助您使用 Ladle 进行雷达图组件的开发和测试。

## 目录

- [快速开始](#快速开始)
- [故事文件](#故事文件)
- [雷达图组件](#雷达图组件)
- [组件交互](#组件交互)
- [高级配置](#高级配置)
- [故障排除](#故障排除)

## 快速开始

### 安装

Ladle 已经配置在项目中，您可以通过以下命令启动：

```bash
# 启动开发服务器
pnpm ladle:serve

# 构建静态站点
pnpm ladle:build

# 预览构建的静态站点
pnpm ladle preview
```

### 访问组件库

启动服务器后，在浏览器中访问 [http://localhost:61001/](http://localhost:61001/) 查看组件库。

## 故事文件

Ladle 使用 `.stories.tsx` 文件来定义组件的不同状态和变体。

### 基本结构

```tsx
import type { Story } from "@ladle/react";
import MyComponent from "./my-component";

// 最简单的故事
export const Basic: Story = () => <MyComponent />;

// 带有参数的故事
export const WithProps: Story = () => <MyComponent title="自定义标题" />;

// 带有控制的故事
export const Interactive: Story = () => {
  const [value, setValue] = useState("");
  return (
    <MyComponent 
      value={value} 
      onChange={(newValue) => setValue(newValue)} 
    />
  );
};

// 设置故事名称
Basic.storyName = "基础示例";
```

### 故事命名

每个导出的故事函数将显示在 Ladle UI 中。您可以使用 `storyName` 属性为故事提供更友好的名称。

## 雷达图组件

我们的雷达图组件具有多种变体和特殊功能，可以通过 Ladle 进行测试和展示。

### 雷达数据点 (RadarBlip)

```tsx
// components/radar/radar-blip.stories.tsx
import type { Story } from "@ladle/react";
import RadarBlip from "./radar-blip";
import { mockRings } from "@/lib/data";

export const Basic: Story = () => (
  <div style={{ width: 200, height: 200, position: "relative" }}>
    <RadarBlip 
      blip={{
        id: "1-test",
        name: "测试技术",
        quadrant: "techniques",
        ring: "adopt",
        description: "这是测试描述",
        position: { x: 100, y: 100 }
      }}
      rings={mockRings}
      onBlipClick={(blip) => console.log("点击了:", blip.name)}
    />
  </div>
);

// 带有指向的数据点
export const WithPointing: Story = () => (
  <div style={{ width: 200, height: 200, position: "relative" }}>
    <RadarBlip 
      blip={{
        id: "2-pointing",
        name: "指向技术",
        quadrant: "techniques",
        ring: "trial",
        description: "这是一个带有指向的数据点",
        position: { x: 100, y: 100 }
      }}
      rings={mockRings}
      onBlipClick={(blip) => console.log("点击了:", blip.name)}
      factTo={{ x: 150, y: 50 }} // 指定指向某个坐标
    />
  </div>
);

// 不同状态的数据点
export const DifferentStates: Story = () => (
  <div style={{ width: 400, height: 100, position: "relative" }}>
    {["new", "moved-in", "moved-out", "unchanged"].map((movement, index) => (
      <RadarBlip 
        key={movement}
        blip={{
          id: `${index+1}-${movement}`,
          name: `${movement} 状态`,
          quadrant: "techniques",
          ring: "adopt",
          description: `这是 ${movement} 状态的数据点`,
          movement: movement as any,
          position: { x: 50 + index * 100, y: 50 }
        }}
        rings={mockRings}
        onBlipClick={(blip) => console.log("点击了:", blip.name)}
      />
    ))}
  </div>
);
```

### 完整雷达图 (RadarBlips)

```tsx
// components/radar/radar.stories.tsx
import type { Story } from "@ladle/react";
import { useState, useEffect } from "react";
import RadarBlips from "./radar-blips";
import { fetchRadarData } from "@/lib/data";

export const FullRadar: Story = () => {
  const [data, setData] = useState({ blips: [], rings: [] });
  const size = 600;

  useEffect(() => {
    const loadData = async () => {
      const radarData = await fetchRadarData();
      setData(radarData);
    };
    loadData();
  }, []);

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        position: "relative",
        border: "1px solid #eaeaea",
        borderRadius: "50%" 
      }}
    >
      {data.blips.length > 0 && (
        <RadarBlips 
          blips={data.blips} 
          rings={data.rings} 
          size={size}
          onBlipClick={(blip) => alert(`点击了: ${blip.name}`)}
        />
      )}
    </div>
  );
};
```

## 组件交互

### 点击和悬停效果

雷达图组件内置了点击和悬停效果：

- **点击**：触发 `onBlipClick` 回调函数，可以用于显示数据点详情
- **悬停**：自动显示数据点的基本信息和状态

### Toast 通知

Ladle 中配置了 Sonner 的 Toaster 组件，您可以在 story 中使用 toast 通知：

```tsx
import { toast } from "sonner";

export const WithToast: Story = () => (
  <button onClick={() => toast.success("操作成功！")}>
    显示 Toast
  </button>
);
```

## 高级配置

### Ladle 配置文件

Ladle 的配置在 `.ladle/config.mjs` 文件中：

```js
export default {
  stories: "components/**/*.stories.{js,jsx,ts,tsx}",
  port: 61000,
  addons: {
    a11y: { enabled: true },
    action: { enabled: true },
    ladle: { enabled: true },
    mode: { enabled: true },
    rtl: { enabled: true },
    source: { enabled: true },
    theme: { enabled: true },
    width: { enabled: true },
  },
};
```

### 全局提供者

在 `.ladle/components.tsx` 文件中配置了全局提供者组件：

```tsx
import React from "react";
import type { GlobalProvider } from "@ladle/react";
import { Toaster } from "sonner";
import "../styles/globals.css";

export const Provider: GlobalProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};
```

## 故障排除

### 常见问题

1. **组件未显示**
   - 确保正确导出了 Story 函数
   - 检查组件是否有错误

2. **样式问题**
   - 确保全局样式已正确导入
   - 检查 Tailwind CSS 类名是否正确

3. **Toast 不工作**
   - 确保 `.ladle/components.tsx` 中已配置 Toaster 组件

### 构建问题

如果在构建静态站点时遇到问题，尝试清除缓存后重新构建：

```bash
rm -rf .ladle
pnpm ladle:build
```

---

希望本指南能帮助您有效地使用 Ladle 开发和测试雷达图组件。如有疑问，请参考 [Ladle 官方文档](https://ladle.dev/)。 