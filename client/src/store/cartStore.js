import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * The Satchel. Persisted per browser so a refresh does not empty it.
 * Prices here are for display only - the server reprices every order.
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      lastAdded: null,

      setOpen: (open) => set({ open }),
      toggle: () => set({ open: !get().open }),

      add: (product, qty = 1) => {
        const items = [...get().items];
        const index = items.findIndex((i) => i.product === product._id);
        if (index >= 0) {
          items[index] = { ...items[index], qty: items[index].qty + qty };
        } else {
          items.push({
            product: product._id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            coverImage: product.coverImage,
            armorSlot: product.armorSlot,
            qty,
          });
        }
        set({ items, lastAdded: product._id });
      },

      addMany: (products) => {
        products.forEach((p) => get().add(p, 1));
      },

      setQty: (productId, qty) => {
        if (qty <= 0) return get().remove(productId);
        set({
          items: get().items.map((i) => (i.product === productId ? { ...i, qty } : i)),
        });
      },

      remove: (productId) => set({ items: get().items.filter((i) => i.product !== productId) }),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      /** Which armor slots the satchel currently covers. */
      slotsCovered: () => [...new Set(get().items.map((i) => i.armorSlot))],

      /** Payload shape the order endpoints expect. */
      payload: () => get().items.map((i) => ({ product: i.product, qty: i.qty })),
    }),
    { name: 'zao.satchel', partialize: (state) => ({ items: state.items }) }
  )
);

export default useCart;
