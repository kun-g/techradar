"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Blip, Ring } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RadarBlipsProps {
  blips: Blip[]
  rings: Ring[]
  size: number
  onBlipClick: (blip: Blip) => void
}

// 绘制技术点组件
export default function RadarBlips({ 
  blips, 
  rings, 
  size, 
  onBlipClick 
}: RadarBlipsProps) {
  const [hoveredBlip, setHoveredBlip] = useState<string | null>(null)

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
    >
      {blips.map((blip) => {
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
              zIndex: hoveredBlip === blip.id ? 100 : 1,
            }}
            onMouseEnter={() => setHoveredBlip(blip.id)}
            onMouseLeave={() => setHoveredBlip(null)}
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
                transform: hoveredBlip === blip.id ? "scale(1.5) translate(-25%, -25%)" : "",
              }}
            >
              {blipId}
            </div>

            {/* 悬浮显示blip信息 */}
            {hoveredBlip === blip.id && (
              <div className="absolute left-1/2 -translate-x-1/2 top-7 bg-white shadow-lg rounded-md px-3 py-2 text-xs whitespace-nowrap z-[200] min-w-[120px] pointer-events-none">
                <div className="font-bold">{blip.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {rings.find((r) => r.id === blip.ring)?.name}
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
} 