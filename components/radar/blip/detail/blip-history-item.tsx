import { RecordChangeLog, Ring } from "@/lib/types"
import { MarkdownContent } from "./blip-markdown-content"

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

        {/* 显示内容 */}
        {record.description && (
          <div className="px-3 py-2 bg-gray-100 rounded-md prose prose-sm max-w-none">
            <MarkdownContent content={record.description} isCompact={true} />
          </div>
        )}
      </div>
    </div>
  )
} 