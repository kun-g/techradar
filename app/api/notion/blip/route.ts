import { NextResponse } from 'next/server';
import { addLogEntry } from '@/lib/notion';

export async function POST(request: Request) {
  try {
    // 解析请求体中的数据
    const data = await request.json();
    
    // 验证必要的字段是否存在
    if (!data.name || !data.quadrant) {
      return NextResponse.json(
        { error: '缺少必要的字段：name和quadrant为必填项' },
        { status: 400 }
      );
    }
    
    // 设置默认值
    const logData = {
      name: data.name,
      quadrant: data.quadrant,
      ring: data.ring || 'assess', // 默认为assess环
      description: data.description || '',
    };
    
    // 调用添加Log条目函数
    const result = await addLogEntry(logData);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('添加技术雷达节点API错误:', error);
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
}

// 获取API文档
export async function GET() {
  return NextResponse.json({
    documentation: {
      endpoint: '/api/notion/blip',
      method: 'POST',
      description: '添加新的技术雷达节点到日志数据库',
      requestBody: {
        name: '节点名称（必填）',
        quadrant: '象限名称（必填）',
        ring: '环名称（可选，默认为assess）',
        description: '描述（可选）'
      },
      example: {
        request: {
          name: 'Next.js',
          quadrant: '语言和框架',
          ring: 'adopt',
          description: '一个用于React应用的服务端渲染框架'
        }
      }
    }
  });
} 