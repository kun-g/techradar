import { NextResponse } from 'next/server';
import { syncDatabase } from '@/lib/notion';

export async function GET(request: Request) {
  try {
    const { blips, logs } = await syncDatabase();
    return NextResponse.json({ blips, logs });
  } catch (error) {
    console.error('Notion数据库同步API错误:', error);
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
} 