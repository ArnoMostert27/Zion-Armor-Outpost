import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCart from '../../store/cartStore.js';
import { ARMOR } from '../../data/armor.js';
import { ArmorIcon } from '../ui/Sigils.jsx';

export default function ArmorTeaser() {
  // Select the raw array and derive here. Returning a freshly built array from a
  // zustand selector gives React a new snapshot on every render, which trips the
  // "getSnapshot should be cached" infinite loop.
  const items = useCart((s) => s.items);
  const covered = useMemo(() => [...new Set(items.map((i) => i.armorSlot))], [items]);

  return (
    <div className="teaser">
      <motion.div
        className="teaser__slots"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {ARMOR.map((piece, index) => (
          <motion.div
            key={piece.key}
            className={`slot-chip ${covered.includes(piece.key) ? 'is-filled' : ''}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.5 }}
          >
            <ArmorIcon piece={piece.key} className="badge__mark" />
            {piece.short}
          </motion.div>
        ))}
      </motion.div>

      <div className="stack">
        <span className="section-head__eyebrow">Six pieces. One stand.</span>
        <h2 className="section-head__title">Build Your Armor</h2>
        <p className="text-dim">
          Pick one title for every piece of the armor. Watch the set assemble as you fill the slots.
          Complete all six and the whole bundle drops 15%, plus 150 XP toward your next rank.
        </p>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <Link to="/forge" className="btn btn--primary btn--lg">
            Open the forge
          </Link>
          <Link to="/racks" className="btn btn--ghost btn--lg">
            Browse first
          </Link>
        </div>
      </div>
    </div>
  );
}
