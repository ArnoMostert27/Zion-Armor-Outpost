import { create } from 'zustand';
import api, { setToken, getToken } from '../api/client.js';

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  /** Restores the session from a stored token on first paint. */
  hydrate: async () => {
    if (!getToken()) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.profile();
      set({ user, loading: false });
    } catch {
      setToken(null);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const user = await api.login({ email, password });
      setToken(user.token);
      set({ user });
      return user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ error: null });
    try {
      const user = await api.register({ name, email, password });
      setToken(user.token);
      set({ user });
      return user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      /* the cookie may already be gone - clear locally regardless */
    }
    setToken(null);
    set({ user: null });
  },

  /** Applies an XP / rank change returned by another endpoint. */
  applyProgress: ({ xp, rank, newBadges = [] }) => {
    const user = get().user;
    if (!user) return;
    set({
      user: {
        ...user,
        xp: xp ?? user.xp,
        rank: rank ?? user.rank,
        badges: newBadges.length
          ? [...user.badges, ...newBadges.map((key) => ({ key, name: key, earnedAt: new Date() }))]
          : user.badges,
      },
    });
  },

  isKeeper: () => get().user?.role === 'keeper',
}));

export default useAuth;
