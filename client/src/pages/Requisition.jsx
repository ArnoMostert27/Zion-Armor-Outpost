import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api/client.js';
import useCart from '../store/cartStore.js';
import useAuth from '../store/authStore.js';
import useUI from '../store/uiStore.js';
import { rands } from '../lib/format.js';
import { WaxSeal } from '../components/ui/Sigils.jsx';

const STEPS = ['Dispatch', 'Payment', 'Confirm'];

const EMPTY_DISPATCH = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  province: 'Gauteng',
  postalCode: '',
  country: 'South Africa',
  phone: '',
};

export default function Requisition() {
  const navigate = useNavigate();
  const { items, payload, clear } = useCart();
  const user = useAuth((s) => s.user);
  const authLoading = useAuth((s) => s.loading);
  const applyProgress = useAuth((s) => s.applyProgress);
  const toast = useUI((s) => s.toast);
  const celebrate = useUI((s) => s.celebrate);

  const [step, setStep] = useState(0);
  const [dispatch, setDispatch] = useState(EMPTY_DISPATCH);
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [quote, setQuote] = useState(null);
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Server-side pricing. Never trust the numbers in the satchel.
  // Keyed on the full satchel contents so a quantity change re-prices too.
  const satchelKey = JSON.stringify(items.map((i) => [i.product, i.qty]));

  useEffect(() => {
    if (!user || items.length === 0) return;
    let alive = true;
    api
      .quote(payload())
      .then((result) => alive && setQuote(result))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, satchelKey]);

  useEffect(() => {
    if (user) setDispatch((d) => ({ ...d, fullName: d.fullName || user.name }));
  }, [user]);

  if (authLoading) {
    return (
      <div className="loader">
        <span>C</span>
        <span>HECK</span>
        <span>ING</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section shell-narrow">
        <div className="panel stack" style={{ textAlign: 'center' }}>
          <h1>Sign in to requisition</h1>
          <p className="text-dim">Supply runs are logged against your rank, so the gate comes first.</p>
          <Link className="btn btn--primary" to="/gate">
            Enlist or sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!placed && items.length === 0) {
    return (
      <div className="section shell-narrow">
        <div className="panel stack" style={{ textAlign: 'center' }}>
          <span className="burst burst--ember">EMPTY!</span>
          <p className="text-dim">Your satchel is light. Dangerously light.</p>
          <Link className="btn btn--primary" to="/racks">
            Head to the racks
          </Link>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await api.placeOrder({ items: payload(), dispatch, paymentMethod });
      applyProgress(result);
      clear();
      setPlaced(result);
      toast(`Supply run logged. +${result.xpAwarded} XP`, { mark: 'XP!', variant: 'toast--xp' });
      // Let the seal animation land before the badge takes over the screen.
      if (result.newBadges?.length) setTimeout(() => celebrate(result.newBadges), 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <div className="section shell-narrow">
        <div className="seal">
          <WaxSeal className="seal__mark" />
          <h1>Requisition sealed</h1>
          <p className="text-dim">
            Reference <strong>{placed.order.reference}</strong> · {rands(placed.order.grandTotal)}
          </p>
          <p className="text-dim">
            You earned <strong style={{ color: 'var(--accent)' }}>{placed.xpAwarded} XP</strong>.
            {placed.newBadges?.length > 0 && ` New badge: ${placed.newBadges.join(', ')}.`}
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link className="btn btn--primary" to="/rank">
              View your rank
            </Link>
            <Link className="btn btn--ghost" to="/racks">
              Back to the racks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const field = (name, label, extra = {}) => (
    <label className={`field ${extra.full ? 'field--full' : ''}`}>
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        value={dispatch[name]}
        onChange={(e) => setDispatch({ ...dispatch, [name]: e.target.value })}
        required={extra.required}
      />
    </label>
  );

  const canAdvance =
    step !== 0 || (dispatch.fullName && dispatch.line1 && dispatch.city && dispatch.postalCode);

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Supply run</span>
            <h1 className="section-head__title">Requisition</h1>
          </div>
        </div>

        <div className="requisition">
          <div>
            <div className="steps">
              {STEPS.map((label, index) => (
                <div
                  key={label}
                  className={`step-pip ${index === step ? 'is-on' : ''} ${index < step ? 'is-done' : ''}`}
                >
                  <span>0{index + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {error && <div className="alert" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="panel"
              >
                {step === 0 && (
                  <div className="stack">
                    <h3>Where does it go?</h3>
                    <div className="form-grid">
                      {field('fullName', 'Full name', { required: true, full: true })}
                      {field('line1', 'Street address', { required: true, full: true })}
                      {field('line2', 'Complex / unit')}
                      {field('city', 'City', { required: true })}
                      {field('province', 'Province')}
                      {field('postalCode', 'Postal code', { required: true })}
                      {field('phone', 'Phone')}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="stack">
                    <h3>How are you settling it?</h3>
                    <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                      {[
                        { key: 'demo', label: 'Outpost credit (demo)', note: 'Marks the run as paid instantly. Use this for the demo.' },
                        { key: 'card', label: 'Card', note: 'Wire a real gateway here — the order is created unpaid.' },
                        { key: 'eft', label: 'EFT', note: 'Bank transfer. The Keeper marks it paid on arrival.' },
                      ].map((option) => (
                        <button
                          key={option.key}
                          className={`forge-slot ${paymentMethod === option.key ? 'is-filled' : ''}`}
                          style={{ textAlign: 'left' }}
                          onClick={() => setPaymentMethod(option.key)}
                        >
                          <span className="forge-slot__name">{option.label}</span>
                          <span className="text-dim" style={{ fontSize: 'var(--step--2)' }}>
                            {option.note}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="stack">
                    <h3>Check the manifest</h3>
                    <p className="text-dim">
                      {dispatch.fullName}, {dispatch.line1}
                      {dispatch.line2 ? `, ${dispatch.line2}` : ''}, {dispatch.city},{' '}
                      {dispatch.province} {dispatch.postalCode}
                    </p>
                    <div className="ink-rule" />
                    {items.map((item) => (
                      <div key={item.product} className="summary__row">
                        <span>
                          {item.qty} × {item.title}
                        </span>
                        <span>{rands(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-5)' }}>
              <button
                className="btn btn--ghost"
                onClick={() => (step === 0 ? navigate('/racks') : setStep(step - 1))}
              >
                {step === 0 ? 'Back to racks' : 'Back'}
              </button>
              {step < STEPS.length - 1 ? (
                <button className="btn btn--primary" disabled={!canAdvance} onClick={() => setStep(step + 1)}>
                  Continue
                </button>
              ) : (
                <button className="btn btn--primary" disabled={busy} onClick={submit}>
                  {busy ? 'Sealing...' : 'Seal the requisition'}
                </button>
              )}
            </div>
          </div>

          {/* --- summary ------------------------------------------------- */}
          <aside className="summary">
            <h3 className="card__title">Summary</h3>
            {!quote ? (
              <p className="text-dim" style={{ fontSize: 'var(--step--1)' }}>Pricing the run...</p>
            ) : (
              <>
                <div className="summary__row">
                  <span>Items</span>
                  <span>{rands(quote.itemsTotal)}</span>
                </div>
                {quote.armorSetDiscount > 0 && (
                  <div className="summary__row summary__row--save">
                    <span>Full armor set</span>
                    <span>-{rands(quote.armorSetDiscount)}</span>
                  </div>
                )}
                {quote.rankDiscount > 0 && (
                  <div className="summary__row summary__row--save">
                    <span>{quote.rank?.name} discount</span>
                    <span>-{rands(quote.rankDiscount)}</span>
                  </div>
                )}
                <div className="summary__row">
                  <span>Dispatch</span>
                  <span>{quote.shippingTotal === 0 ? 'Free' : rands(quote.shippingTotal)}</span>
                </div>
                <div className="summary__row summary__row--total">
                  <span>Total</span>
                  <strong>{rands(quote.grandTotal)}</strong>
                </div>
                <p className="text-dim" style={{ fontSize: 'var(--step--2)' }}>
                  Earns {quote.xpPreview} XP{quote.isFullArmorSet ? ' + 150 set bonus' : ''}.
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
