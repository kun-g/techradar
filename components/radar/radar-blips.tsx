"use client"

import type { Blip, Ring } from "@/lib/types"
import RadarBlip from "./radar-blip"

/**
 * 雷达图数据点组件
 * 
 * 该组件用于在雷达图上渲染技术数据点，支持不同的移动状态样式和交互效果。
 * 
 * @example
 * ```jsx
 * <RadarBlips 
 *   blips={techData.blips} 
 *   rings={techData.rings}
 *   size={600}
 *   onBlipClick={(blip) => console.log(`点击了: ${blip.name}`)}
 * />
 * ```
 */
interface RadarBlipsProps {
  /** 要显示的技术数据点 */
  blips: Blip[]
  /** 雷达图环定义 */
  rings: Ring[]
  /** 雷达图尺寸 */
  size: number
  /** 点击数据点时的回调函数 */
  onBlipClick: (blip: Blip) => void
}

// 绘制技术点组件
export default function RadarBlips({ 
  blips, 
  rings, 
  size, 
  onBlipClick 
}: RadarBlipsProps) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
    >
      {blips.map((blip) => (
        <RadarBlip
          key={blip.id}
          blip={blip}
          rings={rings}
          factTo={{ x: size/2, y: size/2 }}
          onBlipClick={onBlipClick}
        />
      ))}
    </div>
  )
} 