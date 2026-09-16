import { create } from 'zustand';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

const STORAGE_KEY = 'bizcatalog_cart_items';

const getInitialItems = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveItems = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialItems(),
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  addItem: (product, quantity = 1) => {
    const current = get().items;
    const existingIndex = current.findIndex((i) => i.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...current, { product, quantity }];
    }

    saveItems(updated);
    set({ items: updated, isOpen: true }); // Open cart drawer on add!
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.product.id !== productId);
    saveItems(updated);
    set({ items: updated });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    saveItems(updated);
    set({ items: updated });
  },

  clearCart: () => {
    saveItems([]);
    set({ items: [] });
  },

  getTotalCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalAmount: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },
}));
