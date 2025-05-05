import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Blip, Ring } from "@/lib/types"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface BlipFormData {
  ring: string
  description: string
  tags: string[]
  aliases: string[]
}

interface BlipFormProps {
  formData: BlipFormData
  rings: Ring[]
  blip: Blip
  isSubmitting: boolean
  availableTags?: string[]
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (name: string, value: string) => void
  onTagsChange: (tags: string[]) => void
  onAliasesChange: (aliases: string[]) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function BlipForm({ 
  formData, 
  rings, 
  blip, 
  isSubmitting, 
  availableTags = [],
  onFormChange, 
  onSelectChange, 
  onTagsChange,
  onAliasesChange,
  onSubmit 
}: BlipFormProps) {
  const [newTag, setNewTag] = useState("")
  const [tagSelectOpen, setTagSelectOpen] = useState(false)
  const [newAlias, setNewAlias] = useState("")

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      const updatedTags = [...formData.tags, tag];
      onTagsChange(updatedTags);
    }
  };

  // 从下拉菜单选择标签
  const handleSelectTag = (tag: string) => {
    handleAddTag(tag);
    setTagSelectOpen(false);
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  // 添加新别名
  const handleAddAlias = () => {
    if (newAlias.trim() && !formData.aliases.includes(newAlias.trim())) {
      const updatedAliases = [...formData.aliases, newAlias.trim()];
      onAliasesChange(updatedAliases);
      setNewAlias("");
    }
  };

  // 移除别名
  const handleRemoveAlias = (aliasToRemove: string) => {
    const updatedAliases = formData.aliases.filter(alias => alias !== aliasToRemove);
    onAliasesChange(updatedAliases);
  };

  // 检查表单数据是否有变化
  const hasFormChanged = () => {
    const ringChanged = formData.ring !== blip.ring;
    const descriptionChanged = formData.description !== "" && formData.description !== blip.description;
    const tagsChanged = JSON.stringify(formData.tags) !== JSON.stringify(blip.tags || []);
    const aliasesChanged = JSON.stringify(formData.aliases) !== JSON.stringify(blip.aliases || []);
    
    return ringChanged || descriptionChanged || tagsChanged || aliasesChanged;
  };

  // 获取尚未使用的标签
  const getUnusedTags = () => {
    return availableTags.filter(tag => !formData.tags.includes(tag));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="ring" className="text-right">
          环
        </Label>
        <Select
          value={formData.ring}
          onValueChange={(value) => onSelectChange("ring", value)}
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
        <Label htmlFor="tags" className="text-right">
          标签
        </Label>
        <div className="col-span-3">
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveTag(tag)} 
                />
              </Badge>
            ))}
          </div>
          <Popover open={tagSelectOpen} onOpenChange={setTagSelectOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                添加标签
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="搜索标签..." />
                <CommandEmpty>未找到标签</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {getUnusedTags().map(tag => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => handleSelectTag(tag)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.tags.includes(tag) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="aliases" className="text-right">
          别名
        </Label>
        <div className="col-span-3">
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.aliases.map((alias) => (
              <Badge key={alias} variant="outline" className="flex items-center gap-1">
                {alias}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveAlias(alias)} 
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlias())}
              placeholder="添加别名"
            />
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleAddAlias}
              disabled={!newAlias.trim()}
            >
              添加
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          描述
        </Label>
        <div className="col-span-3">
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onFormChange}
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
          disabled={isSubmitting || !hasFormChanged()}
          className="flex items-center gap-2"
        >
          {isSubmitting ? "保存中..." : "保存修改"}
          {!isSubmitting && <Save className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
} 