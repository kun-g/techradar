import { useState, useEffect } from "react";
import type { Story } from "@ladle/react";
import RadarBlip from "./radar-blip";
import RadarBlips from "./radar-blips";
import { fetchRadarData } from "@/lib/data";
import { ringRatios } from "@/lib/data";
import type { Blip, Ring } from "@/lib/types";
import { toast } from "sonner";

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