"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Blip, Ring } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * 单个雷达图数据点组件
 * 
 * 该组件用于渲染雷达图上的单个技术数据点，支持悬浮效果和点击交互。
 * 
 * @example
 * ```jsx
 * <RadarBlip 
 *   blip={techBlip} 
 *   ring={ringInfo}
 *   onBlipClick={() => handleBlipClick(techBlip)}
 * />
 * ```
 */
interface RadarBlipProps {
  /** 要显示的技术数据点 */
  blip: Blip
  /** 雷达图环定义列表 */
  rings: Ring[]
  /** 点击数据点时的回调函数 */
  onBlipClick: (blip: Blip) => void
}

export default function RadarBlip({ 
  blip, 
  rings, 
  onBlipClick 
}: RadarBlipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { x, y } = blip.position || { x: 0, y: 0 }
  const blipId = blip.id.split("-")[0]
  const blipSize = 6
  
  return (
    <motion.div
      key={blip.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: x,
        top: y,
        zIndex: isHovered ? 100 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onBlipClick(blip)}
    >
      <div
        className={cn(
          `w-${blipSize} h-${blipSize}`,
          `-translate-x-1/2 -translate-y-1/2`,
          "rounded-full cursor-pointer flex items-center justify-center text-white text-xs font-bold transition-all border-2 border-white shadow-md origin-center",
          `bg-${rings.find((r) => r.id === blip.ring)?.color}-500`,
        )}
        style={{
          transform: isHovered ? "scale(1.5) translate(-25%, -25%)" : "",
        }}
      >
        {blipId}
      </div>

      {/* 悬浮显示blip信息 */}
      {isHovered && (
        <div className="absolute left-1/2 -translate-x-1/2 top-7 bg-white shadow-lg rounded-md px-3 py-2 text-xs whitespace-nowrap z-[200] min-w-[120px] pointer-events-none">
          <div className="font-bold">{blip.name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {rings.find((r) => r.id === blip.ring)?.name}
          </div>
        </div>
      )}
    </motion.div>
  )
} 