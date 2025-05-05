import type { RadarData, RecordChangeLog, Blip } from "./types"
import blips from "../data/blips.json"
import logs from "../data/logs.json"

export const ringRatios = [0.4, 0.3, 0.2, 0.1];

// 圈环顺序，从内到外
export const RING_ORDER = ['adopt', 'trial', 'assess', 'hold'];
export const MAX_AGE_DAYS = 30;

/**
 * 计算数据新鲜度，返回0-1之间的值
 * 0表示最新数据，1表示最旧数据
 * 使用指数函数使新鲜度随时间指数下降
 * @param date 更新日期
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

/**
 * 计算单个雷达点的移动状态
 * @param blip 雷达点
 * @param logs 该雷达点的日志记录
 * @returns 添加了movement属性的雷达点
 */
export function calculateSingleBlipMovement(blip: Blip, logs: RecordChangeLog[]): Blip {
  // 过滤出近期的日志记录（不超过MAX_AGE_DAYS天）
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.created || '');
    const diffDays = (new Date().getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= MAX_AGE_DAYS;
  });
  
  // 按创建时间排序
  recentLogs.sort((a, b) => new Date(a.created || '').getTime() - new Date(b.created || '').getTime());

  // 1. 如果有日志记录但都超过MAX_AGE_DAYS天（即没有近期日志），标记为不变
  if (recentLogs.length === 0) {
    return { ...blip, movement: 'unchanged' };
  }

  // 2. 如果近 MAX_AGE_DAYS 天有变动记录，则根据变动记录计算移动状态 moved-in 或 moved-out
  // 反向遍历logs，找到第一个变动记录
  for (let i = recentLogs.length - 1; i >= 0; i--) {
    const log = recentLogs[i];
    if (log.ring !== blip.ring) {
      const currentRingIndex = RING_ORDER.indexOf(blip.ring);
      const logRingIndex = RING_ORDER.indexOf(log.ring);
      if (currentRingIndex < logRingIndex) {
        return { ...blip, movement: 'moved-in' };
      } else {
        return { ...blip, movement: 'moved-out' };
      }
    }
  }
  // 没有变动记录

  // 如果第一条日志是在近MAX_AGE_DAYS天，且没有变更记录，标记为新增
  if (recentLogs[0].previousRecord === '') {
    return { ...blip, movement: 'new' };
  }
  return { ...blip, movement: 'unchanged' };
}

/**
 * 计算雷达点的移动状态
 * - 新增：外圈满圆环
 * - 移进：由外圈向内圈移动，外圈是朝向圆心弧线
 * - 移出：由内圈向外圈移动，外圈是背向圆心弧线
 * - 不变：无外圈
 * @param blips 雷达点数据
 * @param logs 变更日志数据
 * @returns 添加了movement属性的雷达点数据
 */
export function calculateBlipMovements(blips: Blip[]): Blip[] {
  // 计算每个雷达点的移动状态
  return blips.map(blip => {
    return calculateSingleBlipMovement(blip, blip.history || []);
  });
}

function buildBlipLogsMap(): Map<string, RecordChangeLog[]> {
  // 创建一个映射表以便快速查找日志
  const blipLogsMap = new Map<string, RecordChangeLog[]>();
  const finalLogs = logs.map((log) => ({
    id: log.ID,
    blipId: log.BlipID,
    previousRecord: log.PreviousRecord,
    name: log.Name,
    ring: log.Ring,
    description: log.Description,
    created: log.created,
    llmResult: log.LLMResult,
  }))
  
  // 按blipId对日志进行分组
  finalLogs.forEach(log => {
    if (!blipLogsMap.has(log.blipId)) {
      blipLogsMap.set(log.blipId, []);
    }
    blipLogsMap.get(log.blipId)?.push(log);
  });
  return blipLogsMap;
}

export async function fetchRadarData(): Promise<RadarData> {
  const blipLogsMap = buildBlipLogsMap();
  const finalBlips = blips.map((blip) => ({
    id: blip.ID,
    name: blip.Name,
    quadrant: blip.Quadrant,
    ring: blip.Ring,
    description: blip.Description,
    last_change: blip.LastChange,
    updated: blip.updated,
    // 按创建时间降序排序
    history: blipLogsMap.get(blip.ID)?.sort((a, b) => new Date(b.created || '').getTime() - new Date(a.created || '').getTime()) || [],
  }))

  const processedBlips = calculateBlipMovements(finalBlips);

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
    blips: processedBlips,
  }
}
