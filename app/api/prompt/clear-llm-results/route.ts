import { NextResponse } from 'next/server';
import { getRadarConfigById, getDefaultRadarConfig } from '@/lib/data';
import { clearLlmResults } from '@/lib/sqlite-db';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const radarId = searchParams.get('radar_id');

    const radarConfig = radarId
      ? getRadarConfigById(radarId)
      : getDefaultRadarConfig();

    if (!radarConfig) {
      return NextResponse.json(
        { error: `未找到ID为 ${radarId} 的雷达配置` },
        { status: 400 }
      );
    }

    const count = clearLlmResults(radarConfig.id);

    return NextResponse.json({
      success: true,
      radarId: radarConfig.id,
      radarName: radarConfig.name,
      message: `已清空雷达 "${radarConfig.name}" 的 ${count} 条记录的LLMResult字段`,
    });
  } catch (error) {
    console.error('清空LLMResult数据时出错:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
}
