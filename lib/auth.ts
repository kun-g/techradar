import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 默认管理密钥，实际应用中应该使用环境变量
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin_secret_key';

interface AuthState {
  isAdmin: boolean;
  setAdminStatus: (status: boolean) => void;
  logout: () => void;
}

// 使用zustand创建一个持久化的状态管理
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      setAdminStatus: (status: boolean) => set({ isAdmin: status }),
      logout: () => set({ isAdmin: false }),
    }),
    {
      name: 'admin-auth',
    }
  )
); 