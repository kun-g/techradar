import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RecordChangeLog, Ring } from "@/lib/types"
import { BlipHistoryItem } from "./blip-history-item"

interface BlipHistoryProps {
  historyData: RecordChangeLog[]
  rings: Ring[]
  formatDate: (dateString?: string) => string
}

export function BlipHistory({ historyData, rings, formatDate }: BlipHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  return (
    <CardFooter className="flex flex-col items-center pt-0">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs flex items-center gap-1 text-muted-foreground"
        onClick={toggleHistory}
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", showHistory && "transform rotate-180")} />
        {historyData.length > 0 ? "查看历史记录" : "暂无历史记录"}
      </Button>
      
      {showHistory && historyData.length > 0 && (
        <div className="w-full mt-2 border-t pt-3">
          <h4 className="text-sm font-medium mb-2">修改历史</h4>
          <div className="space-y-4">
            {historyData.map((record, idx) => {
              // 获取后一条记录（如果有的话）
              const nextRecord = idx < historyData.length - 1 ? historyData[idx + 1] : null;
              
              return (
                <BlipHistoryItem 
                  key={idx}
                  record={record}
                  nextRecord={nextRecord}
                  rings={rings}
                  formatDate={formatDate}
                />
              );
            })}
          </div>
        </div>
      )}
    </CardFooter>
  )
} 