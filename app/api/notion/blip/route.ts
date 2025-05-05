import { NextResponse } from 'next/server';
import { addLogEntry } from '@/lib/notion';
import { getRadarConfigById } from '@/lib/data';

export async function POST(request: Request) {
  try {
    // 解析请求体中的数据
    const data = await request.json();
    
    // 验证必要的字段是否存在
    if (!data.name) {
      return NextResponse.json(
        { error: '缺少必要的字段：name为必填项' },
        { status: 400 }
      );
    }

    // 验证雷达ID是否存在
    if (!data.radarId) {
      return NextResponse.json(
        { error: '缺少必要的字段：radarId为必填项' },
        { status: 400 }
      );
    }
    
    // 获取雷达配置
    const radarConfig = getRadarConfigById(data.radarId);
    if (!radarConfig) {
      return NextResponse.json(
        { error: `未找到ID为 ${data.radarId} 的雷达配置` },
        { status: 400 }
      );
    }
    
    // 设置默认值
    const logData = {
      name: data.name,
      quadrant: data.quadrant, // 现在是可选的，可以为undefined
      ring: data.ring || 'assess',  // 默认为assess环
      description: data.description || ''
    };
    
    // 调用添加Log条目函数，现在包含AI分类逻辑，传入雷达配置
    const result = await addLogEntry(logData, radarConfig);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      radarId: data.radarId
    });
  } catch (error) {
    console.error('添加技术雷达节点API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '处理请求时出错';
    
    return NextResponse.json(
      { error: errorMessage },
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
        radarId: '雷达ID（必填）',
        quadrant: '象限名称（可选）',
        ring: '环名称（可选，默认为assess）',
        description: '描述（可选）'
      },
      example: {
        request: {
          name: 'Next.js',
          radarId: 'tech',
          quadrant: '语言和框架',
          ring: 'adopt',
          description: '一个用于React应用的服务端渲染框架'
        }
      }
    }
  });
} 