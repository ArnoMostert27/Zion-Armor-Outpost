import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import useCart from '../store/cartStore.js';
import useUI from '../store/uiStore.js';
import { ARMOR } from '../data/armor.js';
import { rands } from '../lib/format.js';
import { popBurst } from '../lib/flyToSatchel.js';
import { sfx } from '../lib/sound.js';

const DISCOUNT_RATE = 0.15;

/* --- the figure the armor lands on --------------------------------------- */
function ArmorFigure({ selection }) {
  const on = (key) => (selection[key] ? 'forge__piece is-filled' : 'forge__piece');

  return (
    <svg viewBox="0 0 300 400" className="forge__svg" aria-hidden="true">
      {/* silhouette */}
      <g opacity="0.16" fill="var(--text)">
        <circle cx="150" cy="58" r="30" />
        <rect x="112" y="92" width="76" height="110" rx="12" />
        <rect x="120" y="206" width="60" height="20" rx="6" />
        <rect x="124" y="232" width="22" height="120" rx="8" />
        <rect x="154" y="232" width="22" height="120" rx="8" />
        <rect x="82" y="100" width="22" height="96" rx="10" />
        <rect x="196" y="100" width="22" height="96" rx="10" />
      </g>

      {/* helmet */}
      <g className={on('helmet')}>
        <path d="M118 62a32 32 0 0 1 64 0v22a10 10 0 0 1-10 10h-44a10 10 0 0 1-10-10Z" fill="none" stroke="var(--accent-3)" strokeWidth="5" />
        <path d="M150 34v60M128 66h44" stroke="var(--accent-3)" strokeWidth="4" />
      </g>

      {/* breastplate */}
      <g className={on('breastplate')}>
        <path d="M108 96h84l6 22-8 84h-80l-8-84Z" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinejoin="round" />
        <path d="M150 96v106M118 130h64M120 164h60" stroke="var(--accent)" strokeWidth="4" />
      </g>

      {/* belt */}
      <g className={on('belt')}>
        <rect x="104" y="202" width="92" height="26" fill="none" stroke="var(--accent-2)" strokeWidth="5" />
        <rect x="138" y="196" width="24" height="38" fill="none" stroke="var(--accent-2)" strokeWidth="5" />
      </g>

      {/* shield (left arm) */}
      <g className={on('shield')}>
        <path d="M40 108 84 92l44 16v46c0 30-26 44-44 52-18-8-44-22-44-52Z" fill="none" stroke="#7b6bff" strokeWidth="5" strokeLinejoin="round" />
        <path d="M84 112v72M56 142h56" stroke="#7b6bff" strokeWidth="4" />
      </g>

      {/* sword (right arm) */}
      <g className={on('sword')}>
        <path d="M232 40 244 74v96l-12 26-12-26V74Z" fill="none" stroke="var(--parchment)" strokeWidth="5" strokeLinejoin="round" />
        <path d="M204 196h56M232 196v40" stroke="var(--parchment)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* boots */}
      <g className={on('boots')}>
        <path d="M118 330h30v34h-42v-14Z" fill="none" stroke="#4ad991" strokeWidth="5" strokeLinejoin="round" />
        <path d="M152 330h30l12 20v14h-42Z" fill="none" stroke="#4ad991" strokeWidth="5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* --- page ---------------------------------------------------------------- */
export default function Forge() {
  const navigate = useNavigate();
  const addMany = useCart((s) => s.addMany);
  const setOpen = useCart((s) => s.setOpen);
  const toast = useUI((s) => s.toast);

  const [selection, setSelection] = useState({});
  const { data: bySlot, loading } = useApi(() => api.bySlot(), []);

  const chosen = useMemo(
    () =>
      ARMOR.map((piece) => {
        const id = selection[piece.key];
        const product = (bySlot?.[piece.key] || []).find((p) => p._id === id);
        return product ? { ...product, armorSlot: piece.key } : null;
      }).filter(Boolean),
    [selection, bySlot]
  );

  const filledCount = chosen.length;
  const complete = filledCount === ARMOR.length;
  const subtotal = chosen.reduce((sum, p) => sum + p.price, 0);
  const discount = complete ? Math.round(subtotal * DISCOUNT_RATE) : 0;

  const pick = (slot, product, event) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[slot] === product._id) delete next[slot];
      else next[slot] = product._id;

      if (Object.keys(next).length === ARMOR.length && event) {
        popBurst(window.innerWidth / 2, window.innerHeight / 2, 'FULL PLATE!');
        sfx.ignite();
      } else if (event) {
        sfx.tick();
      }
      return next;
    });
  };

  const stowSet = () => {
    addMany(chosen);
    sfx.stow();
    toast(
      complete
        ? `Full armor set stowed. ${rands(discount)} comes off at requisition.`
        : `${filledCount} piece${filledCount === 1 ? '' : 's'} stowed.`,
      { mark: complete ? 'KA-BOOM!' : 'ADD!' }
    );
    setOpen(true);
  };

  const circumference = 2 * Math.PI * 38;
  const progress = filledCount / ARMOR.length;

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Ephesians 6:11</span>
            <h1 className="section-head__title">Build Your Armor</h1>
          </div>
          <p className="section-head__note">
            One title for every piece. Fill all six slots and the set drops 15%, plus 150 XP toward
            your rank.
          </p>
        </div>

        {loading ? (
          <div className="loader">
            <span>F</span>
            <span>OR</span>
            <span>GING</span>
          </div>
        ) : (
          <div className="forge">
            {/* --- left: figure + slots ---------------------------------- */}
            <div className="stack">
              <div className={`forge__figure ${complete ? 'is-complete' : ''}`}>
                <div className="speedlines" style={{ opacity: complete ? 0.4 : 0.12 }} />
                <ArmorFigure selection={selection} />

                <svg viewBox="0 0 92 92" className="forge__ring">
                  <circle cx="46" cy="46" r="38" fill="none" stroke="var(--line-strong)" strokeWidth="6" />
                  <circle
                    cx="46"
                    cy="46"
                    r="38"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    transform="rotate(-90 46 46)"
                    style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)' }}
                  />
                  <text x="46" y="54">{filledCount}/6</text>
                </svg>

                {complete && (
                  <motion.span
                    className="burst"
                    style={{ position: 'absolute', bottom: 20 }}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    STAND FIRM!
                  </motion.span>
                )}
              </div>

              <div className="forge__slots">
                {ARMOR.map((piece) => {
                  const options = bySlot?.[piece.key] || [];
                  const filled = Boolean(selection[piece.key]);
                  return (
                    <div key={piece.key} className={`forge-slot ${filled ? 'is-filled' : ''}`}>
                      <div className="forge-slot__head">
                        <span className="forge-slot__name">{piece.name}</span>
                        <span className="forge-slot__ref">{piece.verseRef}</span>
                      </div>
                      <p className="card__blurb" style={{ WebkitLineClamp: 1 }}>
                        &ldquo;{piece.verse}&rdquo;
                      </p>
                      <div className="forge-slot__picks">
                        {options.length === 0 && (
                          <span className="text-dim" style={{ fontSize: 'var(--step--2)' }}>
                            Nothing in stock for this slot.
                          </span>
                        )}
                        {options.map((product) => (
                          <button
                            key={product._id}
                            className={`forge-pick ${selection[piece.key] === product._id ? 'is-on' : ''}`}
                            onClick={(e) => pick(piece.key, product, e)}
                            title={`${product.title} — ${rands(product.price)}`}
                          >
                            <img src={product.coverImage} alt={product.title} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- right: summary ---------------------------------------- */}
            <aside className="forge__summary">
              <h3 className="card__title">Your set</h3>

              {chosen.length === 0 && (
                <p className="text-dim" style={{ fontSize: 'var(--step--1)' }}>
                  Nothing selected yet. Tap a cover under any slot.
                </p>
              )}

              {chosen.map((product) => (
                <div key={product._id} className="summary__row">
                  <span>{product.title}</span>
                  <span>{rands(product.price)}</span>
                </div>
              ))}

              {chosen.length > 0 && (
                <>
                  <div className="summary__row">
                    <span>Subtotal</span>
                    <span>{rands(subtotal)}</span>
                  </div>
                  {complete && (
                    <div className="summary__row summary__row--save">
                      <span>Full armor set (15%)</span>
                      <span>-{rands(discount)}</span>
                    </div>
                  )}
                  <div className="summary__row summary__row--total">
                    <span>Total</span>
                    <strong>{rands(subtotal - discount)}</strong>
                  </div>
                </>
              )}

              <button className="btn btn--primary btn--block" onClick={stowSet} disabled={chosen.length === 0}>
                {complete ? 'Stow the full set' : `Stow ${filledCount} piece${filledCount === 1 ? '' : 's'}`}
              </button>

              <button className="btn btn--ghost btn--block btn--sm" onClick={() => navigate('/racks')}>
                Browse the racks instead
              </button>

              {!complete && chosen.length > 0 && (
                <p className="text-dim" style={{ fontSize: 'var(--step--2)' }}>
                  {ARMOR.length - filledCount} slot{ARMOR.length - filledCount === 1 ? '' : 's'} left
                  before the discount unlocks.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
