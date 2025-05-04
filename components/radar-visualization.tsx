"use client"

import { useRef, useEffect, useState } from "react"
import type { Blip, Quadrant, Ring } from "@/lib/types"
import { updateBlipPositions } from "@/lib/radar_distribution"
import RadarBlips from "./radar/radar-blips"
import RadarRings from "./radar/radar-rings"

interface RadarVisualizationProps {
  blips: Blip[]
  quadrants: Quadrant[]
  rings: Ring[]
  onBlipClick: (blip: Blip) => void
  showDebugMode?: boolean
}

export default function RadarVisualization({
  blips,
  quadrants,
  rings,
  onBlipClick,
  ...props
}: RadarVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 }) // Default size for initial render

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        // Only update if dimensions have actually changed
        if (width !== dimensions.width || height !== dimensions.height) {
          setDimensions({
            width,
            height,
          })
        }
      }
    }

    updateDimensions()

    // Set up resize observer for more reliable dimension tracking
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Fallback to window resize event
    window.addEventListener("resize", updateDimensions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  const size = Math.max(100, Math.min(dimensions.width, dimensions.height) - 40) // Ensure minimum size
  const center = size / 2

  useEffect(() => {
    if (size <= 0 || blips.length === 0) return

    updateBlipPositions(blips, quadrants, rings, center)
  }, [blips, size, center, quadrants, rings])

  if (size <= 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* 绘制雷达图 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {/* 使用拆分出的环形组件 */}
        <RadarRings 
          rings={rings} 
          center={center} 
          size={size} 
        />

        {/* Render quadrant dividers */}
        <line x1={center} y1="0" x2={center} y2={size} stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1={center} x2={size} y2={center} stroke="#e5e7eb" strokeWidth="1" />

        {/* Render quadrant labels */}
        {quadrants.map((quadrant, index) => {
          const angle = (index * Math.PI) / 2 + Math.PI / 4
          const labelRadius = center * 0.85
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)

          return (
            <text
              key={quadrant.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-600 text-sm font-medium"
            >
              {quadrant.name}
            </text>
          )
        })}
      </svg>

      {/* 绘制技术点 */}
      <RadarBlips 
        blips={blips} 
        rings={rings} 
        size={size} 
        onBlipClick={onBlipClick} 
      />
    </div>
  )
}
