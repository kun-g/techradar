import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAdmin: boolean;
  token: string | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      token: null,
      setAuth: (token: string) => set({ isAdmin: true, token }),
      logout: () => set({ isAdmin: false, token: null }),
    }),
    {
      name: 'admin-auth',
    }
  )
);
