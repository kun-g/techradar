import { motion } from "framer-motion"
import { X, Edit, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Blip, Quadrant, Ring } from "@/lib/types"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

interface BlipDetailModalProps {
  blip: Blip | null
  quadrants: Quadrant[]
  rings: Ring[]
  onClose: () => void
  onDataUpdate?: (blips: any) => void
}

export default function BlipDetailModal({ blip, quadrants, rings, onClose, onDataUpdate }: BlipDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    ring: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 切换到编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (blip && !isEditMode) {
      setEditFormData({
        ring: blip.ring,
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
    
    if (!blip) return;
    
    // 检查是否有变化 - 对空字符串特殊处理
    const descriptionChanged = editFormData.description !== "" && 
                              editFormData.description !== blip.description;
    const ringChanged = editFormData.ring !== blip.ring;
    
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
          blipId: blip.id,
          name: blip.name,
          quadrant: quadrants.find((q) => q.id === blip.quadrant)?.name || "",
          ring: editFormData.ring,
          description: editFormData.description,
          prevRing: blip.ring,
          prevDescription: blip.description
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "编辑失败");
      }
      
      // 显示成功提示
      toast({
        title: "编辑成功",
        description: `已成功更新 ${blip.name} 的信息`,
      });
      
      // 重置界面状态
      setIsEditMode(false);
      onClose();
      
      // 重新加载数据
      fetch('/api/notion/sync')
        .then(response => response.json())
        .then(newData => {
          if (newData.blips && newData.blips.length > 0 && onDataUpdate) {
            onDataUpdate(newData.blips);
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
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      blip.ring === "adopt" && "bg-green-500",
                      blip.ring === "trial" && "bg-blue-500",
                      blip.ring === "assess" && "bg-yellow-500",
                      blip.ring === "hold" && "bg-red-500",
                    )}
                  >
                    {blip.id.split("-")[0]}
                  </div>
                  {blip.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {quadrants.find((q) => q.id === blip.quadrant)?.name}
                  </Badge>
                  {!isEditMode && (
                    <Badge
                      variant="outline"
                      className={cn(
                        blip.ring === "adopt" && "border-green-200 bg-green-100 text-green-800",
                        blip.ring === "trial" && "border-blue-200 bg-blue-100 text-blue-800",
                        blip.ring === "assess" && "border-yellow-200 bg-yellow-100 text-yellow-800",
                        blip.ring === "hold" && "border-red-200 bg-red-100 text-red-800",
                      )}
                    >
                      {rings.find((r) => r.id === blip.ring)?.name}
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditMode && (
                  <Button variant="ghost" size="icon" onClick={toggleEditMode} data-testid="edit-button">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {isEditMode && (
                  <Button variant="ghost" size="icon" onClick={toggleEditMode} data-testid="back-button">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-button">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditMode ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    // 自定义组件渲染
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />,
                    code: ({inline, className, children, ...props}: any) => {
                      return inline 
                        ? <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>{children}</code>
                        : <pre className="bg-gray-100 p-4 rounded overflow-x-auto"><code {...props}>{children}</code></pre>
                    }
                  }}
                >
                  {blip.description}
                </ReactMarkdown>
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
                      {rings.map((ring) => (
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
                  <div className="col-span-3">
                    <Textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleFormChange}
                      rows={8}
                      placeholder="支持Markdown格式，例如 **粗体**, *斜体*, `代码`, ## 标题, > 引用, [链接](https://example.com)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      支持Markdown语法，包括表格、列表、链接和代码块等
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || 
                            (editFormData.ring === blip.ring && 
                              (editFormData.description === "" || editFormData.description === blip.description))}
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
  )
} 