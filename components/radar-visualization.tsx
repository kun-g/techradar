"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { Blip, Quadrant, Ring } from "@/lib/types"
import { cn } from "@/lib/utils"
import { calculateOptimalPositions, BlipPosition } from "@/lib/radar_distribution"

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
  const [hoveredBlip, setHoveredBlip] = useState<string | null>(null)
  const [blipPositions, setBlipPositions] = useState<BlipPosition[]>([])

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

  // Get color for a ring
  const getRingColor = (ringId: string) => {
    switch (ringId) {
      case "adopt":
        return "bg-green-500"
      case "trial":
        return "bg-blue-500"
      case "assess":
        return "bg-yellow-500"
      case "hold":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Calculate optimal positions for all blips using a holistic approach
  useEffect(() => {
    if (size <= 0 || blips.length === 0) return

    // Apply the holistic positioning algorithm
    const optimalPositions = calculateOptimalPositions(blips, quadrants, rings, center)
    setBlipPositions(optimalPositions)
  }, [blips, size, center, quadrants, rings])

  // Get blip position from the calculated positions
  const getBlipPosition = (blip: Blip) => {
    const position = blipPositions.find((p) => p.id === blip.id)
    if (position) {
      return { x: position.x, y: position.y }
    }

    // Fallback to a simple calculation if position not found
    const quadrantIndex = quadrants.findIndex((q) => q.id === blip.quadrant)
    const ringIndex = rings.findIndex((r) => r.id === blip.ring)

    const angle = (quadrantIndex * Math.PI) / 2 + Math.PI / 4
    const ringWidth = center / rings.length
    const radius = ringWidth * (ringIndex + 0.5)

    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  if (size <= 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {/* Render rings with labels */}
        {rings.map((ring, index) => {
          const ringWidth = center / rings.length
          const radius = ringWidth * (index + 1)

          return (
            <g key={ring.id}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={
                  ring.id === "adopt"
                    ? "#10b981"
                    : ring.id === "trial"
                      ? "#3b82f6"
                      : ring.id === "assess"
                        ? "#eab308"
                        : "#ef4444"
                }
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
            const ringWidth = center / rings.length
            const radius = ringWidth * (rings.length - index)

            return (
              <g key={`debug-${ring.id}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={
                    ring.id === "adopt"
                      ? "rgba(16, 185, 129, 0.7)"
                      : ring.id === "trial"
                        ? "rgba(59, 130, 246, 0.7)"
                        : ring.id === "assess"
                          ? "rgba(234, 179, 8, 0.7)"
                          : "rgba(239, 68, 68, 0.7)"
                  }
                  strokeWidth="4"
                  strokeDasharray="4 4"
                />
                <text
                  x={center + 5}
                  y={center - radius + 5}
                  className={`fill-${
                    ring.id === "adopt"
                      ? "green"
                      : ring.id === "trial"
                        ? "blue"
                        : ring.id === "assess"
                          ? "yellow"
                          : "red"
                  }-600 text-xs font-bold`}
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

      {/* Render blips */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size, height: size }}
      >
        {blips.map((blip) => {
          const { x, y } = getBlipPosition(blip)
          const blipId = blip.id.split("-")[0]

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
                  "w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-white text-xs font-bold transition-all border-2 border-white shadow-md",
                  getRingColor(blip.ring),
                  hoveredBlip === blip.id ? "scale-150 z-10" : "",
                )}
              >
                {blipId}
              </div>

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
    </div>
  )
}
