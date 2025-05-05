import { NextResponse } from 'next/server';

// 从环境变量中获取管理员密钥，注意这个不带NEXT_PUBLIC_前缀
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_secret_key';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    
    // 验证管理员密钥
    const isValid = key === ADMIN_KEY;
    
    if (!isValid) {
      return NextResponse.json({ success: false, message: '密钥不正确' }, { status: 401 });
    }
    
    // 简单返回成功响应，前端会通过zustand存储状态
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('验证管理员密钥时出错:', error);
    return NextResponse.json({ success: false, message: '验证失败' }, { status: 500 });
  }
} 