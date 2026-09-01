import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useScroll from '../store/scrollStore.js';
import useAuth from '../store/authStore.js';
import useCart from '../store/cartStore.js';
import useUI from '../store/uiStore.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { rands } from '../lib/format.js';
import { sfx } from '../lib/sound.js';

export default function Scroll() {
  const user = useAuth((s) => s.user);
  const authLoading = useAuth((s) => s.loading);
  const { products, ids, loading, load } = useScroll();
  const addMany = useCart((s) => s.addMany);
  const setOpen = useCart((s) => s.setOpen);
  const toast = useUI((s) => s.toast);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (authLoading) {
    return (
      <div className="loader">
        <span>U</span>
        <span>NROL</span>
        <span>LING</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section shell-narrow">
        <div className="panel stack" style={{ textAlign: 'center' }}>
          <h1>The Scroll is kept per recruit</h1>
          <p className="text-dim">Sign in and anything you mark is waiting next time.</p>
          <Link className="btn btn--primary" to="/gate">
            Open the gate
          </Link>
        </div>
      </div>
    );
  }

  // The store keeps ids authoritative, so filter the fetched products by them.
  const kept = products.filter((p) => ids.includes(p._id));
  const total = kept.reduce((sum, p) => sum + p.price, 0);
  const available = kept.filter((p) => p.stock > 0);

  const stowAll = () => {
    if (!available.length) return;
    addMany(available);
    sfx.stow();
    toast(`${available.length} title${available.length === 1 ? '' : 's'} moved to the satchel.`, {
      mark: 'ADD!',
    });
    setOpen(true);
  };

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Kept for later</span>
            <h1 className="section-head__title">The Scroll</h1>
          </div>
          {kept.length > 0 && (
            <div style={{ display: 'grid', gap: 'var(--sp-3)', justifyItems: 'end' }}>
              <span className="shop__count">
                {kept.length} title{kept.length === 1 ? '' : 's'} · {rands(total)}
              </span>
              <button className="btn btn--primary btn--sm" onClick={stowAll} disabled={!available.length}>
                Stow everything in stock
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loader">
            <span>U</span>
            <span>NROL</span>
            <span>LING</span>
          </div>
        ) : kept.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
            <span className="burst burst--cyan">BLANK!</span>
            <p className="text-dim" style={{ margin: 'var(--sp-5) 0' }}>
              Nothing written on your scroll yet. Tap the heart on any cover to keep it here.
            </p>
            <Link className="btn btn--primary" to="/racks">
              Head to the racks
            </Link>
          </div>
        ) : (
          <motion.div className="grid-cards" layout>
            <AnimatePresence mode="popLayout">
              {kept.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, rotate: -4 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
