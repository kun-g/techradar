import { NextResponse } from 'next/server';
import { createBlipEditLog } from '@/lib/notion';

export async function POST(request: Request) {
  try {
    // 解析请求体中的数据
    const data = await request.json();
    
    // 验证必要的字段是否存在
    if (!data.blipId || !data.name || !data.quadrant) {
      return NextResponse.json(
        { error: '缺少必要的字段：blipId、name和quadrant为必填项' },
        { status: 400 }
      );
    }

    // 验证修改数据是否合法
    if (!data.ring) {
      return NextResponse.json(
        { error: '必须提供环(ring)的值' },
        { status: 400 }
      );
    }

    // 验证是否有变化
    if (data.prevRing === data.ring && data.prevDescription === data.description) {
      return NextResponse.json(
        { error: '没有检测到任何变化，请至少修改一项内容' },
        { status: 400 }
      );
    }
    
    // 设置完整数据
    const editData = {
      blipId: data.blipId,
      name: data.name,
      quadrant: data.quadrant,
      ring: data.ring,
      description: data.description || '',
      prevRing: data.prevRing,
      prevDescription: data.prevDescription
    };
    
    // 调用创建Blip编辑记录函数
    const result = await createBlipEditLog(editData);
    
    return NextResponse.json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    console.error('编辑Blip记录API错误:', error);
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
      endpoint: '/api/notion/blip/edit',
      method: 'POST',
      description: '编辑现有的Blip节点并创建修改记录',
      requestBody: {
        blipId: 'Blip ID（必填）',
        name: '节点名称（必填）',
        quadrant: '象限名称（必填）',
        ring: '环名称（必填）',
        description: '描述（可选）',
        prevRing: '之前的环名称',
        prevDescription: '之前的描述'
      },
      example: {
        request: {
          blipId: "abc123",
          name: "Next.js",
          quadrant: "语言和框架",
          ring: "adopt",
          description: "一个用于React应用的服务端渲染框架",
          prevRing: "trial",
          prevDescription: "一个用于构建React应用的框架"
        }
      }
    }
  });
} 