"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Edit, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
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
  const [showDebugMode, setShowDebugMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    ring: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setIsEditMode(false)
    // 重置编辑表单数据
    if (blip) {
      setEditFormData({
        ring: blip.ring,
        description: ""  // 初始化为空字符串
      })
    }
  }

  const closeBlipDetails = () => {
    setSelectedBlip(null)
    setIsEditMode(false)
  }

  // 切换到编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (selectedBlip && !isEditMode) {
      setEditFormData({
        ring: selectedBlip.ring,
        description: ""  // 初始化为空字符串
      })
    }
  }

  // 处理表单字段变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }

  // 处理选择字段变化
  const handleSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }

  // 提交编辑表单
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBlip) return;
    
    // 检查是否有变化 - 对空字符串特殊处理
    const descriptionChanged = editFormData.description !== "" && 
                               editFormData.description !== selectedBlip.description;
    const ringChanged = editFormData.ring !== selectedBlip.ring;
    
    if (!ringChanged && !descriptionChanged) {
      toast({
        title: "无变化",
        description: "请至少修改一项内容后再提交",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 发送请求到API
      const response = await fetch("/api/notion/blip/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blipId: selectedBlip.id,
          name: selectedBlip.name,
          quadrant: data.quadrants.find((q) => q.id === selectedBlip.quadrant)?.name || "",
          ring: editFormData.ring,
          description: editFormData.description,
          prevRing: selectedBlip.ring,
          prevDescription: selectedBlip.description
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "编辑失败");
      }
      
      // 显示成功提示
      toast({
        title: "编辑成功",
        description: `已成功更新 ${selectedBlip.name} 的信息`,
      });
      
      // 重置界面状态
      setIsEditMode(false);
      closeBlipDetails();
      
      // 重新加载数据
      fetch('/api/notion/sync')
        .then(response => response.json())
        .then(newData => {
          if (newData.blips && newData.blips.length > 0) {
            setData(prevData => ({
              ...prevData,
              blips: newData.blips
            }));
          }
        })
        .catch(error => console.error('同步数据失败:', error));
        
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      
      toast({
        title: "编辑失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        {!isEditMode && (
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
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!isEditMode && (
                        <Button variant="ghost" size="icon" onClick={toggleEditMode}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {isEditMode && (
                        <Button variant="ghost" size="icon" onClick={toggleEditMode}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={closeBlipDetails}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditMode ? (
                    <div className="prose prose-sm max-w-none">
                      <p>{selectedBlip.description}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ring" className="text-right">
                          环
                        </Label>
                        <Select
                          value={editFormData.ring}
                          onValueChange={(value) => handleSelectChange("ring", value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="选择环" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.rings.map((ring) => (
                              <SelectItem key={ring.id} value={ring.id}>
                                {ring.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          描述
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={editFormData.description}
                          onChange={handleFormChange}
                          className="col-span-3"
                          rows={6}
                        />
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || 
                                   (editFormData.ring === selectedBlip.ring && 
                                    (editFormData.description === "" || editFormData.description === selectedBlip.description))}
                          className="flex items-center gap-2"
                        >
                          {isSubmitting ? "保存中..." : "保存修改"}
                          {!isSubmitting && <Save className="h-4 w-4" />}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
