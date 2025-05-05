"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// 环的选项
const RINGS = ["adopt", "trial", "assess", "hold"];

interface EditBlipFormProps {
  blip: {
    id: string;
    name: string;
    quadrant: string;
    ring: string;
    description: string;
  };
  trigger?: React.ReactNode;
  onEditSuccess?: () => void;
}

export function EditBlipForm({ blip, trigger, onEditSuccess }: EditBlipFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ring: "",
    description: ""
  });
  
  // 初始化表单数据
  useEffect(() => {
    if (blip) {
      setFormData({
        ring: blip.ring,
        description: blip.description || ""
      });
    }
  }, [blip]);

  // 处理文本字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 处理选择字段变化
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 点击打开对话框
  const handleOpenDialog = () => {
    setOpen(true);
    // 重新初始化表单
    setFormData({
      ring: blip.ring,
      description: blip.description || ""
    });
  };

  // 检查是否有变化
  const hasChanges = () => {
    return formData.ring !== blip.ring || 
           formData.description !== blip.description;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证是否有变化
    if (!hasChanges()) {
      toast({
        title: "无变化",
        description: "请至少修改一项内容后再提交",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 发送请求到API
      const response = await fetch("/api/notion/blip/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blipId: blip.id,
          name: blip.name,
          quadrant: blip.quadrant,
          ring: formData.ring,
          description: formData.description,
          prevRing: blip.ring,
          prevDescription: blip.description
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "编辑失败");
      }
      
      // 成功后关闭对话框
      toast({
        title: "编辑成功",
        description: `已成功更新 ${blip.name} 的信息`,
      });
      
      setOpen(false);
      
      // 刷新页面或调用成功回调
      if (onEditSuccess) {
        onEditSuccess();
      } else {
        router.refresh();
      }
      
      // 可选：同步Notion数据库
      try {
        await fetch("/api/notion/sync", {
          method: "GET",
        });
      } catch (syncError) {
        console.error("同步数据库失败", syncError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      
      toast({
        title: "编辑失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpenDialog}>{trigger}</div>
      ) : (
        <Button onClick={handleOpenDialog} variant="outline" size="sm">
          编辑
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑 {blip.name}</DialogTitle>
            <DialogDescription>
              修改技术雷达节点的状态和描述信息。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  value={blip.name}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quadrant" className="text-right">
                  象限
                </Label>
                <Input
                  id="quadrant"
                  value={blip.quadrant}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ring" className="text-right">
                  环
                </Label>
                <Select
                  value={formData.ring}
                  onValueChange={(value) => handleSelectChange("ring", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择环" />
                  </SelectTrigger>
                  <SelectContent>
                    {RINGS.map((ring) => (
                      <SelectItem key={ring} value={ring}>
                        {ring}
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
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading || !hasChanges()}>
                {isLoading ? "保存中..." : "保存修改"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 