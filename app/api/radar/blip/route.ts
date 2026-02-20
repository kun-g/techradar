import { NextResponse } from 'next/server';
import { addBlip } from '@/lib/radar-service';
import { getRadarConfigById } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: '缺少必要的字段：name为必填项' },
        { status: 400 }
      );
    }

    if (!data.radarId) {
      return NextResponse.json(
        { error: '缺少必要的字段：radarId为必填项' },
        { status: 400 }
      );
    }

    const radarConfig = getRadarConfigById(data.radarId);
    if (!radarConfig) {
      return NextResponse.json(
        { error: `未找到ID为 ${data.radarId} 的雷达配置` },
        { status: 400 }
      );
    }

    const blip = await addBlip({
      name: data.name,
      quadrant: data.quadrant,
      ring: data.ring || 'assess',
      description: data.description || '',
    }, radarConfig);

    return NextResponse.json({
      success: true,
      data: blip,
      radarId: data.radarId,
    });
  } catch (error) {
    console.error('添加技术雷达节点API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '处理请求时出错';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
