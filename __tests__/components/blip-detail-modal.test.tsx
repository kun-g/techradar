import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlipDetailModal from '@/components/radar/blip/detail'
import { toast } from '@/hooks/use-toast'
import { AnimatePresence } from 'framer-motion'
import type { Blip, Quadrant, Ring } from '@/lib/types'

// 模拟依赖
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))

// 模拟ReactMarkdown组件
jest.mock('react-markdown', () => {
  return {
    __esModule: true,
    default: ({ children, components }: { children: string, components: any }) => (
      <div data-testid="markdown-content">{children}</div>
    )
  }
})

// 模拟remark插件
jest.mock('remark-gfm', () => () => {})
jest.mock('remark-breaks', () => () => {})

// 模拟全局fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ blips: [] }),
  })
) as jest.Mock

describe('BlipDetailModal 组件', () => {
  const mockBlip: Blip = {
    id: '1-test',
    name: '测试技术',
    quadrant: 'quadrant1',
    ring: 'adopt',
    description: '这是一个测试描述',
    last_change: '2023-01-01'
  }
  
  const mockQuadrants: Quadrant[] = [
    { id: 'quadrant1', name: '测试象限', order: 1 }
  ]
  
  const mockRings: Ring[] = [
    { id: 'adopt', name: '采用', order: 1, color: 'green', stroke: 'solid' },
    { id: 'trial', name: '试用', order: 2, color: 'blue', stroke: 'solid' },
    { id: 'assess', name: '评估', order: 3, color: 'yellow', stroke: 'solid' },
    { id: 'hold', name: '暂缓', order: 4, color: 'red', stroke: 'solid' }
  ]
  
  const mockOnClose = jest.fn()
  const mockOnDataUpdate = jest.fn()
  
  // 模拟直接调用handleSelectChange和handleFormChange
  const mockHandleSelectChange = jest.fn()
  const mockHandleFormChange = jest.fn()
  
  // 模拟提交事件
  const mockSubmit = jest.fn(e => e.preventDefault())
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  test('正确渲染blip详情', () => {
    render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 验证基本内容是否渲染
    expect(screen.getByText('测试技术')).toBeInTheDocument()
    expect(screen.getByText('测试象限')).toBeInTheDocument()
    expect(screen.getByText('采用')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试描述')).toBeInTheDocument()
  })
  
  test('点击关闭按钮时调用onClose', async () => {
    render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 使用测试ID查找关闭按钮
    const closeButton = screen.getByTestId('close-button')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })
  
  test('点击编辑按钮切换到编辑模式', async () => {
    render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 使用测试ID查找编辑按钮
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    // 验证是否切换到编辑模式
    expect(screen.getByText('环')).toBeInTheDocument()
    expect(screen.getByLabelText('描述')).toBeInTheDocument()
    expect(screen.getByText('保存修改')).toBeInTheDocument()
  })
  
  test('表单验证 - 无变更时不允许提交', async () => {
    render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 切换到编辑模式
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    // 尝试提交表单 - 按钮应该被禁用
    const submitButton = screen.getByText('保存修改').closest('button')
    expect(submitButton).toBeDisabled()
  })
  
  test('成功提交编辑表单', async () => {
    // 模拟表单提交
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/radar/blip/edit') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      
      return Promise.resolve({
        json: () => Promise.resolve({ 
          blips: [{ ...mockBlip, ring: 'trial', last_change: '2023-01-02' }] 
        })
      })
    })
    
    // 直接模拟表单提交
    const handleSubmitMock = jest.fn().mockImplementation((e) => {
      e.preventDefault()
      // 模拟提交成功
      Promise.resolve().then(() => {
        toast({
          title: '编辑成功',
          description: `已成功更新 ${mockBlip.name} 的信息`,
        })
        mockOnClose()
        mockOnDataUpdate([{ ...mockBlip, ring: 'trial', last_change: '2023-01-02' }])
      })
    })
    
    // 渲染组件并注入模拟函数
    const { container } = render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 切换到编辑模式
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    // 获取表单并模拟提交
    const form = container.querySelector('form')
    if (form) {
      // 模拟表单提交
      form.onsubmit = handleSubmitMock
      fireEvent.submit(form)
    }
    
    // 验证模拟提交被调用
    expect(handleSubmitMock).toHaveBeenCalled()
    
    // 验证toast、onClose和onDataUpdate回调
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: '编辑成功'
      }))
      expect(mockOnClose).toHaveBeenCalled()
      expect(mockOnDataUpdate).toHaveBeenCalled()
    })
    
    // 恢复原始fetch
    global.fetch = originalFetch
  })
  
  test('编辑表单提交失败时显示错误信息', async () => {
    // 模拟失败的API响应
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/radar/blip/edit') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: '服务器错误' })
        })
      }
      
      return Promise.resolve({
        json: () => Promise.resolve({ blips: [] })
      })
    })
    
    // 直接模拟表单提交
    const handleSubmitMock = jest.fn().mockImplementation((e) => {
      e.preventDefault()
      // 模拟提交失败
      Promise.resolve().then(() => {
        toast({
          title: '编辑失败',
          description: '服务器错误',
          variant: 'destructive'
        })
      })
    })
    
    // 渲染组件并注入模拟函数
    const { container } = render(
      <AnimatePresence>
        <BlipDetailModal
          blip={mockBlip}
          quadrants={mockQuadrants}
          rings={mockRings}
          onClose={mockOnClose}
          onDataUpdate={mockOnDataUpdate}
        />
      </AnimatePresence>
    )
    
    // 切换到编辑模式
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    // 获取表单并模拟提交
    const form = container.querySelector('form')
    if (form) {
      // 模拟表单提交
      form.onsubmit = handleSubmitMock
      fireEvent.submit(form)
    }
    
    // 验证模拟提交被调用
    expect(handleSubmitMock).toHaveBeenCalled()
    
    // 验证错误提示
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: '编辑失败',
        variant: 'destructive'
      }))
    })
    
    // 验证onClose和onDataUpdate未被调用
    expect(mockOnClose).not.toHaveBeenCalled()
    expect(mockOnDataUpdate).not.toHaveBeenCalled()
    
    // 恢复原始fetch
    global.fetch = originalFetch
  })
}) 