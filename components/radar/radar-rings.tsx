import React from "react"
import type { Ring } from "@/lib/types"
import { ringRatios } from "@/lib/data"

/**
 * 雷达图环组件
 * 
 * 该组件用于渲染技术雷达图的同心环，表示不同的采用阶段（如采用、评估等）。
 * 
 * @example
 * ```jsx
 * <RadarRings 
 *   rings={techData.rings} 
 *   center={300} 
 *   size={600} 
 * />
 * ```
 */
interface RadarRingsProps {
  /** 环定义数组，包含ID、名称和样式 */
  rings: Ring[]
  /** 雷达图中心点坐标 */
  center: number
  /** 雷达图总尺寸 */
  size: number
}

export default function RadarRings({ rings, center, size }: RadarRingsProps) {
  return (
    <>
      {/* Render rings with labels */}
      {rings.map((ring, index) => {
        const radius = center * ringRatios.slice(0, index + 1).reduce((sum, w) => sum + w, 0)

        return (
          <g key={ring.id}>
            {/* 绘制环 */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.stroke}
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* Add subtle ring labels */}
            <text
              x={center}
              y={center - radius + 15}
              textAnchor="middle"
              className="fill-gray-400 text-xs font-medium"
            >
              {ring.name}
            </text>
          </g>
        )
      })}
    </>
  )
} 