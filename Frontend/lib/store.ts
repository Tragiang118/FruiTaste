import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: number;
  email: string;
  fullName?: string;
  role: string;
  avatar?: string | null;
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
      await api.post('/auth/login', { email, password });
      // Sau khi login thành công, gọi lại profile để lấy thông tin user
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      throw error;
    }
  },

  register: async ({ email, password, fullName }) => {
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      return res.data;
      // Register không tự động login, nên không đổi state auth
    } catch (error) {
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

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stockQuantity) } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),      
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fruitaste-cart-storage',
    }
  )
);