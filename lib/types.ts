export interface Blip {
  id: string
  name: string
  quadrant: string
  ring: string
  description: string
  last_change: string
  updated?: string
  movement?: 'new' | 'moved-in' | 'moved-out' | 'unchanged'
  history?: RecordChangeLog[]
  position?: {
    x: number
    y: number
  }
  tags?: string[]
  aliases?: string[]
}

export interface RecordChangeLog {
  id: string
  blipId: string
  previousRecord: string
  name: string
  ring: string
  description: string
  created?: string
  llmResult?: string
  tags?: string[]
  aliases?: string[]
}

export interface Quadrant {
  id: string
  name: string
  order: number
}

export interface Ring {
  id: string
  name: string
  order: number
  color: string
  stroke: string
}

export interface RadarData {
  blips: Blip[]
  quadrants: Quadrant[]
  rings: Ring[]
  radarId: string
  radarName: string
  availableTags?: string[]
}

// 雷达配置类型
export interface RadarConfig {
  id: string
  name: string
  quadrants: string[]
  tags: string[]
  prompt_id: string
}
