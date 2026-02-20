import { NextResponse } from 'next/server';
import { getAllBlips, getAllLogs } from '@/lib/sqlite-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const radarId = searchParams.get('radar_id');

    if (!radarId) {
      return NextResponse.json(
        { error: 'radar_id参数是必选的' },
        { status: 400 }
      );
    }

    const blips = getAllBlips(radarId);
    const logs = getAllLogs(radarId);

    return NextResponse.json({ blips, logs });
  } catch (error) {
    console.error('获取雷达数据错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
}
