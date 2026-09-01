import { AnimatePresence, motion } from 'framer-motion';
import useUI from '../../store/uiStore.js';

export default function Toasts() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            className={`toast ${toast.variant}`}
            onClick={() => dismiss(toast.id)}
            initial={{ opacity: 0, x: 60, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <span className="toast__mark">{toast.mark}</span>
            <span>{toast.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
