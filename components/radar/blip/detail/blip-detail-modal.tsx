import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import type { Blip, Quadrant, Ring, RecordChangeLog } from "@/lib/types"
import { useState, useEffect } from "react"
import { BlipHeader } from "./blip-header"
import { BlipForm } from "./blip-form"
import { BlipHistory } from "./blip-history"
import { MarkdownContent } from "./blip-markdown-content"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api-helpers"

interface BlipDetailModalProps {
  blip: Blip | null
  quadrants: Quadrant[]
  rings: Ring[]
  onClose: () => void
  onDataUpdate?: (blips: any) => void
}

export function BlipDetailModal({ blip, quadrants, rings, onClose, onDataUpdate }: BlipDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    ring: "",
    description: "",
    tags: [] as string[],
    aliases: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [historyData, setHistoryData] = useState<RecordChangeLog[]>([])

  // 当 blip 改变时更新历史数据和表单数据
  useEffect(() => {
    if (blip) {
      setHistoryData(blip.history || []);
      if (!isEditMode) {
        setEditFormData({
          ring: blip.ring,
          description: "",
          tags: blip.tags || [],
          aliases: blip.aliases || []
        });
      }
    }
  }, [blip, isEditMode]);

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
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

  // 处理标签变化
  const handleTagsChange = (tags: string[]) => {
    setEditFormData(prev => ({ ...prev, tags }));
  }

  // 处理别名变化
  const handleAliasesChange = (aliases: string[]) => {
    setEditFormData(prev => ({ ...prev, aliases }));
  }

  // 提交编辑表单
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blip) return;
    
    // 检查是否有变化
    const descriptionChanged = editFormData.description !== "" && 
                              editFormData.description !== blip.description;
    const ringChanged = editFormData.ring !== blip.ring;
    const tagsChanged = JSON.stringify(editFormData.tags) !== JSON.stringify(blip.tags || []);
    const aliasesChanged = JSON.stringify(editFormData.aliases) !== JSON.stringify(blip.aliases || []);
    
    if (!ringChanged && !descriptionChanged && !tagsChanged && !aliasesChanged) {
      toast({
        title: "无变化",
        description: "请至少修改一项内容后再提交",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 使用apiRequest替代fetch
      const responseData = await apiRequest<{success: boolean, data: any}>("/api/notion/blip/edit", {
        method: "POST",
        body: JSON.stringify({
          blipId: blip.id,
          name: blip.name,
          quadrant: quadrants.find((q) => q.id === blip.quadrant)?.name || "",
          ring: editFormData.ring,
          description: editFormData.description || blip.description,
          prevRing: blip.ring,
          prevDescription: blip.description,
          tags: editFormData.tags,
          prevTags: blip.tags || [],
          aliases: editFormData.aliases,
          prevAliases: blip.aliases || []
        }),
      });
      
      // 显示成功提示
      toast({
        title: "编辑成功",
        description: `已成功更新 ${blip.name} 的信息`,
      });
      
      // 重置界面状态
      setIsEditMode(false);
      onClose();
      
      // 重新加载数据 - 也使用apiRequest
      try {
        const syncData = await apiRequest<{blips: any, logs: any}>('/api/notion/sync');
        if (syncData.blips && syncData.blips.length > 0 && onDataUpdate) {
          onDataUpdate(syncData.blips);
        }
      } catch (syncError) {
        console.error('同步数据失败:', syncError);
      }
        
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

  // 格式化历史记录日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知时间';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!blip) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <BlipHeader 
            blip={blip} 
            quadrants={quadrants} 
            rings={rings} 
            isEditMode={isEditMode} 
            onEdit={toggleEditMode} 
            onClose={onClose} 
          />

          <CardContent>
            {!isEditMode ? (
              <div className="space-y-4">
                {/* 标签和别名显示区域 */}
                {(blip.tags && blip.tags.length > 0) && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">标签</h3>
                    <div className="flex flex-wrap gap-1">
                      {blip.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(blip.aliases && blip.aliases.length > 0) && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">别名</h3>
                    <div className="flex flex-wrap gap-1">
                      {blip.aliases.map(alias => (
                        <Badge key={alias} variant="outline">{alias}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 描述区域 */}
                <div className="prose prose-sm max-w-none">
                  <MarkdownContent content={blip.description} />
                </div>
              </div>
            ) : (
              <BlipForm 
                formData={editFormData}
                rings={rings}
                blip={blip}
                isSubmitting={isSubmitting}
                onFormChange={handleFormChange}
                onSelectChange={handleSelectChange}
                onTagsChange={handleTagsChange}
                onAliasesChange={handleAliasesChange}
                onSubmit={handleSubmitEdit}
              />
            )}
          </CardContent>

          {!isEditMode && (
            <BlipHistory 
              historyData={historyData}
              rings={rings}
              formatDate={formatDate}
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
} 