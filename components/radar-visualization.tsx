"use client"

import { useRef, useEffect, useState } from "react"
import type { Blip, Quadrant, Ring } from "@/lib/types"
import { updateBlipPositions } from "@/lib/radar_distribution"
import { ringRatios } from "@/lib/data"
import RadarBlips from "./radar-blips"

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

    // Initial update
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

        {/* Debug mode: show ring boundaries */}
        {props.showDebugMode &&
          rings.map((ring, index) => {
            const radius = center * ringRatios.slice(0, index + 1).reduce((sum, w) => sum + w, 0)

            return (
              <g key={`debug-${ring.id}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.stroke}
                  strokeWidth="4"
                  strokeDasharray="4 4"
                />
                <text
                  x={center + 5}
                  y={center - radius + 5}
                  className={`fill-${ring.color}-600 text-xs font-bold`}
                >
                  {ring.name} boundary
                </text>
              </g>
            )
          })}

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
