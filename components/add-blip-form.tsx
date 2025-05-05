"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// 象限和环的选项
const QUADRANTS = ["技术", "平台", "工具", "语言和框架"];
const RINGS = ["adopt", "trial", "assess", "hold"];

export function AddBlipForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quadrant: "",
    ring: "assess",
    description: ""
  });

  // 处理表单字段变化
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
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.name || !formData.quadrant) {
      toast({
        title: "表单错误",
        description: "请填写必填字段：名称和象限",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 发送请求到API
      const response = await fetch("/api/notion/blip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "添加失败");
      }
      
      // 成功后关闭对话框并重置表单
      toast({
        title: "添加成功",
        description: `已成功添加 ${formData.name} 到技术雷达`,
      });
      
      setFormData({
        name: "",
        quadrant: "",
        ring: "assess",
        description: ""
      });
      
      setOpen(false);
      
      // 刷新页面以显示新添加的数据
      router.refresh();
      
      // 可选：同步Notion数据库
      try {
        await fetch("/api/notion/sync", {
          method: "GET",
        });
      } catch (syncError) {
        console.error("同步数据库失败", syncError);
      }
    } catch (error) {
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "发生未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleOpenDialog}>添加新节点</Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加新技术雷达节点</DialogTitle>
            <DialogDescription>
              填写以下信息添加新的技术或工具到技术雷达。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称 *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quadrant" className="text-right">
                  象限 *
                </Label>
                <Select
                  value={formData.quadrant}
                  onValueChange={(value) => handleSelectChange("quadrant", value)}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择象限" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUADRANTS.map((quadrant) => (
                      <SelectItem key={quadrant} value={quadrant}>
                        {quadrant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "添加中..." : "添加节点"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 