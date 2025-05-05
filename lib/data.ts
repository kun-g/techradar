import type { RadarData, RecordChangeLog } from "./types"
import blips from "../data/blips.json"
import logs from "../data/logs.json"

export const ringRatios = [0.4, 0.3, 0.2, 0.1];
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
