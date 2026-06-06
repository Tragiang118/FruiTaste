import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  avatar?: string | null;
  addresses?: any[];
  mustChangePassword?: boolean;
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
  isLoading: true, 

  login: async ({ email, password }) => {
    try {
      const loginRes = await api.post('/auth/login', { email, password });
      // Sau khi login thành công, gọi lại profile để lấy thông tin user
      const res = await api.get('/auth/profile');
      const userData = { ...res.data, mustChangePassword: loginRes.data.mustChangePassword || false };
      set({ user: userData, isAuthenticated: true, isLoading: false });
      
      const cartRes = await api.get('/cart');
      useCartStore.getState().overwriteItems(cartRes.data.items);
      // Mặc định chọn tất cả khi mới tải giỏ hàng
      useCartStore.getState().setSelectedIds(cartRes.data.items.map((i: any) => i.id));
    } catch (error) {
      throw error;
    }
  },

  register: async ({ email, password, fullName }) => {
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
      useCartStore.getState().clearCartLocally();
      useCartStore.getState().setSelectedIds([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
      
      const cartRes = await api.get('/cart');
      useCartStore.getState().overwriteItems(cartRes.data.items);
      // Mặc định chọn tất cả khi mới tải giỏ hàng
      useCartStore.getState().setSelectedIds(cartRes.data.items.map((i: any) => i.id));
    } catch (error) {
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
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartLocally: () => void;
  overwriteItems: (items: CartItem[]) => void;
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}

export const useCartStore = create<CartState>()(
  (set, get) => ({
    items: [],
    selectedIds: [],
    overwriteItems: (items) => set({ items }),
    clearCartLocally: () => set({ items: [] }),
    setSelectedIds: (ids) => set({ selectedIds: ids }),
    
    addItem: async (item) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return; 

      try {
        const res = await api.post('/cart', { productId: item.id, quantity: item.quantity });
        set({ 
          items: res.data.items,
          selectedIds: [...get().selectedIds, item.id]
        });
      } catch (e) {
        console.error('Add cart failed', e);
      }
    },

    removeItem: async (id) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;

      try {
        const res = await api.delete(`/cart/${id}`);
        set({ 
          items: res.data.items,
          selectedIds: get().selectedIds.filter(sid => sid !== id)
        });
      } catch (e) {
        console.error('Remove cart item failed', e);
      }
    },

    updateQuantity: async (id, quantity) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;

      try {
        const res = await api.put(`/cart/${id}`, { quantity });
        set({ items: res.data.items });
      } catch (e) {
        console.error('Update cart quantity failed', e);
      }
    },

    clearCart: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        set({ items: [] });
        return;
      }

      try {
        await api.delete('/cart');
        set({ items: [] });
      } catch (e) {
        console.error('Clear cart failed', e);
      }
    },
  })
);