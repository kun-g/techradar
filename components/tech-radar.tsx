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

        {/* Main content area */}
        <div className="flex-1">
          <Tabs defaultValue="radar" onValueChange={(value) => setViewMode(value as "radar" | "list")}>

            <div className="flex justify-center items-center mb-4">
              <TabsList>
                <TabsTrigger value="radar">Radar View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="radar" className="mt-0">
              <div className="bg-white rounded-lg h-[600px] relative">
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
