import { useState, useEffect } from "react";
import type { Story } from "@ladle/react";
import RadarBlip from "./blip/radar-blip";
import { BlipDetailModal } from "./blip/detail";
import type { Blip, Ring, RecordChangeLog } from "@/lib/types";
import { toast } from "sonner";
import { calculateFreshness, getFreshnessOpacity } from "@/lib/data";

// 模拟数据
const mockRings: Ring[] = [
  { id: "adopt", name: "采用", order: 0, color: "green", stroke: "rgba(16, 185, 129, 0.7)" },
  { id: "trial", name: "试用", order: 1, color: "blue", stroke: "rgba(59, 130, 246, 0.7)" },
  { id: "assess", name: "评估", order: 2, color: "yellow", stroke: "rgba(234, 179, 8, 0.7)" },
  { id: "hold", name: "暂缓", order: 3, color: "red", stroke: "rgba(239, 68, 68, 0.7)" },
];

const mockBlip: Blip = {
  id: "1-test",
  name: "测试技术",
  quadrant: "techniques",
  ring: "adopt",
  description: "这是一个测试技术点的描述。",
  position: { x: 50, y: 50 },
  last_change: "2023-01-01",
};

// 数据点的故事
export const DifferentBlips: Story = () => {
  const handleBlipClick = (blip: Blip) => {
    toast.success(`点击了: ${blip.name}`);
  };

  const [position, setPosition] = useState({ x: 200, y: 200 });
  
  const handleDragEnd = (blip: Blip, newPosition: { x: number, y: number }) => {
    setPosition(newPosition);
    toast.info(`拖拽结束: ${blip.name} 位置: x=${newPosition.x.toFixed(0)}, y=${newPosition.y.toFixed(0)}`);
  };

  const examples = [
    { id: "入", name: "MovedIn", movement: "moved-in" },
    { id: "出", name: "MovedOut", movement: "moved-out" },
    { id: "定", name: "Unchanged", movement: "unchanged" },
    { id: "新", name: "New", movement: "new" },
    { id: "点", name: "可拖拽", movement: "unchanged" },
  ];
  const factTo = position;

  return (
    <div className="relative" style={{ width: 400, height: 400 }}>
      {examples.map((example, index) => (
        <RadarBlip
          key={example.id}
          blip={{
            ...mockBlip,
            id: `${example.id}-${example.movement}`,
            name: example.name,
            movement: example.movement as "moved-in" | "moved-out" | "unchanged" | "new",
            position: example.id === "点" ? position : { x: 50 + index * 80, y: 50 },
          }}
          factTo={factTo}
          rings={mockRings}
          onBlipClick={handleBlipClick}
          draggable={example.id === "点"}
          onDragEnd={example.id === "点" ? handleDragEnd : undefined}
        />
      ))}
    </div>
  );
};
DifferentBlips.storyName = "雷达点状态";

// 新鲜度数据点故事
export const FreshnessBlips: Story = () => {
  const handleBlipClick = (blip: Blip) => {
    toast.success(`点击了: ${blip.name}, 更新日期: ${blip.updated}`);
  };

  // 创建不同新鲜度的数据日期
  const now = new Date();
  const getDateBefore = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  // 不同新鲜度样本
  const freshnessExamples = [
    { id: "1", name: "今天更新", days: 0 },
    { id: "2", name: "3天前更新", days: 3 },
    { id: "3", name: "7天前更新", days: 7 },
    { id: "4", name: "15天前更新", days: 15 },
    { id: "5", name: "30天前更新", days: 30 },
    { id: "6", name: "60天前更新", days: 60 },
  ];

  // 线性计算新鲜度的函数（用于对比展示）
  const calculateLinearFreshness = (date: string, maxAgeDays: number = 30): number => {
    if (!date) return 1;
    const updateDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - updateDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return Math.min(Math.max(diffDays / maxAgeDays, 0), 1);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 指数衰减数据点展示 */}
      <div>
        <h3 className="font-bold text-base mb-2">指数衰减（当前实现）</h3>
        <div className="relative bg-gray-50 p-4 rounded-md" style={{ width: 600, height: 160 }}>
          {freshnessExamples.map((example, index) => {
            const updated = getDateBefore(example.days);
            const freshness = calculateFreshness(updated);
            
            return (
              <RadarBlip
                key={example.id}
                blip={{
                  ...mockBlip,
                  id: `${example.id}-freshness`,
                  name: example.name,
                  updated: updated,
                  position: { x: 80 + index * 100, y: 80 },
                }}
                rings={mockRings}
                onBlipClick={handleBlipClick}
              />
            );
          })}
        </div>
      </div>
      
      {/* 线性衰减对比（仅用于演示） */}
      <div>
        <h3 className="font-bold text-base mb-2">线性衰减（对比用）</h3>
        <div className="relative bg-gray-50 p-4 rounded-md" style={{ width: 600, height: 160 }}>
          {freshnessExamples.map((example, index) => {
            const updated = getDateBefore(example.days);
            // 使用线性计算
            const linearFreshness = calculateLinearFreshness(updated);
            const opacity = getFreshnessOpacity(linearFreshness);
            
            return (
              <div key={example.id} style={{ position: 'absolute', left: 80 + index * 100, top: 80 }}>
                <svg width="30" height="30" className="absolute -translate-x-1/2 -translate-y-1/2">
                  <circle 
                    cx="15" 
                    cy="15" 
                    r="12" 
                    fill="none" 
                    stroke={mockRings[0].stroke} 
                    strokeWidth="2" 
                    opacity={opacity} 
                  />
                </svg>
                <div 
                  className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white text-xs font-bold bg-green-500 border-2 border-white shadow-md"
                  style={{ position: 'absolute' }}
                >
                  {example.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 图例说明 */}
      <div className="bg-white p-4 rounded-md shadow-sm text-sm">
        <h3 className="font-bold text-base mb-2">数据新鲜度对比</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 text-left">数据</th>
                <th className="py-2 text-center">天数</th>
                <th className="py-2 text-center">指数衰减透明度</th>
                <th className="py-2 text-center">线性衰减透明度</th>
                <th className="py-2 text-center">视觉效果对比</th>
              </tr>
            </thead>
            <tbody>
              {freshnessExamples.map((example) => {
                const updated = getDateBefore(example.days);
                // 指数衰减计算
                const expFreshness = calculateFreshness(updated);
                const expOpacity = getFreshnessOpacity(expFreshness).toFixed(2);
                // 线性衰减计算
                const linearFreshness = calculateLinearFreshness(updated);
                const linearOpacity = getFreshnessOpacity(linearFreshness).toFixed(2);
                
                return (
                  <tr key={example.id} className="border-t">
                    <td className="py-2">{example.name}</td>
                    <td className="py-2 text-center">{example.days}天</td>
                    <td className="py-2 text-center">{expOpacity}</td>
                    <td className="py-2 text-center">{linearOpacity}</td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center">
                          <svg width="16" height="16" className="inline-block">
                            <circle cx="8" cy="8" r="6" fill="none" stroke="#22c55e" strokeWidth="2" opacity={expOpacity} />
                          </svg>
                          <span className="ml-1">指数</span>
                        </div>
                        <div className="flex items-center">
                          <svg width="16" height="16" className="inline-block">
                            <circle cx="8" cy="8" r="6" fill="none" stroke="#22c55e" strokeWidth="2" opacity={linearOpacity} />
                          </svg>
                          <span className="ml-1">线性</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-gray-600">
          注：指数衰减使得新鲜度在数据更新后初期下降更快，随后趋于平缓，更符合数据价值随时间的实际变化规律。
        </p>
      </div>
    </div>
  );
};
FreshnessBlips.storyName = "数据新鲜度";

// BlipDetailModal 故事
export const DetailModal: Story = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedBlip, setSelectedBlip] = useState<Blip | null>(null);
  
  // 模拟象限数据
  const mockQuadrants = [
    { id: "techniques", name: "技术", order: 0 },
    { id: "platforms", name: "平台", order: 1 },
    { id: "tools", name: "工具", order: 2 },
    { id: "languages", name: "语言与框架", order: 3 },
  ];
  
  // 模拟历史记录
  const createMockHistory = (): RecordChangeLog[] => [
    {
      id: "hist-1",
      blipId: "detail-demo",
      previousRecord: "",
      name: "React Native",
      ring: "trial",
      description: "React Native 是 Facebook 开发的一款开源跨平台移动应用开发框架。\n\n它允许开发者使用 JavaScript 和 React 来开发 iOS 和 Android 应用，同时保持接近原生的性能和外观。",
      created: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "hist-2",
      blipId: "detail-demo",
      previousRecord: "hist-1",
      name: "React Native",
      ring: "adopt",
      description: "React Native 是 Facebook 开发的一款开源跨平台移动应用开发框架。\n\n它允许开发者使用 JavaScript 和 React 来开发 iOS 和 Android 应用，同时保持接近原生的性能和外观。\n\n### 核心优势\n- 跨平台：一套代码同时适用于 iOS 和 Android\n- 热重载：实时查看代码变更结果\n- JavaScript 驱动：使用熟悉的 Web 技术栈",
      created: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // 创建详细的样例 blip
  const detailBlip: Blip = {
    id: "detail-demo",
    name: "React Native",
    quadrant: "languages",
    ring: "adopt",
    description: "React Native 是 Facebook 开发的一款开源跨平台移动应用开发框架。\n\n它允许开发者使用 JavaScript 和 React 来开发 iOS 和 Android 应用，同时保持接近原生的性能和外观。\n\n### 核心优势\n- 跨平台：一套代码同时适用于 iOS 和 Android\n- 热重载：实时查看代码变更结果\n- JavaScript 驱动：使用熟悉的 Web 技术栈\n- 原生组件：直接使用平台原生 UI 组件\n- 活跃社区：大量第三方库和插件\n\n### 适用场景\n- 需要同时开发 iOS 和 Android 应用\n- 团队已有 React/JavaScript 经验\n- 对性能有一定要求但非极致\n- 快速迭代和原型验证",
    position: { x: 100, y: 100 },
    last_change: "2023-05-01",
    history: createMockHistory()
  };
  
  useEffect(() => {
    // 初始化时设置样例 blip
    setSelectedBlip(detailBlip);
  }, []);
  
  const handleCloseModal = () => {
    setIsOpen(false);
    // 2秒后重新打开，便于查看演示
    setTimeout(() => {
      setIsOpen(true);
    }, 2000);
  };
  
  const handleDataUpdate = (blips: any) => {
    console.log("数据已更新:", blips);
    // 在实际应用中，这里会更新整个雷达的数据
  };
  
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-xl font-bold">详情窗口演示</h3>
      <p className="text-gray-600">
        下面展示了技术雷达项目的详情窗口，包括查看内容、历史记录和编辑功能。
        <br />
        <span className="text-sm">(窗口会在关闭后2秒重新打开，以便于演示)</span>
      </p>
      
      {isOpen && (
        <BlipDetailModal
          blip={selectedBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          radarId="radar-demo"
          onClose={handleCloseModal}
          onDataUpdate={handleDataUpdate}
          availableTags={[]}
        />
      )}
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">其他操作按钮演示：</h4>
        <div className="flex gap-2">
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => setIsOpen(true)}
          >
            打开详情窗口
          </button>
        </div>
      </div>
    </div>
  );
};

DetailModal.storyName = "详情窗口";