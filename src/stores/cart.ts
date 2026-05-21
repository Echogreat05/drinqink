import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  product_id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  min_qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (product_id: string, qty: number) => void;
  remove: (product_id: string) => void;
  clear: () => void;
  clearVendor: (vendor_id: string) => void;
  subtotal: () => number;
  count: () => number;
  itemsByVendor: () => Record<string, CartItem[]>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.product_id === item.product_id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product_id === item.product_id ? { ...i, qty: i.qty + item.qty } : i,
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      setQty: (product_id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.product_id === product_id ? { ...i, qty: Math.max(i.min_qty, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      remove: (product_id) => set((s) => ({ items: s.items.filter((i) => i.product_id !== product_id) })),
      clear: () => set({ items: [] }),
      clearVendor: (vendor_id) => set((s) => ({ items: s.items.filter((i) => i.vendor_id !== vendor_id) })),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      itemsByVendor: () => {
        const groups: Record<string, CartItem[]> = {};
        for (const i of get().items) {
          (groups[i.vendor_id] ||= []).push(i);
        }
        return groups;
      },
    }),
    { name: "sipcellar-cart" },
  ),
);
