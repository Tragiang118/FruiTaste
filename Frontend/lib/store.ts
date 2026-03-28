import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
  id: number;
  email: string;
  fullName?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { email: string; password: string; fullName: string }) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định true để check auth khi load trang

  login: async ({ email, password }) => {
    try {
      // Không gán isLoading=true ở đây để tránh GuestGuard ẩn form
      // set({ isLoading: true });
      await api.post('/auth/login', { email, password });
      // Sau khi login thành công, gọi lại profile để lấy thông tin user
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // set({ isLoading: false });
      throw error;
    }
  },

  register: async ({ email, password, fullName }) => {
    try {
      // set({ isLoading: true });
      const res = await api.post('/auth/register', { email, password, fullName });
      return res.data;
      // Register không tự động login, nên không đổi state auth
      // set({ isLoading: false });
    } catch (error) {
      // set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
       // Nếu 401 hoặc lỗi khác nghĩa là chưa auth
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));