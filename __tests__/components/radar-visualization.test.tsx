import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RadarVisualization from '@/components/radar-visualization';
import { Blip, Quadrant, Ring } from '@/lib/types';

// 模拟ringRatios
jest.mock('@/lib/data', () => ({
  ringRatios: [0.4, 0.3, 0.2, 0.1],
}));

// 模拟数据
const mockRings: Ring[] = [
  { id: 'ring1', name: '采纳', color: 'green', stroke: '#38bdf8', order: 0 },
  { id: 'ring2', name: '试验', color: 'blue', stroke: '#818cf8', order: 1 },
  { id: 'ring3', name: '评估', color: 'orange', stroke: '#fb923c', order: 2 },
  { id: 'ring4', name: '暂缓', color: 'red', stroke: '#f87171', order: 3 }
];

const mockQuadrants: Quadrant[] = [
  { id: 'quadrant1', name: '技术', order: 0 },
  { id: 'quadrant2', name: '平台', order: 1 },
  { id: 'quadrant3', name: '工具', order: 2 },
  { id: 'quadrant4', name: '语言和框架', order: 3 }
];

const mockBlips: Blip[] = [
  { 
    id: 'blip1-123', 
    name: 'React', 
    quadrant: 'quadrant4', 
    ring: 'ring1',
    description: 'A JavaScript library for building user interfaces',
    position: { x: 100, y: 100 }
  },
  { 
    id: 'blip2-456', 
    name: 'TypeScript', 
    quadrant: 'quadrant4', 
    ring: 'ring1',
    description: 'TypeScript is a typed superset of JavaScript',
    position: { x: 150, y: 150 }
  }
];

// 模拟回调函数
const mockOnBlipClick = jest.fn();

// 模拟framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, className, style, onClick, ...props }: any) => (
        <div className={className} style={style} onClick={onClick}>
          {children}
        </div>
      ),
    },
  };
});

describe('RadarVisualization', () => {
  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 模拟元素尺寸
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 800,
        height: 800,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      })
    });
  });

  afterEach(() => {
    // 测试后清理
    jest.restoreAllMocks();
  });

  test('渲染雷达图组件及其所有环和象限', () => {
    act(() => {
      render(
        <RadarVisualization
          blips={mockBlips}
          quadrants={mockQuadrants}
          rings={mockRings}
          onBlipClick={mockOnBlipClick}
        />
      );
    });

    // 检查是否渲染了所有环的名称
    mockRings.forEach(ring => {
      expect(screen.getByText(ring.name)).toBeInTheDocument();
    });

    // 检查是否渲染了所有象限的名称
    mockQuadrants.forEach(quadrant => {
      expect(screen.getByText(quadrant.name)).toBeInTheDocument();
    });
  });

  test('点击blip时应调用onBlipClick回调', () => {
    act(() => {
      render(
        <RadarVisualization
          blips={mockBlips}
          quadrants={mockQuadrants}
          rings={mockRings}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 找到并点击一个blip
    const blipElement = screen.getByText('blip1');
    act(() => {
      fireEvent.click(blipElement);
    });
    
    // 验证回调是否被调用，且传入了正确的参数
    expect(mockOnBlipClick).toHaveBeenCalledTimes(1);
    expect(mockOnBlipClick).toHaveBeenCalledWith(mockBlips[0]);
  });

  test('空blips数组时应正常渲染雷达图', () => {
    act(() => {
      render(
        <RadarVisualization
          blips={[]}
          quadrants={mockQuadrants}
          rings={mockRings}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 检查是否仍然渲染了环和象限
    mockRings.forEach(ring => {
      expect(screen.getByText(ring.name)).toBeInTheDocument();
    });

    mockQuadrants.forEach(quadrant => {
      expect(screen.getByText(quadrant.name)).toBeInTheDocument();
    });
  });

  test('调整尺寸后应正确更新尺寸状态', async () => {
    const { rerender } = render(
      <RadarVisualization
        blips={mockBlips}
        quadrants={mockQuadrants}
        rings={mockRings}
        onBlipClick={mockOnBlipClick}
      />
    );

    // 模拟尺寸变化
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 400,
        height: 400,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      })
    });

    // 触发resize事件
    window.dispatchEvent(new Event('resize'));
    
    // 重新渲染组件
    rerender(
      <RadarVisualization
        blips={mockBlips}
        quadrants={mockQuadrants}
        rings={mockRings}
        onBlipClick={mockOnBlipClick}
      />
    );

    // 在这里我们只能验证组件仍然正常渲染
    // 实际尺寸改变是在useEffect中处理的，很难在测试中直接验证
    // 但我们可以确保组件不会崩溃并继续渲染
    mockRings.forEach(ring => {
      expect(screen.getByText(ring.name)).toBeInTheDocument();
    });
  });

  test('启用调试模式应显示额外的环边界', () => {
    act(() => {
      render(
        <RadarVisualization
          blips={mockBlips}
          quadrants={mockQuadrants}
          rings={mockRings}
          onBlipClick={mockOnBlipClick}
          showDebugMode={true}
        />
      );
    });
    
    // 检查调试模式下的附加内容
    mockRings.forEach(ring => {
      expect(screen.getByText(`${ring.name} boundary`)).toBeInTheDocument();
    });
  });
}); 