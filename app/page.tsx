"use client";

import { useState, useEffect } from "react";
import TechRadar from "@/components/tech-radar"
import { AddBlipForm } from "@/components/radar/blip/add-blip-form"
import { fetchRadarData, fetchAvailableRadars } from "@/lib/data"
import type { RadarData } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { AdminAuthDialog } from "@/components/admin/auth-dialog";
import { PromptExportButton } from "@/components/admin/prompt-export-button";
import { toast } from "@/hooks/use-toast";
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

  // 数据变更后重新加载
  const reloadData = async () => {
    if (!selectedRadarId) return;
    try {
      const refreshedData = await fetchRadarData(selectedRadarId);
      setData(refreshedData);
    } catch (error) {
      console.error("刷新数据失败:", error);
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
            <AddBlipForm
              radarId={selectedRadarId}
              quadrants={data.quadrants}
              onSuccess={reloadData}
            />
          </>
        )}
      </div>
    </main>
  )
}
