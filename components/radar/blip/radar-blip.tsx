"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import type { Blip, Ring } from "@/lib/types"
import { cn } from "@/lib/utils"
import { calculateFreshness, getFreshnessOpacity } from "@/lib/data"

/**
 * 单个雷达图数据点组件
 * 
 * 该组件用于渲染雷达图上的单个技术数据点，支持悬浮效果和点击交互。
 */
interface RadarBlipProps {
  /** 要显示的技术数据点 */
  blip: Blip
  /** 雷达图环定义列表 */
  rings: Ring[]
  /** 点击数据点时的回调函数 */
  onBlipClick: (blip: Blip) => void
  /** 朝向 */
  factTo?: {
    x: number
    y: number
  }
  /** 是否可拖拽 */
  draggable?: boolean
  /** 拖拽结束后的回调函数 */
  onDragEnd?: (blip: Blip, newPosition: { x: number, y: number }) => void
}

// 外环相关配置常量
const RING_CONFIG = {
  // 外环宽度，单位为像素
  WIDTH: 4,
  // 外环与数据点的间距系数(相对于blipSize的倍数)
  SPACING: 2.5,
  // 悬停时外环宽度放大系数
  HOVER_SCALE: 1.5,
  // 部分圆弧时的端点处理
  LINE_CAP: "round" as "butt" | "round" | "square"
}

/**
 * 计算圆弧路径的函数
 * 
 * 此函数用于创建SVG路径命令，用于绘制圆弧
 * @param x - 圆心X坐标
 * @param y - 圆心Y坐标
 * @param radius - 圆弧半径
 * @param startAngle - 起始角度（度）
 * @param endAngle - 结束角度（度）
 * @returns SVG路径命令字符串
 */
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  // 如果起始角度等于结束角度，返回空路径
  if (startAngle === endAngle) {
    return "";
  }
  
  // 转换角度为弧度
  const startAngleRad = (startAngle - 90) * Math.PI / 180;
  const endAngleRad = (endAngle - 90) * Math.PI / 180;
  
  // 计算起点和终点坐标
  const start = {
    x: x + (radius * Math.cos(startAngleRad)),
    y: y + (radius * Math.sin(startAngleRad))
  };
  
  const end = {
    x: x + (radius * Math.cos(endAngleRad)),
    y: y + (radius * Math.sin(endAngleRad))
  };
  
  // 确定是否需要画大圆弧
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  // 构建路径
  const d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
  
  return d;
}

function getAngle(x1: number, y1: number, x2: number, y2: number) {
    // 向量 u：水平向右 (1, 0)
    // 向量 v：从 (x1, y1) 到 (x2, y2)
    const dx = x2 - x1;
    const dy = y2 - y1;
  
    // 计算角度（与水平向右的夹角，单位：弧度）
    const angleRad = Math.atan2(dy, dx); // 方向角
    const angleDeg = angleRad * (180 / Math.PI) + 90; // 转换为角度，这里加90度是因为0度在水平向上
  
    // 保证是正角度 [0, 360)
    return (angleDeg + 360) % 360;
  }


// TODO: rings -> CurrentRing
export default function RadarBlip({ blip, rings, onBlipClick, factTo, draggable = false, onDragEnd }: RadarBlipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { x, y } = blip.position || { x: 0, y: 0 }
  const blipId = blip.id.split("-")[0]
  const blipSize = 6
  
  // 设置动作值用于拖拽
  const motionX = useMotionValue(x)
  const motionY = useMotionValue(y)
  
  //  根据 Blip 的 movement 属性，计算弧线开始和结束的角度
  let arcStart = getAngle(x, y, factTo?.x || 0, factTo?.y || 0)
  let arcEnd = 360

  if (blip.movement === "moved-in") {
    arcEnd = arcStart + 30
    arcStart = arcStart - 30
  } else if (blip.movement === "moved-out") {
    arcEnd = arcStart + 30 + 180
    arcStart = arcStart - 30 + 180
  } else if (blip.movement === "unchanged") {
    arcStart = 0
    arcEnd = 0
  } else { // new
    arcStart = 0
    arcEnd = 360
  }
  // 获取当前blip所在的环的颜色
  const currentRing = rings.find((r) => r.id === blip.ring)
  
  // 计算外环宽度，悬停时应用放大效果
  const ringWidth = isHovered ? RING_CONFIG.WIDTH * RING_CONFIG.HOVER_SCALE : RING_CONFIG.WIDTH
  
  // 计算弧形路径
  const radius = blipSize * RING_CONFIG.SPACING + ringWidth/2
  const svgSize = (radius * 2) + ringWidth * 2 // 添加边距确保宽线条不被裁剪
  const center = svgSize / 2
  
  // 弧线路径
  const arcPath = describeArc(center, center, radius, arcStart, arcEnd)
  
  // 弧线是否为完整的圆
  const isFullCircle = arcEnd - arcStart >= 360
  
  // 计算基于更新日期的环颜色透明度
  let strokeOpacity = isHovered ? 0.8 : 0.5
  if (blip.updated) {
    const freshness = calculateFreshness(blip.updated)
    strokeOpacity = getFreshnessOpacity(freshness)
  }
  
  // 处理拖拽结束事件
  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd(blip, { 
        x: motionX.get(), 
        y: motionY.get() 
      })
    }
  }
  
  return (
    <motion.div
      key={blip.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: draggable ? 0 : x,
        top: draggable ? 0 : y,
        x: draggable ? motionX : 0,
        y: draggable ? motionY : 0,
        zIndex: isHovered || draggable ? 100 : 1,
      }}
      drag={draggable}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onBlipClick(blip)}
    >
      {/* 添加围绕的弧形 */}
      <svg 
        width={svgSize} 
        height={svgSize} 
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all"
        style={{
            display: isHovered ? "none" : "block" ,
        }}
      >
        {isFullCircle ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={currentRing?.stroke || "#666"}
            strokeWidth={ringWidth}
            opacity={strokeOpacity}
          />
        ) : arcPath ? (
          <path
            d={arcPath}
            fill="none"
            stroke={currentRing?.stroke || "#666"}
            strokeWidth={ringWidth}
            strokeLinecap={RING_CONFIG.LINE_CAP}
            opacity={strokeOpacity}
          />
        ) : null}
      </svg>
      
      <div
        className={cn(
          `w-${blipSize} h-${blipSize}`,
          `-translate-x-1/2 -translate-y-1/2`,
          "rounded-full cursor-pointer flex items-center justify-center text-white text-xs font-bold transition-all border-2 border-white shadow-md origin-center",
          `bg-${currentRing?.color}-500`,
          draggable ? "cursor-grab active:cursor-grabbing" : "",
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
            {currentRing?.name}
          </div>
          {blip.updated && (
            <div className="text-xs text-gray-500">
              更新: {new Date(blip.updated).toLocaleDateString()}
            </div>
          )}
          {draggable && (
            <div className="text-xs text-green-500 font-semibold">
              可拖动
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
} 