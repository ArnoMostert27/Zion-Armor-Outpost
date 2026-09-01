import { create } from 'zustand';
import { setSoundEnabled } from '../lib/sound.js';

const readTheme = () => {
  try {
    return localStorage.getItem('zao.theme') || 'night';
  } catch {
    return 'night';
  }
};

let toastId = 0;

export const useUI = create((set, get) => ({
  theme: readTheme(),
  soundOn: false,
  toasts: [],
  mobileNavOpen: false,
  celebration: null,

  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme === 'day' ? 'day' : '';
    try {
      localStorage.setItem('zao.theme', theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },

  toggleTheme: () => get().setTheme(get().theme === 'night' ? 'day' : 'night'),

  toggleSound: () => {
    const soundOn = !get().soundOn;
    setSoundEnabled(soundOn);
    set({ soundOn });
  },

  setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),

  /** Fires the full-screen badge unlock. Only the first badge is shown. */
  celebrate: (badgeKey) => {
    if (!badgeKey) return;
    set({ celebration: Array.isArray(badgeKey) ? badgeKey[0] : badgeKey });
  },

  clearCelebration: () => set({ celebration: null }),

  /** Fires a comic-styled toast. Auto-dismisses. */
  toast: (message, { mark = 'POW!', variant = '' } = {}) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, mark, variant }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3600);
  },

  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export default useUI;
