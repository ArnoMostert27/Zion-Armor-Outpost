import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../../store/cartStore.js';
import { rands } from '../../lib/format.js';
import { Icon } from '../ui/Sigils.jsx';
import { ARMOR, ARMOR_BY_KEY } from '../../data/armor.js';

export default function Satchel() {
  const navigate = useNavigate();
  const { items, open, setOpen, setQty, remove, subtotal, slotsCovered } = useCart();

  const covered = slotsCovered();
  const missing = ARMOR.filter((piece) => !covered.includes(piece.key));

  const goCheckout = () => {
    setOpen(false);
    navigate('/requisition');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="satchel-backdrop"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="satchel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            aria-label="Your satchel"
          >
            <div className="satchel__head">
              <h2 className="satchel__title">The Satchel</h2>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close satchel">
                <Icon name="close" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="satchel__empty">
                <span className="burst burst--ember">EMPTY</span>
                <p>Your satchel is light. Dangerously light.</p>
                <Link className="btn btn--primary" to="/racks" onClick={() => setOpen(false)}>
                  Head to the racks
                </Link>
              </div>
            ) : (
              <>
                <div className="satchel__list">
                  {items.map((item) => (
                    <motion.div
                      key={item.product}
                      className="satchel-item"
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                    >
                      <img src={item.coverImage} alt="" />
                      <div>
                        <div className="satchel-item__title">{item.title}</div>
                        <div className="satchel-item__slot">
                          {ARMOR_BY_KEY[item.armorSlot]?.short || item.armorSlot} · {rands(item.price)}
                        </div>
                        <div className="qty" style={{ marginTop: 6 }}>
                          <button onClick={() => setQty(item.product, item.qty - 1)} aria-label="Fewer">
                            <Icon name="minus" size={14} />
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => setQty(item.product, item.qty + 1)} aria-label="More">
                            <Icon name="plus" size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="icon-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => remove(item.product)}
                        aria-label={`Remove ${item.title}`}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="satchel__foot">
                  {missing.length > 0 && missing.length <= 3 && (
                    <div className="alert alert--ok">
                      {missing.length} piece{missing.length > 1 ? 's' : ''} from a full armor set:{' '}
                      {missing.map((m) => m.short).join(', ')}. Complete it for 15% off.
                    </div>
                  )}
                  <div className="satchel__row">
                    <span>Subtotal</span>
                    <strong>{rands(subtotal())}</strong>
                  </div>
                  <button className="btn btn--primary btn--block" onClick={goCheckout}>
                    Requisition
                  </button>
                  <Link
                    to="/forge"
                    className="btn btn--ghost btn--block btn--sm"
                    onClick={() => setOpen(false)}
                  >
                    Build a full armor set
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
