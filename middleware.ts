import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要保护的管理员API路径
const PROTECTED_PATHS = [
  '/api/notion/blip',   // 添加技术点
  '/api/notion/sync',   // 同步数据
  '/api/prompt/export', // 导出Prompt数据
];

// 此函数可以被标记为 `async`，如果需要等待Promise
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 如果是受保护的路径，但不是验证路径本身
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    // 只检查请求头中的X-Admin-Auth
    const headerAuth = request.headers.get('X-Admin-Auth');
    
    // 如果认证头为true，允许访问
    if (headerAuth === 'true') {
      return NextResponse.next();
    }
    
    // 未验证为管理员，返回未授权错误
    return new NextResponse(
      JSON.stringify({ success: false, message: '未授权访问' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 不需要保护的路径，直接通过
  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    '/api/notion/:path*',
  ],
}; 