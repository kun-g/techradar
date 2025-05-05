"use client";

import { useState, useEffect } from "react";
import TechRadar from "@/components/tech-radar"
import { AddBlipForm } from "@/components/radar/blip/add-blip-form"
import { fetchRadarData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { RadarData } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { AdminAuthDialog } from "@/components/admin/auth-dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-helpers";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RadarData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isAdmin } = useAuth();

  // 获取初始数据
  useEffect(() => {
    async function loadData() {
      try {
        const initialData = await fetchRadarData();
        setData(initialData);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // 同步数据
  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      // 使用 apiRequest 调用同步接口
      await apiRequest("/api/notion/sync", { method: "GET" });
      
      // 同步成功
      toast({
        title: "同步成功",
        description: "数据已成功同步",
      });
      
      // 刷新页面
      window.location.reload();
    } catch (error) {
      // 如果是未授权错误，apiRequest已经处理了提示和登出逻辑
      if (!(error instanceof Error && error.message === "未授权访问")) {
        console.error("同步失败:", error);
        toast({
          title: "同步失败",
          description: error instanceof Error ? error.message : "未知错误",
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Technology Radar</h1>
        <p className="text-muted-foreground">An opinionated guide to technology frontiers</p>
        <div className="absolute right-0 top-0">
          <AdminAuthDialog />
        </div>
      </header>

      <TechRadar initialData={data} />
      <div className="w-full max-w-6xl mb-8 flex justify-end gap-2">
        {isAdmin && (
          <>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isSyncing ? "同步中..." : "同步数据"}
            </Button>
            <AddBlipForm />
          </>
        )}
      </div>
    </main>
  )
}
