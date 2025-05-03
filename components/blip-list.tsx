"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Blip, Quadrant, Ring } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BlipListProps {
  blips: Blip[]
  quadrants: Quadrant[]
  rings: Ring[]
  onBlipClick: (blip: Blip) => void
}

export default function BlipList({ blips, quadrants, rings, onBlipClick }: BlipListProps) {
  const [expandedQuadrants, setExpandedQuadrants] = useState<string[]>(quadrants.map((q) => q.id))

  const toggleQuadrant = (quadrantId: string) => {
    setExpandedQuadrants((prev) =>
      prev.includes(quadrantId) ? prev.filter((id) => id !== quadrantId) : [...prev, quadrantId],
    )
  }

  // Group blips by quadrant and then by ring
  const groupedBlips = quadrants
    .map((quadrant) => {
      const quadrantBlips = blips.filter((blip) => blip.quadrant === quadrant.id)

      // Group by ring and sort rings by their order
      const ringGroups = rings
        .map((ring) => {
          return {
            ring,
            blips: quadrantBlips.filter((blip) => blip.ring === ring.id),
          }
        })
        .filter((group) => group.blips.length > 0)

      return {
        quadrant,
        ringGroups,
        totalBlips: quadrantBlips.length,
      }
    })
    .filter((group) => group.totalBlips > 0)

  // Get ring color class
  const getRingColorClass = (ringId: string) => {
    switch (ringId) {
      case "adopt":
        return "border-green-200 bg-green-100 text-green-800"
      case "trial":
        return "border-blue-200 bg-blue-100 text-blue-800"
      case "assess":
        return "border-yellow-200 bg-yellow-100 text-yellow-800"
      case "hold":
        return "border-red-200 bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {groupedBlips.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No technologies match your current filters</div>
      ) : (
        groupedBlips.map(({ quadrant, ringGroups, totalBlips }) => (
          <div key={quadrant.id} className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer"
              onClick={() => toggleQuadrant(quadrant.id)}
            >
              <div className="font-medium flex items-center gap-2">
                {quadrant.name}
                <Badge variant="outline" className="ml-2">
                  {totalBlips}
                </Badge>
              </div>
              <Button variant="ghost" size="icon">
                {expandedQuadrants.includes(quadrant.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedQuadrants.includes(quadrant.id) && (
              <div className="divide-y">
                {ringGroups.map(({ ring, blips }) => (
                  <div key={ring.id} className="p-4">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Badge variant="outline" className={cn(getRingColorClass(ring.id))}>
                        {ring.name}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        ({blips.length} {blips.length === 1 ? "technology" : "technologies"})
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {blips.map((blip) => (
                        <div
                          key={blip.id}
                          className="p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-muted-foreground/20"
                          onClick={() => onBlipClick(blip)}
                        >
                          <div className="font-medium text-sm flex items-center gap-2">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold",
                                blip.ring === "adopt" && "bg-green-500",
                                blip.ring === "trial" && "bg-blue-500",
                                blip.ring === "assess" && "bg-yellow-500",
                                blip.ring === "hold" && "bg-red-500",
                              )}
                            >
                              {blip.id.split("-")[0]}
                            </div>
                            {blip.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1 ml-7">{blip.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
