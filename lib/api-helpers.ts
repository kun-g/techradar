import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

/**
 * 处理API响应，统一处理401未授权错误
 * @param response - fetch响应对象
 * @param options - 额外选项
 * @returns 解析后的响应数据，如果出错则抛出异常
 */
export async function handleApiResponse<T>(
  response: Response, 
  options: {
    showUnauthorizedToast?: boolean;
    unauthorizedMessage?: string;
  } = {}
): Promise<T> {
  // 默认选项
  const {
    showUnauthorizedToast = true,
    unauthorizedMessage = "您的管理员会话已过期，请重新验证"
  } = options;
  
  // 如果响应成功，直接返回解析后的数据
  if (response.ok) {
    return await response.json() as T;
  }
  
  // 获取错误信息
  const errorData = await response.json().catch(() => ({}));
  
  // 处理401未授权的情况
  if (response.status === 401) {
    // 获取认证状态管理
    const { logout } = useAuth.getState();
    
    // 清除管理员状态
    logout();
    
    // 显示未授权提示
    if (showUnauthorizedToast) {
      toast({
        title: "未授权操作",
        description: unauthorizedMessage,
        variant: "destructive",
      });
    }
    
    // 抛出未授权错误
    throw new Error("未授权访问");
  }
  
  // 其他错误
  throw new Error(errorData.message || errorData.error || "请求失败");
}

/**
 * 发送带认证的API请求并处理响应
 * @param url - API URL
 * @param options - fetch选项
 * @param responseHandler - 响应处理选项
 * @returns 解析后的响应数据
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  responseHandler: {
    showUnauthorizedToast?: boolean;
    unauthorizedMessage?: string;
  } = {}
): Promise<T> {
  const { token } = useAuth.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };
  
  // 发送请求
  const response = await fetch(url, fetchOptions);
  
  // 处理响应
  return handleApiResponse<T>(response, responseHandler);
} 