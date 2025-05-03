"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import RadarVisualization from "./radar-visualization"
import BlipList from "./blip-list"
import type { Blip, RadarData } from "@/lib/types"

interface TechRadarProps {
  initialData: RadarData
}

export default function TechRadar({ initialData }: TechRadarProps) {
  const [data, setData] = useState<RadarData>(initialData)
  const [filteredBlips, setFilteredBlips] = useState<Blip[]>(initialData.blips)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuadrants, setSelectedQuadrants] = useState<string[]>([])
  const [selectedRings, setSelectedRings] = useState<string[]>([])
  const [selectedBlip, setSelectedBlip] = useState<Blip | null>(null)
  const [viewMode, setViewMode] = useState<"radar" | "list">("radar")
  const [showHelp, setShowHelp] = useState(false)
  const [showDebugMode, setShowDebugMode] = useState(false)

  // Filter blips based on search query, selected quadrants and rings
  useEffect(() => {
    let filtered = data.blips

    if (searchQuery) {
      filtered = filtered.filter(
        (blip) =>
          blip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blip.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedQuadrants.length > 0) {
      filtered = filtered.filter((blip) => selectedQuadrants.includes(blip.quadrant))
    }

    if (selectedRings.length > 0) {
      filtered = filtered.filter((blip) => selectedRings.includes(blip.ring))
    }

    setFilteredBlips(filtered)
  }, [searchQuery, selectedQuadrants, selectedRings, data])

  const toggleQuadrant = (quadrant: string) => {
    setSelectedQuadrants((prev) => (prev.includes(quadrant) ? prev.filter((q) => q !== quadrant) : [...prev, quadrant]))
  }

  const toggleRing = (ring: string) => {
    setSelectedRings((prev) => (prev.includes(ring) ? prev.filter((r) => r !== ring) : [...prev, ring]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedQuadrants([])
    setSelectedRings([])
  }

  const handleBlipClick = (blip: Blip) => {
    setSelectedBlip(blip)
  }

  const closeBlipDetails = () => {
    setSelectedBlip(null)
  }

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
    <div className="w-full max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar with filters */}
        <div className="w-full md:w-64 space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {(selectedQuadrants.length > 0 || selectedRings.length > 0 || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1 text-xs">
              <Filter className="h-3 w-3" />
              Clear filters
            </Button>
          )}

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Showing {filteredBlips.length} of {data.blips.length} technologies
            </p>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <Tabs defaultValue="radar" onValueChange={(value) => setViewMode(value as "radar" | "list")}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="radar">Radar View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            {showHelp && (
              <div className="bg-muted/30 p-4 rounded-md mb-4 text-sm">
                <h3 className="font-medium mb-2">How to read the radar</h3>
                <p className="mb-2">
                  The radar is divided into four quadrants: Techniques, Tools, Platforms, and Languages & Frameworks.
                  Each blip represents a technology and is positioned in one of four rings:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="text-green-600 font-medium">Adopt</span> — Technologies we strongly recommend.
                  </li>
                  <li>
                    <span className="text-blue-600 font-medium">Trial</span> — Technologies worth pursuing. Understand
                    how they affect your project.
                  </li>
                  <li>
                    <span className="text-yellow-600 font-medium">Assess</span> — Worth exploring to understand how it
                    will affect your project.
                  </li>
                  <li>
                    <span className="text-red-600 font-medium">Hold</span> — Proceed with caution.
                  </li>
                </ul>
              </div>
            )}

            <TabsContent value="radar" className="mt-0">
              <div className="bg-white rounded-lg p-4 h-[600px] relative">
                <RadarVisualization
                  blips={filteredBlips}
                  quadrants={data.quadrants}
                  rings={data.rings}
                  onBlipClick={handleBlipClick}
                  showDebugMode={showDebugMode}
                />
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <BlipList
                blips={filteredBlips}
                quadrants={data.quadrants}
                rings={data.rings}
                onBlipClick={handleBlipClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Blip details modal */}
      <AnimatePresence>
        {selectedBlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeBlipDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                            selectedBlip.ring === "adopt" && "bg-green-500",
                            selectedBlip.ring === "trial" && "bg-blue-500",
                            selectedBlip.ring === "assess" && "bg-yellow-500",
                            selectedBlip.ring === "hold" && "bg-red-500",
                          )}
                        >
                          {selectedBlip.id.split("-")[0]}
                        </div>
                        {selectedBlip.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {data.quadrants.find((q) => q.id === selectedBlip.quadrant)?.name}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            selectedBlip.ring === "adopt" && "border-green-200 bg-green-100 text-green-800",
                            selectedBlip.ring === "trial" && "border-blue-200 bg-blue-100 text-blue-800",
                            selectedBlip.ring === "assess" && "border-yellow-200 bg-yellow-100 text-yellow-800",
                            selectedBlip.ring === "hold" && "border-red-200 bg-red-100 text-red-800",
                          )}
                        >
                          {data.rings.find((r) => r.id === selectedBlip.ring)?.name}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeBlipDetails}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p>{selectedBlip.description}</p>
                    {selectedBlip.rationale && (
                      <>
                        <h3 className="text-lg font-medium mt-4">Rationale</h3>
                        <p>{selectedBlip.rationale}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
