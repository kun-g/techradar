import type { Story } from "@ladle/react";
import { useState, useEffect } from "react";
import RadarBlips from "./radar-blips";
import { fetchRadarData } from "@/lib/data";
import { ringRatios } from "@/lib/data";
import type { Blip, Ring, Quadrant } from "@/lib/types";

const RadarDemo = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [quadrants, setQuadrants] = useState<Quadrant[]>([]);
  const size = 650;
  const center = size / 2;

  // 获取雷达图数据
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRadarData();
      
      // 为每个blip计算位置
      const positionedBlips = data.blips.map((blip) => {
        const quadrant = data.quadrants.find((q) => q.id === blip.quadrant);
        const ring = data.rings.find((r) => r.id === blip.ring);
        
        if (!quadrant || !ring) return blip;
        
        const quadrantIndex = quadrant.order;
        const ringIndex = ring.order;
        
        // 计算角度 (每个象限90度)
        const angle = (quadrantIndex * 90) + (Math.random() * 70 + 10);
        const angleRad = (angle * Math.PI) / 180;
        
        // 计算半径 (基于环的位置)
        const maxRadius = center * 0.9;
        
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
      setQuadrants(data.quadrants);
    };
    
    loadData();
  }, [center]);

  const handleBlipClick = (blip: Blip) => {
    console.log(`点击了: ${blip.name}`);
    alert(`点击了技术: ${blip.name}\n环: ${rings.find(r => r.id === blip.ring)?.name}\n象限: ${quadrants.find(q => q.id === blip.quadrant)?.name}`);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold">技术雷达图</h1>
      <p className="text-center max-w-2xl text-gray-600">
        本雷达图展示了各种技术的采用状态，帮助团队了解哪些技术值得关注和使用。
        点击雷达图上的点可以查看详细信息。
      </p>
      
      <div className="relative" style={{ width: size, height: size, border: '1px solid #eaeaea', borderRadius: '50%', background: '#fafafa' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute top-0 left-0">
          {/* 绘制同心圆环 */}
          {rings.map((ring, index) => {
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
                  className="fill-gray-500 text-xs font-medium"
                >
                  {ring.name}
                </text>
              </g>
            );
          })}
          
          {/* 绘制象限分割线 */}
          <line x1={center} y1="0" x2={center} y2={size} stroke="#eaeaea" strokeWidth="1" />
          <line x1="0" y1={center} x2={size} y2={center} stroke="#eaeaea" strokeWidth="1" />
          
          {/* 绘制象限标签 */}
          {quadrants.map((quadrant) => {
            let x = 0, y = 0;
            
            // 根据象限位置放置标签
            switch (quadrant.order) {
              case 0: // 右上
                x = center + center * 0.5;
                y = center - center * 0.5;
                break;
              case 1: // 左上
                x = center - center * 0.5;
                y = center - center * 0.5;
                break;
              case 2: // 左下
                x = center - center * 0.5;
                y = center + center * 0.5;
                break;
              case 3: // 右下
                x = center + center * 0.5;
                y = center + center * 0.5;
                break;
            }
            
            return (
              <text 
                key={quadrant.id}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-gray-700 text-base font-bold"
              >
                {quadrant.name}
              </text>
            );
          })}
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
      
      <div className="flex gap-6 mt-4 justify-center">
        {rings.map((ring) => (
          <div key={ring.id} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: ring.stroke }}
            />
            <span>{ring.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Index: Story = () => <RadarDemo />;
Index.storyName = "技术雷达图示例"; 