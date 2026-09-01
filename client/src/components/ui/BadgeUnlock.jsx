import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useUI from '../../store/uiStore.js';
import { BadgeMark } from './Sigils.jsx';
import { sfx } from '../../lib/sound.js';

const NAMES = {
  'first-blood': 'First Blood',
  'goliath-slayer': 'Goliath Slayer',
  'full-plate': 'Full Plate',
  scribe: 'Scribe',
  'faithful-watch': 'Faithful Watch',
  collector: 'Collector',
};

/**
 * Full-screen celebration when a badge unlocks. Driven from the UI store so any
 * page can fire it: useUI.getState().celebrate('full-plate').
 */
export default function BadgeUnlock() {
  const badge = useUI((s) => s.celebration);
  const dismiss = useUI((s) => s.clearCelebration);

  useEffect(() => {
    if (!badge) return;
    sfx.unsheathe();
    const timer = setTimeout(dismiss, 4200);
    return () => clearTimeout(timer);
  }, [badge, dismiss]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="unlock"
          onClick={dismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="speedlines" style={{ opacity: 0.5 }} />

          <motion.div
            className="unlock__inner"
            initial={{ scale: 0.2, rotate: -18, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          >
            <div className="unlock__star burst-star">
              <BadgeMark badge={badge} className="unlock__mark" />
            </div>

            <motion.span
              className="burst"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.24 }}
            >
              BADGE UNLOCKED!
            </motion.span>

            <motion.h2
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.34 }}
            >
              {NAMES[badge] || badge}
            </motion.h2>

            <motion.p
              className="text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.46 }}
            >
              Tap anywhere to carry on.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
