import { NextResponse } from 'next/server';
import { syncDatabase } from '@/lib/notion';

export async function GET(request: Request) {
  try {
    const result = await syncDatabase();
    return NextResponse.json({ 
      success: true, 
      blipCount: result.blips?.length || 0,
      logCount: result.logs?.length || 0
    });
  } catch (error) {
    console.error('Notion数据库同步API错误:', error);
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
} 