import React from "react"
import type { Ring } from "@/lib/types"
import { ringRatios } from "@/lib/data"

interface RadarRingsProps {
  rings: Ring[]
  center: number
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