"use client";

import { useState, useEffect } from "react";
import TechRadar from "@/components/tech-radar"
import { AddBlipForm } from "@/components/radar/blip/add-blip-form"
import { fetchRadarData, fetchAvailableRadars } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronDown } from "lucide-react"
import type { RadarData } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { AdminAuthDialog } from "@/components/admin/auth-dialog";
import { PromptExportButton } from "@/components/admin/prompt-export-button";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RadarData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableRadars, setAvailableRadars] = useState<{id: string, name: string}[]>([]);
  const [selectedRadarId, setSelectedRadarId] = useState<string>("");
  const { isAdmin } = useAuth();

  // 获取可用的雷达列表
  useEffect(() => {
    async function loadAvailableRadars() {
      try {
        const radars = await fetchAvailableRadars();
        setAvailableRadars(radars);
        if (radars.length > 0 && !selectedRadarId) {
          setSelectedRadarId(radars[0].id);
        }
      } catch (error) {
        console.error("加载雷达列表失败:", error);
      }
    }
    
    loadAvailableRadars();
  }, []);

  // 根据选择的雷达ID加载数据
  useEffect(() => {
    async function loadData() {
      if (!selectedRadarId) return;
      
      setIsLoading(true);
      try {
        const initialData = await fetchRadarData(selectedRadarId);
        setData(initialData);
      } catch (error) {
        console.error("加载数据失败:", error);
        toast({
          title: "加载数据失败",
          description: error instanceof Error ? error.message : "未知错误",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (selectedRadarId) {
      loadData();
    }
  }, [selectedRadarId]);

  // 处理雷达选择变更
  const handleRadarChange = (value: string) => {
    setSelectedRadarId(value);
  };

  // 同步数据
  const handleSync = async () => {
    if (isSyncing) return;
    
    // 确保有选择雷达ID
    if (!selectedRadarId) {
      toast({
        title: "无法同步",
        description: "请先选择一个雷达",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSyncing(true);
      
      // 使用 apiRequest 调用同步接口，传递当前选择的雷达ID
      await apiRequest(`/api/notion/sync?radar_id=${selectedRadarId}`, { method: "GET" });
      
      // 同步成功
      toast({
        title: "同步成功",
        description: `已成功同步"${availableRadars.find(r => r.id === selectedRadarId)?.name || '雷达'}"数据`,
      });
      
      // 重新加载当前雷达数据而不是刷新整个页面
      const refreshedData = await fetchRadarData(selectedRadarId);
      setData(refreshedData);
    } catch (error) {
      // 如果是未授权错误，apiRequest已经处理了提示和登出逻辑
      if (!(error instanceof Error && error.message === "未授权访问")) {
        console.error("同步失败:", error);
        
        // 提取API返回的错误信息
        let errorMessage = "未知错误";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'error' in error) {
          errorMessage = String(error.error);
        }
        
        toast({
          title: "同步失败",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading || !data) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-8 text-center relative">
        <div className="inline-block mb-2">
          <Select value={selectedRadarId} onValueChange={handleRadarChange}>
            <SelectTrigger className="border-none shadow-none text-3xl md:text-4xl font-bold focus:ring-0 focus:ring-offset-0 px-1 -mx-1 h-auto py-0 bg-transparent min-w-[280px] sm:min-w-[320px] md:min-w-[400px] justify-center">
              <SelectValue placeholder="选择雷达" className="text-center" />
            </SelectTrigger>
            <SelectContent align="center" className="min-w-[280px] sm:min-w-[320px] md:min-w-[400px]">
              {availableRadars.map((radar) => (
                <SelectItem key={radar.id} value={radar.id} className="text-center justify-center">{radar.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="absolute right-0 top-0">
          <AdminAuthDialog />
        </div>
      </header>

      <TechRadar initialData={data} />
      <div className="w-full max-w-6xl mb-8 flex justify-end gap-2">
        {isAdmin && (
          <>
            <PromptExportButton radarId={selectedRadarId} />
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isSyncing ? "同步中..." : "同步数据"}
            </Button>
            <AddBlipForm 
              radarId={selectedRadarId}
              quadrants={data.quadrants}
            />
          </>
        )}
      </div>
    </main>
  )
}
