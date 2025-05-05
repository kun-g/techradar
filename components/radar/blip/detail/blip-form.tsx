import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Blip, Ring } from "@/lib/types"

interface BlipFormData {
  ring: string
  description: string
}

interface BlipFormProps {
  formData: BlipFormData
  rings: Ring[]
  blip: Blip
  isSubmitting: boolean
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (name: string, value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function BlipForm({ 
  formData, 
  rings, 
  blip, 
  isSubmitting, 
  onFormChange, 
  onSelectChange, 
  onSubmit 
}: BlipFormProps) {
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
          disabled={isSubmitting || 
                  (formData.ring === blip.ring && 
                    (formData.description === "" || formData.description === blip.description))}
          className="flex items-center gap-2"
        >
          {isSubmitting ? "保存中..." : "保存修改"}
          {!isSubmitting && <Save className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
} 