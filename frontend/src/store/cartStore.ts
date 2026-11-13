import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  image?: string;
  quantity: number;
  maxStock: number;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      updateQuantity: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === id
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.promotionalPrice ?? i.price) * i.quantity,
          0
        ),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'eterna-cart' }
  )
);
