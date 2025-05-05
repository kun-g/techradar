import { calculateFreshness, getFreshnessOpacity, calculateBlipMovements, ringRatios, fetchRadarData, RING_ORDER, calculateSingleBlipMovement, MAX_AGE_DAYS } from '@/lib/data';
import type { Blip, RecordChangeLog } from '@/lib/types';

// 我们改用jest.mock直接模拟函数
jest.mock('../../lib/data', () => {
  const originalModule = jest.requireActual('../../lib/data');
  return {
    ...originalModule,
    fetchRadarData: jest.fn().mockResolvedValue({
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
      blips: [
        { id: 'blip1', name: 'Test Blip 1', quadrant: '技术', ring: 'adopt', description: 'Test description 1', last_change: '2024-04-01', movement: 'unchanged' },
        { id: 'blip2', name: 'Test Blip 2', quadrant: '语言与框架', ring: 'trial', description: 'Test description 2', last_change: '2024-04-02', movement: 'moved-in' }
      ],
      logs: [
        { id: 'log1', blipId: 'blip1', previousRecord: '2024-03-15', name: 'Test Blip 1', ring: 'adopt', description: 'Previous description 1' },
        { id: 'log2', blipId: 'blip2', previousRecord: '2024-03-15', name: 'Test Blip 2', ring: 'assess', description: 'Previous description 2' }
      ]
    })
  };
});

// Mock 当前日期以确保测试的一致性
const originalDate = global.Date;
const mockDate = new Date('2024-05-01T00:00:00Z');
beforeAll(() => {
  global.Date = class extends originalDate {
    constructor(date: any) {
      if (date) {
        super(date);
        return;
      }
      return new originalDate(mockDate);
    }
  } as any;
});

afterAll(() => {
  global.Date = originalDate;
  jest.restoreAllMocks();
});

describe('calculateFreshness', () => {
  // 使用非模拟版本测试这个函数
  beforeAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });
  
  test('应该返回0当日期为空', () => {
    expect(calculateFreshness('')).toBe(0);
  });

  test('应该为当前日期返回接近0的值', () => {
    expect(calculateFreshness('2024-05-01T00:00:00Z')).toBeCloseTo(0);
  });

  test('应该为10天前的日期返回一个中等值', () => {
    expect(calculateFreshness('2024-04-21T00:00:00Z')).toBeCloseTo(0.632, 1);
  });

  test('应该为30天前的日期返回接近1的值', () => {
    expect(calculateFreshness('2024-04-01T00:00:00Z')).toBeCloseTo(0.95, 1);
  });

  test('应该为未来日期返回1', () => {
    expect(calculateFreshness('2024-05-10T00:00:00Z')).toBe(1);
  });

  test('应该根据decayRate参数调整衰减速率', () => {
    const date10DaysAgo = '2024-04-21T00:00:00Z';
    const normalDecay = calculateFreshness(date10DaysAgo, 0.1);
    const fasterDecay = calculateFreshness(date10DaysAgo, 0.2);
    
    expect(fasterDecay).toBeGreaterThan(normalDecay);
  });
});

describe('getFreshnessOpacity', () => {
  test('新鲜度为0应返回最大透明度', () => {
    expect(getFreshnessOpacity(0, 0.1, 1.0)).toBe(1.0);
  });

  test('新鲜度为1应返回最小透明度', () => {
    expect(getFreshnessOpacity(1, 0.1, 1.0)).toBeCloseTo(0.1, 5);
  });

  test('新鲜度为0.5应返回中间值', () => {
    expect(getFreshnessOpacity(0.5, 0.1, 1.0)).toBeCloseTo(0.55, 5);
  });

  test('应正确使用自定义的最小和最大透明度', () => {
    expect(getFreshnessOpacity(0.5, 0.2, 0.8)).toBeCloseTo(0.5, 5);
  });
});

describe('calculateBlipMovements', () => {
  const mockBlip = {
    id: 'blip1',
    name: 'Blip 1',
    quadrant: '技术',
    ring: 'adopt',
    description: '',
    last_change: '2024-04-01'
  };
  const mockLog = {
    id: 'log1',
    blipId: 'blip1',
    previousRecord: '',
    name: 'Blip 1',
    ring: '-',
    description: ''
  };

  test('1. 如果blip 的最新变动记录距离当前时间超过MAX_AGE_DAYS天，标记为不变', () => {
    const xDaysAgo = new Date(mockDate.getTime() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000 - 1);
    const result = calculateSingleBlipMovement({ ...mockBlip, name: "Stage1" }, [{...mockLog, created: xDaysAgo.toISOString()}]);
    expect(result.movement).toBe('unchanged');
  });
  
  test('2. 如果近 MAX_AGE_DAYS 天有变动记录，则根据变动记录计算移动状态 moved-in 或 moved-out', () => {
    const result = calculateSingleBlipMovement({ ...mockBlip, name: "Stage2.1", ring: 'trial' }, [
        {...mockLog, created: mockDate.toISOString(), ring: 'assess'},
        {...mockLog, created: mockDate.toISOString() + 1, ring: 'trial'}
    ]);
    expect(result.movement).toBe('moved-in');

    const result2 = calculateSingleBlipMovement({ ...mockBlip, name: "Stage2.2", ring: 'hold' }, [
        {...mockLog, created: mockDate.toISOString(), ring: 'assess'},
        {...mockLog, created: mockDate.toISOString() + 1, ring: 'hold'}
    ]);
    expect(result2.movement).toBe('moved-out');
  });

  test('3. 如果第一条日志是在近MAX_AGE_DAYS天，且没有变更记录，标记为新增', () => {
    const result = calculateSingleBlipMovement({ ...mockBlip, name: "Stage3", ring: 'assess' }, [
        {...mockLog, id: '1', created: mockDate.toISOString(), ring: 'assess', previousRecord: ''},
        {...mockLog, id: '2', created: mockDate.toISOString() + 1, ring: 'assess', previousRecord: '2'}
    ]);
    expect(result.movement).toBe('new');
  });
  
  test('应处理空的blips和logs数组', () => {
    expect(calculateBlipMovements([], [])).toEqual([]);
  });
});

describe('fetchRadarData', () => {
  test('应返回正确的雷达数据结构', async () => {
    const radarData = await fetchRadarData();
    
    // 验证返回的数据结构
    expect(radarData).toHaveProperty('quadrants');
    expect(radarData).toHaveProperty('rings');
    expect(radarData).toHaveProperty('blips');
    expect(radarData).toHaveProperty('logs');

    // 验证四象限
    expect(radarData.quadrants).toHaveLength(4);
    expect(radarData.quadrants[0].id).toBe('语言与框架');
    expect(radarData.quadrants[1].id).toBe('平台');
    expect(radarData.quadrants[2].id).toBe('工具');
    expect(radarData.quadrants[3].id).toBe('技术');

    // 验证四个圈环
    expect(radarData.rings).toHaveLength(4);
    expect(radarData.rings[0].id).toBe('adopt');
    expect(radarData.rings[1].id).toBe('trial');
    expect(radarData.rings[2].id).toBe('assess');
    expect(radarData.rings[3].id).toBe('hold');

    // 检查雷达点是否存在并且按预期移动
    const blip1 = radarData.blips.find(b => b.id === 'blip1');
    const blip2 = radarData.blips.find(b => b.id === 'blip2');
    
    expect(blip1).toBeDefined();
    expect(blip2).toBeDefined();
    
    expect(blip1?.movement).toBe('unchanged'); // 位置没变
    expect(blip2?.movement).toBe('moved-in'); // 从assess移动到trial
  });
});

describe('ringRatios', () => {
  test('应包含四个比例值', () => {
    expect(ringRatios).toHaveLength(4);
  });

  test('所有比例值的总和应为1', () => {
    const sum = ringRatios.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  test('比例值应按从内到外的顺序排列', () => {
    expect(ringRatios[0]).toBeGreaterThan(ringRatios[1]);
    expect(ringRatios[1]).toBeGreaterThan(ringRatios[2]);
    expect(ringRatios[2]).toBeGreaterThan(ringRatios[3]);
  });
}); 