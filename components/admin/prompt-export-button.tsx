"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-helpers";

export function PromptExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      
      // 使用apiRequest获取数据
      const data = await apiRequest('/api/prompt/export', { method: 'GET' });
      
      // 创建Blob对象
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-evaluation-data-${new Date().toISOString().slice(0, 10)}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // 显示成功提示
      toast({
        title: "导出成功",
        description: "Prompt评估数据已下载"
      });
    } catch (error) {
      console.error("导出失败:", error);
      
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      variant="outline"
      className="flex items-center gap-2"
    >
      <DownloadIcon className="h-4 w-4" />
      {isExporting ? "导出中..." : "导出Prompt数据"}
    </Button>
  );
} 