import { create } from 'zustand';
import api from '../api/client.js';

/**
 * The Scroll - the wishlist. Ids are mirrored locally so the heart can flip
 * immediately, then reconciled with whatever the server returns.
 */
export const useScroll = create((set, get) => ({
  ids: [],
  products: [],
  loading: false,

  /** Pulls the signed-in user's scroll. Safe to call when signed out. */
  load: async () => {
    set({ loading: true });
    try {
      const products = await api.getScroll();
      set({ products, ids: products.map((p) => p._id), loading: false });
    } catch {
      set({ products: [], ids: [], loading: false });
    }
  },

  clear: () => set({ ids: [], products: [] }),

  has: (productId) => get().ids.includes(productId),

  /** Optimistic toggle - flips locally first, reverts if the server refuses. */
  toggle: async (productId) => {
    const before = get().ids;
    const optimistic = before.includes(productId)
      ? before.filter((id) => id !== productId)
      : [...before, productId];
    set({ ids: optimistic });

    try {
      const { scroll } = await api.toggleScroll(productId);
      set({ ids: scroll.map(String) });
      return optimistic.includes(productId);
    } catch (error) {
      set({ ids: before });
      throw error;
    }
  },
}));

export default useScroll;
