import type { RadarData, RecordChangeLog, Blip } from "./types"
import blips from "../data/blips.json"
import logs from "../data/logs.json"

export const ringRatios = [0.4, 0.3, 0.2, 0.1];

/**
 * 计算数据新鲜度，返回0-1之间的值
 * 0表示最新数据，1表示最旧数据
 * 使用指数函数使新鲜度随时间指数下降
 * @param date 更新日期
 * @param maxAgeDays 最大天数范围（默认为30天）
 * @param decayRate 衰减速率（默认为0.1，值越大初期下降越快）
 */
export function calculateFreshness(date: string, decayRate: number = 0.1): number {
  if (!date) return 0;

  const updateDate = new Date(date);
  const now = new Date();
  const diffDays = (now.getTime() - updateDate.getTime()) / (1000 * 3600 * 24);

  if (diffDays < 0) return 1; // 未来数据最鲜

  const freshness = 1 - Math.exp(-decayRate * diffDays);
  return Math.min(Math.max(freshness, 0), 1);
}


/**
 * 根据新鲜度生成透明度值
 * @param freshness 新鲜度（0-1）
 * @param minOpacity 最小透明度（默认0.2）
 * @param maxOpacity 最大透明度（默认0.9）
 */
export function getFreshnessOpacity(freshness: number, minOpacity: number = 0.1, maxOpacity: number = 1.0): number {
  return maxOpacity - freshness * (maxOpacity - minOpacity);
}

export async function fetchRadarData(): Promise<RadarData> {

  return {
    quadrants: [
      { id: "语言与框架", name: "语言与框架", order: 0 },
      { id: "平台", name: "平台", order: 1 },
      { id: "工具", name: "工具", order: 2 },
      { id: "技术", name: "技术", order: 3 },
    ],
    rings: [
      { id: "adopt", name: "Adopt", order: 0, color: "green", stroke: "rgba(16, 185, 129, 0.7)" },
      { id: "trial", name: "Trial", order: 1, color: "blue", stroke: "rgba(59, 130, 246, 0.7)" },
      { id: "assess", name: "Assess", order: 2, color: "yellow", stroke: "rgba(234, 179, 8, 0.7)" },
      { id: "hold", name: "Hold", order: 3, color: "red", stroke: "rgba(239, 68, 68, 0.7)" },
    ],
    blips: blips.map((blip) => ({
      id: blip.ID,
      name: blip.Name,
      quadrant: blip.Quadrant,
      ring: blip.Ring,
      description: blip.Description,
      last_change: blip.LastChange,
      updated: blip.updated,
    })),
    logs: logs.map((log) => ({
      id: log.ID,
      blipId: log.BlipID,
      previousRecord: log.PreviousRecord,
      name: log.Name,
      ring: log.Ring,
      description: log.Description,
    })),
  }
}
