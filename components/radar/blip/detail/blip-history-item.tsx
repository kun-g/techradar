import { RecordChangeLog, Ring } from "@/lib/types"
import { MarkdownContent } from "./blip-markdown-content"
import { Badge } from "@/components/ui/badge"

interface BlipHistoryItemProps {
  record: RecordChangeLog
  nextRecord: RecordChangeLog | null
  rings: Ring[]
  formatDate: (dateString?: string) => string
}

export function BlipHistoryItem({ record, nextRecord, rings, formatDate }: BlipHistoryItemProps) {
  // 判断环是否有变化（与下一次记录比较）
  const ringChanged = nextRecord && record.ring !== nextRecord.ring
  // 获取新的环名称（如果变化了）
  const newRingName = ringChanged 
    ? rings.find(r => r.id === nextRecord?.ring)?.name || nextRecord?.ring
    : null
    
  // 判断标签是否有变化
  const tagsChanged = nextRecord && 
    JSON.stringify(record.tags || []) !== JSON.stringify(nextRecord.tags || [])
    
  // 判断别名是否有变化
  const aliasesChanged = nextRecord && 
    JSON.stringify(record.aliases || []) !== JSON.stringify(nextRecord.aliases || [])

  return (
    <div className="bg-gray-50 p-3 rounded-md text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{record.name}</div>
        <div className="text-xs text-muted-foreground">{formatDate(record.created)}</div>
      </div>

      <div className="space-y-2">
        {/* 显示环变化 */}
        {ringChanged && (
          <div className="pb-2 border-b border-gray-200">
            <div className="text-xs text-muted-foreground mb-1">环</div>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <span className="line-through text-muted-foreground">
                  {rings.find(r => r.id === record.ring)?.name || record.ring}
                </span>
              </div>
              <div className="text-gray-500">→</div>
              <div className="flex-1">
                <span className="text-blue-600">
                  {newRingName}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* 显示标签变化 */}
        {tagsChanged && (
          <div className="pb-2 border-b border-gray-200">
            <div className="text-xs text-muted-foreground mb-1">标签</div>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {(record.tags && record.tags.length > 0) ? (
                    record.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="line-through text-muted-foreground">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic text-xs">无</span>
                  )}
                </div>
              </div>
              <div className="text-gray-500">→</div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {(nextRecord?.tags && nextRecord.tags.length > 0) ? (
                    nextRecord.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic text-xs">无</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 显示别名变化 */}
        {aliasesChanged && (
          <div className="pb-2 border-b border-gray-200">
            <div className="text-xs text-muted-foreground mb-1">别名</div>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {(record.aliases && record.aliases.length > 0) ? (
                    record.aliases.map(alias => (
                      <Badge key={alias} variant="outline" className="line-through text-muted-foreground">
                        {alias}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic text-xs">无</span>
                  )}
                </div>
              </div>
              <div className="text-gray-500">→</div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {(nextRecord?.aliases && nextRecord.aliases.length > 0) ? (
                    nextRecord.aliases.map(alias => (
                      <Badge key={alias} variant="outline">
                        {alias}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic text-xs">无</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 显示内容 */}
        {record.description && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">描述</div>
            <div className="px-3 py-2 bg-gray-100 rounded-md prose prose-sm max-w-none">
              <MarkdownContent content={record.description} isCompact={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 