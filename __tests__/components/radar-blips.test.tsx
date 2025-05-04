import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RadarBlips from '@/components/radar/radar-blips';
import { Blip, Ring } from '@/lib/types';

// 模拟framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, className, style, onClick, onMouseEnter, onMouseLeave, ...props }: any) => (
        <div
          className={className}
          style={style} 
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      ),
    },
  };
});

// 模拟数据
const mockRings: Ring[] = [
  { id: 'ring1', name: '采纳', color: 'green', stroke: '#38bdf8', order: 0 },
  { id: 'ring2', name: '试验', color: 'blue', stroke: '#818cf8', order: 1 },
];

const mockBlips: Blip[] = [
  { 
    id: 'blip1-123', 
    name: 'React', 
    quadrant: 'quadrant1', 
    ring: 'ring1',
    description: 'A JavaScript library for building user interfaces',
    position: { x: 100, y: 100 }
  },
  { 
    id: 'blip2-456', 
    name: 'TypeScript', 
    quadrant: 'quadrant1', 
    ring: 'ring2',
    description: 'TypeScript is a typed superset of JavaScript',
    position: { x: 150, y: 150 }
  }
];

// 模拟回调函数
const mockOnBlipClick = jest.fn();

describe('RadarBlips', () => {
  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
  });
  
  test('渲染所有技术点', () => {
    act(() => {
      render(
        <RadarBlips
          blips={mockBlips}
          rings={mockRings}
          size={600}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 检查是否渲染了blip IDs
    expect(screen.getByText('blip1')).toBeInTheDocument();
    expect(screen.getByText('blip2')).toBeInTheDocument();
  });
  
  test('点击blip时应调用onBlipClick', () => {
    act(() => {
      render(
        <RadarBlips
          blips={mockBlips}
          rings={mockRings}
          size={600}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 找到并点击第一个blip
    const blipElement = screen.getByText('blip1');
    act(() => {
      fireEvent.click(blipElement);
    });
    
    // 验证回调是否被调用，且传入了正确的参数
    expect(mockOnBlipClick).toHaveBeenCalledTimes(1);
    expect(mockOnBlipClick).toHaveBeenCalledWith(mockBlips[0]);
  });
  
  test('鼠标悬停在blip上应显示其详细信息', () => {
    act(() => {
      render(
        <RadarBlips
          blips={mockBlips}
          rings={mockRings}
          size={600}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 初始时不应显示悬浮信息
    expect(screen.queryByText('React', { exact: true })).not.toBeInTheDocument();
    
    // 鼠标悬停在第一个blip上
    const blipContainer = screen.getByText('blip1').closest('div');
    act(() => {
      fireEvent.mouseEnter(blipContainer as HTMLElement);
    });
    
    // 应显示悬浮信息
    expect(screen.getByText('React', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('采纳')).toBeInTheDocument();
    
    // 鼠标离开后应隐藏悬浮信息
    act(() => {
      fireEvent.mouseLeave(blipContainer as HTMLElement);
    });
    expect(screen.queryByText('React', { exact: true })).not.toBeInTheDocument();
  });
  
  test('处理没有position属性的blip', () => {
    const blipsWithoutPosition = [
      { 
        id: 'blip3-789', 
        name: 'Angular', 
        quadrant: 'quadrant1', 
        ring: 'ring1',
        description: 'A platform for building mobile and desktop web applications'
      }
    ] as Blip[];
    
    act(() => {
      render(
        <RadarBlips
          blips={blipsWithoutPosition}
          rings={mockRings}
          size={600}
          onBlipClick={mockOnBlipClick}
        />
      );
    });
    
    // 应该使用默认位置(0,0)渲染
    expect(screen.getByText('blip3')).toBeInTheDocument();
  });

  test('处理在圆心的blip', () => {
    const size = 600;
    const centerPosition = size / 2;
    const blipsAtCenter = [
      { 
        id: 'blip3-789', 
        name: 'Angular', 
        quadrant: 'quadrant1', 
        ring: 'ring1',
        description: 'A platform for building mobile and desktop web applications',
        position: { x: centerPosition, y: centerPosition }
      }
    ] as Blip[];

    act(() => {
      render(
        <RadarBlips blips={blipsAtCenter} rings={mockRings} size={size} onBlipClick={mockOnBlipClick} />
      );
    });
    
    // 检查blip是否被渲染
    const blipText = screen.getByText('blip3');
    const blipContainer = blipText.closest('div');
    const blipElement = blipContainer?.parentElement;
    
    // 验证元素的位置样式
    expect(blipElement).toHaveStyle(`left: ${centerPosition}px; top: ${centerPosition}px;`);
    
    // 验证元素使用了transform来实现视觉上的居中
    expect(blipElement).toHaveClass('transform');
    expect(blipElement).toHaveClass('-translate-x-1/2');
    expect(blipElement).toHaveClass('-translate-y-1/2');
  });
}); 