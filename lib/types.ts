export interface Blip {
  id: string
  name: string
  quadrant: string
  ring: string
  description: string
  rationale?: string
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
}

export interface RadarData {
  blips: Blip[]
  quadrants: Quadrant[]
  rings: Ring[]
}
