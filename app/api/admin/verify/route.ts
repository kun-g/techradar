import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/session';

const ADMIN_KEY = process.env.ADMIN_KEY;

export async function POST(request: Request) {
  try {
    if (!ADMIN_KEY) {
      return NextResponse.json({ success: false, message: '管理员功能未配置' }, { status: 503 });
    }

    const { key } = await request.json();

    if (key !== ADMIN_KEY) {
      return NextResponse.json({ success: false, message: '密钥不正确' }, { status: 401 });
    }

    const token = generateToken();
    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('验证管理员密钥时出错:', error);
    return NextResponse.json({ success: false, message: '验证失败' }, { status: 500 });
  }
} 