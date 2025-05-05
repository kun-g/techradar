import { X, Edit, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Blip, Quadrant, Ring } from "@/lib/types"

interface BlipHeaderProps {
  blip: Blip
  quadrants: Quadrant[]
  rings: Ring[]
  isEditMode: boolean
  onEdit: () => void
  onClose: () => void
}

export function BlipHeader({ blip, quadrants, rings, isEditMode, onEdit, onClose }: BlipHeaderProps) {
  return (
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
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1">
            {!isEditMode && blip.tags && blip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {blip.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {!isEditMode && (
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid="edit-button">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isEditMode && (
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid="back-button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-button">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
} 