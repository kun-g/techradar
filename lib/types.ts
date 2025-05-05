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
}

export interface RecordChangeLog {
  id: string
  blipId: string
  previousRecord: string
  name: string
  ring: string
  description: string
  created?: string
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
}
