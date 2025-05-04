"use client"

import { useState, useEffect } from 'react'
import RadarVisualization from '@/components/radar-visualization'
import { fetchRadarData } from '@/lib/data'
import { Blip } from '@/lib/types'

export default function RadarVisualizationTestPage() {
  const [selectedBlip, setSelectedBlip] = useState<Blip | null>(null)
  const [showDebugMode, setShowDebugMode] = useState(false)
  const [data, setData] = useState<{ blips: Blip[], quadrants: any[], rings: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true)
      const radarData = await fetchRadarData()
      setData(radarData)
      setError(null)
    } catch (err) {
      setError('加载数据失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 首次渲染时加载数据
  useEffect(() => {
    loadData()
  }, [])

  const handleBlipClick = (blip: Blip) => {
    setSelectedBlip(blip)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-red-500">{error || '数据加载失败'}</div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">雷达可视化测试</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 h-[600px] border rounded-lg p-4 bg-white shadow-sm">
          <RadarVisualization
            blips={data.blips}
            quadrants={data.quadrants}
            rings={data.rings}
            onBlipClick={handleBlipClick}
            showDebugMode={showDebugMode}
          />
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
            <h2 className="text-lg font-semibold mb-2">控制面板</h2>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input 
                type="checkbox" 
                checked={showDebugMode} 
                onChange={() => setShowDebugMode(!showDebugMode)}
                className="w-4 h-4"
              />
              <span>显示调试模式</span>
            </label>
            
            <button 
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
            >
              重新加载数据
            </button>
          </div>

          {selectedBlip && (
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h2 className="text-lg font-semibold mb-2">选中的技术点</h2>
              <div className="mb-2"><span className="font-medium">名称:</span> {selectedBlip.name}</div>
              <div className="mb-2"><span className="font-medium">象限:</span> {data.quadrants.find(q => q.id === selectedBlip.quadrant)?.name}</div>
              <div className="mb-2"><span className="font-medium">环:</span> {data.rings.find(r => r.id === selectedBlip.ring)?.name}</div>
              <div><span className="font-medium">描述:</span> {selectedBlip.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 