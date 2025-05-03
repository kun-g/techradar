import type { Blip, Quadrant, Ring } from "@/lib/types"
import { ringRatios } from "@/lib/data"

// Interface for blip position information
export interface BlipPosition {
  id: string
  x: number
  y: number
  quadrant: string
  ring: string
}

// Group structure to organize blips by quadrant and ring
interface BlipGroup {
  quadrantId: string
  ringId: string
  blips: Blip[]
}

/**
 * Groups blips by quadrant and ring
 */
const groupBlips = (
  blips: Blip[],
  quadrants: Quadrant[],
  rings: Ring[]
): BlipGroup[] => {
  const groups: BlipGroup[] = []

  quadrants.forEach((quadrant) => {
    rings.forEach((ring) => {
      const groupBlips = blips.filter(
        (blip) => blip.quadrant === quadrant.id && blip.ring === ring.id
      )
      if (groupBlips.length > 0) {
        groups.push({
          quadrantId: quadrant.id,
          ringId: ring.id,
          blips: groupBlips,
        })
      }
    })
  })

  return groups
}

/**
 * 使用确定性随机函数 - 基于种子值生成伪随机数
 * 保证同一个ID每次都能得到相同的随机值
 */
function seededRandom(seed: string) {
  // 创建数值种子
  let numericSeed = 0
  for (let i = 0; i < seed.length; i++) {
    numericSeed = ((numericSeed << 5) - numericSeed + seed.charCodeAt(i)) | 0
  }
  
  // 返回0-1之间的随机值
  return function() {
    const x = Math.sin(numericSeed++) * 10000
    return x - Math.floor(x)
  }
}

/**
 * 计算所有点的最优位置，使用扇形分布策略
 */
export function calculateOptimalPositions(
  blips: Blip[],
  quadrants: Quadrant[],
  rings: Ring[],
  center: number
): BlipPosition[] {
  const positions: BlipPosition[] = []
  const groups = groupBlips(blips, quadrants, rings)

  groups.forEach((group) => {
    const { quadrantId, ringId, blips: groupBlips } = group
    const quadrantIndex = quadrants.findIndex((q) => q.id === quadrantId)
    const ringIndex = rings.findIndex((r) => r.id === ringId)
    
    // 计算该象限的角度范围
    const quadrantStartAngle = (quadrantIndex * Math.PI) / 2
    const quadrantEndAngle = ((quadrantIndex + 1) * Math.PI) / 2
    
    // 添加边界内边距，避免点过于靠近象限分界线
    const anglePadding = Math.PI / 24 // 约7.5度的边界内边距
    const effectiveStartAngle = quadrantStartAngle + anglePadding
    const effectiveEndAngle = quadrantEndAngle - anglePadding
    const effectiveAngleRange = effectiveEndAngle - effectiveStartAngle

    // 计算环的半径范围
    const innerRadius = center * ringRatios.slice(0, ringIndex).reduce((sum, w) => sum + w, 0)
    const radiusRange = center * ringRatios[ringIndex]

    // 确保每个blip唯一排序，保证位置确定性
    const sortedBlips = [...groupBlips].sort((a, b) => {
      return a.id.localeCompare(b.id)
    })

    // 黄金比分割法来实现更均匀的分布
    const goldenRatio = 0.618033988749895
    
    sortedBlips.forEach((blip, index) => {
      // 根据blip的ID创建一个确定性随机生成器
      const random = seededRandom(blip.id)
      
      // 使用黄金比来计算点在圆环中的相对位置
      // 这种方法可以确保点更均匀分布
      const normalizedIndex = (index * goldenRatio) % 1.0
      
      // 添加基于ID的随机性，但保持确定性
      const angleOffset = random() * 0.5 * effectiveAngleRange / sortedBlips.length
      const angle = effectiveStartAngle + normalizedIndex * effectiveAngleRange + angleOffset
      
      // 添加基于ID的随机半径变化，使分布更自然
      const radialFactor = 0.2 + 0.7 * random() // 20%-90%的半径范围
      const radius = innerRadius + radiusRange * radialFactor

      // 计算笛卡尔坐标
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      
      blip.position = {
        x,
        y,
      }
    })
  })

  return positions
} 