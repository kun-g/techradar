"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-helpers";
import { Quadrant } from "@/lib/types";

const RINGS = ["adopt", "trial", "assess", "hold"];

interface AddBlipFormProps {
  radarId?: string;
  quadrants?: Quadrant[];
  onSuccess?: () => void;
}

export function AddBlipForm({ radarId, quadrants = [], onSuccess }: AddBlipFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quadrant: "",
    ring: "assess",
    description: "",
    radarId: radarId || "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = () => {
    setOpen(true);
    setFormData({
      name: "",
      quadrant: "",
      ring: "assess",
      description: "",
      radarId: radarId || "0"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "表单错误",
        description: "请填写必填字段：名称",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      await apiRequest("/api/radar/blip", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast({
        title: "添加成功",
        description: `已成功添加 ${formData.name} 到技术雷达`,
      });

      setFormData({
        name: "",
        quadrant: "",
        ring: "assess",
        description: "",
        radarId: radarId || "0"
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      if (!(error instanceof Error && error.message === "未授权访问")) {
        const errorMessage = error instanceof Error ? error.message : "发生未知错误";

        if (errorMessage.includes("已存在名称为")) {
          toast({
            title: "重复记录",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "添加失败",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        setOpen(false);
      }
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
              填写以下信息添加新的技术或工具到技术雷达。AI将自动推荐象限。
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

              {quadrants.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quadrant" className="text-right">
                    象限
                  </Label>
                  <Select
                    value={formData.quadrant}
                    onValueChange={(value) => handleSelectChange("quadrant", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择象限（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {quadrants.map((quadrant) => (
                        <SelectItem key={quadrant.id} value={quadrant.id}>
                          {quadrant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                        {ring.charAt(0).toUpperCase() + ring.slice(1)}
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
