import { NextResponse } from 'next/server';
import { editBlip } from '@/lib/radar-service';
import { getRadarConfigById } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.blipId || !data.name || !data.quadrant) {
      return NextResponse.json(
        { error: '缺少必要的字段：blipId、name和quadrant为必填项' },
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

    if (!data.ring) {
      return NextResponse.json(
        { error: '必须提供环(ring)的值' },
        { status: 400 }
      );
    }

    const hasRingChange = data.prevRing !== data.ring;
    const hasDescriptionChange = data.prevDescription !== data.description;
    const hasTagsChange = data.tags && JSON.stringify(data.prevTags) !== JSON.stringify(data.tags);
    const hasAliasesChange = data.aliases && JSON.stringify(data.prevAliases) !== JSON.stringify(data.aliases);

    if (!hasRingChange && !hasDescriptionChange && !hasTagsChange && !hasAliasesChange) {
      return NextResponse.json(
        { error: '没有检测到任何变化，请至少修改一项内容' },
        { status: 400 }
      );
    }

    const blip = editBlip({
      blipId: data.blipId,
      name: data.name,
      quadrant: data.quadrant,
      ring: data.ring,
      description: data.description || '',
      prevRing: data.prevRing,
      prevDescription: data.prevDescription,
      tags: data.tags || [],
      prevTags: data.prevTags || [],
      aliases: data.aliases || [],
      prevAliases: data.prevAliases || [],
    }, radarConfig);

    return NextResponse.json({
      success: true,
      data: blip,
      radarId: data.radarId,
    });
  } catch (error) {
    console.error('编辑Blip记录API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '处理请求时出错';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
