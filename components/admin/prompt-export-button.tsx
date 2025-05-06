"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 定义接口
interface ExportedData {
  prompt: string;
  radarId: string;
  radarName: string;
  qas: Array<{
    name: string;
    description: string;
    llmResult: string;
  }>;
}

interface ClearResultResponse {
  success: boolean;
  radarId?: string;
  radarName?: string;
  message?: string;
  error?: string;
}

interface PromptExportButtonProps {
  radarId: string;
}

export function PromptExportButton({ radarId }: PromptExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [exportedData, setExportedData] = useState<ExportedData | null>(null);

  const handleExport = async () => {
    if (isExporting || !radarId) return;
    
    try {
      setIsExporting(true);
      
      // 使用apiRequest获取数据，传递当前页面的雷达ID
      const data = await apiRequest<ExportedData>(`/api/prompt/export?radar_id=${radarId}`, { method: 'GET' });
      
      // 保存导出的数据
      setExportedData(data);
      
      // 创建Blob对象
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.radarName}-prompt-data-${new Date().toISOString().slice(0, 10)}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // 显示成功提示
      toast({
        title: "导出成功",
        description: `${data.radarName} 的Prompt评估数据已下载`
      });
      
      // 导出成功后询问是否要清空LLMResult数据
      setShowClearDialog(true);
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

  const handleClearLLMResults = async () => {
    if (isClearing || !radarId) return;
    
    try {
      setIsClearing(true);
      
      // 调用清空LLMResult的API，传递当前页面的雷达ID
      const result = await apiRequest<ClearResultResponse>(`/api/prompt/clear-llm-results?radar_id=${radarId}`, { 
        method: 'POST',
      });
      
      // 显示成功提示
      toast({
        title: "清空成功",
        description: result.message || `${result.radarName} 的LLMResult字段已成功清空`
      });
      
      // 关闭对话框
      setShowClearDialog(false);
      // 清空导出数据
      setExportedData(null);
    } catch (error) {
      console.error("清空失败:", error);
      
      toast({
        title: "清空失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleExport} 
        disabled={isExporting || isClearing || !radarId}
        variant="outline"
        className="flex items-center gap-2"
      >
        <DownloadIcon className="h-4 w-4" />
        {isExporting ? "导出中..." : "导出Prompt数据"}
      </Button>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空LLMResult数据</AlertDialogTitle>
            <AlertDialogDescription>
              已成功导出 {exportedData?.radarName} 的 {exportedData?.qas?.length || 0} 条数据。是否要清空Notion数据库中的LLMResult字段？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClearLLMResults();
              }}
              disabled={isClearing}
            >
              {isClearing ? "清空中..." : "确认清空"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 