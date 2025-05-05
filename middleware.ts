import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要保护的管理员API路径
const PROTECTED_PATHS = [
  '/api/notion/blip',   // 添加技术点
  '/api/notion/sync',   // 同步数据
];

// 此函数可以被标记为 `async`，如果需要等待Promise
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 如果是受保护的路径，但不是验证路径本身
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    // 获取cookie中的管理员状态
    const adminAuthCookie = request.cookies.get('admin-auth');
    
    try {
      if (adminAuthCookie) {
        const cookieValue = JSON.parse(decodeURIComponent(adminAuthCookie.value));
        // 检查cookie中的isAdmin状态
        if (cookieValue.state?.isAdmin === true) {
          // 用户已验证为管理员，允许访问
          return NextResponse.next();
        }
      }
    } catch (error) {
      console.error('解析管理员cookie失败:', error);
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