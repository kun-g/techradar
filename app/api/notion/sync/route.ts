import { NextResponse } from 'next/server';
import { syncDatabase } from '@/lib/notion';

export async function GET(request: Request) {
  try {
    // 从URL参数中获取radar_id
    const { searchParams } = new URL(request.url);
    const radarId = searchParams.get('radar_id');
    
    // 验证radar_id参数是否存在
    if (!radarId) {
      return NextResponse.json(
        { error: 'radar_id参数是必选的' },
        { status: 400 }
      );
    }
    
    const result = await syncDatabase(radarId);
    
    return NextResponse.json({ 
      success: true, 
      radar_id: radarId,
      blipCount: result.blips?.length || 0,
      logCount: result.logs?.length || 0
    });
  } catch (error) {
    console.error('Notion数据库同步API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
} 