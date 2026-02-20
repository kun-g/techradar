import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/session';

const PROTECTED_PATHS = [
  '/api/radar/blip',
  '/api/prompt/export',
  '/api/prompt/clear-llm-results',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token && verifyToken(token)) {
      return NextResponse.next();
    }

    return new NextResponse(
      JSON.stringify({ success: false, message: '未授权访问' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    '/api/radar/:path*',
    '/api/prompt/:path*',
  ],
};
