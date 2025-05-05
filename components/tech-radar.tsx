"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RadarVisualization from "./radar-visualization"
import BlipList from "./blip-list"
import BlipDetailModal from "@/components/radar/blip/detail"
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

  const handleBlipClick = (blip: Blip) => {
    setSelectedBlip(blip)
  }

  const closeBlipDetails = () => {
    setSelectedBlip(null)
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
          <BlipDetailModal
            blip={selectedBlip}
            quadrants={data.quadrants}
            rings={data.rings}
            availableTags={data.availableTags}
            onClose={closeBlipDetails}
            onDataUpdate={(blips) => {
              setData(prevData => ({
                ...prevData,
                blips
              }));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
