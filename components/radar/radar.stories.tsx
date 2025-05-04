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
const moveInBlip: Blip = {
  id: "2-move-in",
  name: "移动技术",
  quadrant: "techniques",
  ring: "trial",
  movement: "moved-in",
  description: "这是一个移动技术点的描述。",
  position: { x: 100, y: 100 },
};
const moveOutBlip: Blip = {
  id: "3-move-out",
  name: " 过时技术",
  quadrant: "techniques",
  ring: "hold",
  movement: "moved-out",
  description: "这是一个过时技术点的描述。",
  position: { x: 150, y: 150 },
};
const newBlip: Blip = {
  id: "4-new",
  name: "新技术",
  quadrant: "techniques",
  ring: "assess",
  movement: "new",
  description: "这是一个新技术点的描述。",
  position: { x: 200, y: 200 },
};

// 单个数据点的故事
export const NormalBlip: Story = () => {
  const handleBlipClick = (blip: Blip) => {
    toast.success(`点击了: ${blip.name}`);
  };

  return (
    <div className="relative" style={{ width: 100, height: 100 }}>
      <RadarBlip blip={mockBlip} rings={mockRings} onBlipClick={handleBlipClick} />
      <RadarBlip blip={moveInBlip} rings={mockRings} onBlipClick={handleBlipClick} />
      <RadarBlip blip={moveOutBlip} rings={mockRings} onBlipClick={handleBlipClick} />
      <RadarBlip blip={newBlip} rings={mockRings} onBlipClick={handleBlipClick} />
    </div>
  );
};

// 多个数据点的故事
export const MultipleBlips: Story = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const size = 600;

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRadarData();
      
      // 为每个点计算位置
      const positionedBlips = data.blips.map((blip, index) => {
        // 根据象限和环计算位置
        const quadrant = data.quadrants.find((q) => q.id === blip.quadrant);
        const ring = data.rings.find((r) => r.id === blip.ring);
        
        if (!quadrant || !ring) return blip;
        
        const quadrantIndex = quadrant.order;
        const ringIndex = ring.order;
        
        // 计算角度 (每个象限90度)
        const angle = (quadrantIndex * 90) + (Math.random() * 70 + 10); // 随机角度在象限内
        const angleRad = (angle * Math.PI) / 180;
        
        // 计算半径 (基于环的位置)
        const center = size / 2;
        const maxRadius = center * 0.9; // 最大半径为中心点的90%
        
        // 根据环的层级计算半径位置
        const radiusStart = ringIndex === 0 ? 0 : ringRatios.slice(0, ringIndex).reduce((sum, w) => sum + w, 0);
        const radiusEnd = ringRatios.slice(0, ringIndex + 1).reduce((sum, w) => sum + w, 0);
        
        // 在环的半径范围内随机选择一点
        const radiusRatio = radiusStart + (Math.random() * (radiusEnd - radiusStart));
        const radius = maxRadius * radiusRatio;
        
        // 转换为直角坐标
        const x = center + radius * Math.cos(angleRad);
        const y = center + radius * Math.sin(angleRad);
        
        return {
          ...blip,
          position: { x, y },
        };
      });
      
      setBlips(positionedBlips);
      setRings(data.rings);
    };
    
    loadData();
  }, []);

  const handleBlipClick = (blip: Blip) => {
    console.log(`点击了: ${blip.name}`);
    alert(`点击了: ${blip.name}`);
  };

  return (
    <div className="relative" style={{ width: size, height: size, border: '1px solid #eaeaea', borderRadius: '50%' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute top-0 left-0">
        {/* 绘制同心圆环 */}
        {rings.map((ring, index) => {
          const center = size / 2;
          const radius = center * ringRatios.slice(0, index + 1).reduce((sum, w) => sum + w, 0);

          return (
            <g key={ring.id}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.stroke}
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
              <text
                x={center}
                y={center - radius + 15}
                textAnchor="middle"
                className="fill-gray-400 text-xs font-medium"
              >
                {ring.name}
              </text>
            </g>
          );
        })}
        
        {/* 绘制象限分割线 */}
        <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="#eaeaea" strokeWidth="1" />
        <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="#eaeaea" strokeWidth="1" />
      </svg>
      
      {blips.length > 0 && (
        <RadarBlips 
          blips={blips} 
          rings={rings} 
          size={size} 
          onBlipClick={handleBlipClick} 
        />
      )}
    </div>
  );
};

MultipleBlips.storyName = "完整雷达图"; 