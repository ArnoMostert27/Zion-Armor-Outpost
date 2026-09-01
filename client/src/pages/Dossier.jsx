import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import useCart from '../store/cartStore.js';
import useAuth from '../store/authStore.js';
import useUI from '../store/uiStore.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { Icon } from '../components/ui/Sigils.jsx';
import { rands, shortDate, starString, titleCase } from '../lib/format.js';
import { ARMOR_BY_KEY } from '../data/armor.js';
import { flyToSatchel, popBurst } from '../lib/flyToSatchel.js';
import ScrollToggle from '../components/ui/ScrollToggle.jsx';
import { sfx } from '../lib/sound.js';

/* --- the page-turn preview reader ---------------------------------------- */
function Reader({ pages, cover, onClose }) {
  const [index, setIndex] = useState(0);
  const sheets = [cover, ...pages];

  return (
    <motion.div
      className="reader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div>
        <div className="reader__book">
          {sheets.map((src, i) => (
            <div
              key={src + i}
              className={`reader__page ${i < index ? 'is-turned' : ''}`}
              style={{
                backgroundImage: `url(${src})`,
                zIndex: sheets.length - i,
                pointerEvents: i === index ? 'auto' : 'none',
              }}
            />
          ))}
        </div>

        <div className="reader__nav">
          <button className="btn btn--sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            <Icon name="arrowLeft" size={16} /> Back
          </button>
          <span className="shop__count" style={{ alignSelf: 'center' }}>
            {index + 1} / {sheets.length}
          </span>
          <button
            className="btn btn--sm btn--primary"
            onClick={() => {
              sfx.page();
              setIndex((i) => Math.min(sheets.length - 1, i + 1));
            }}
            disabled={index >= sheets.length - 1}
          >
            Turn <Icon name="arrowRight" size={16} />
          </button>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* --- field report form ---------------------------------------------------- */
function ReportForm({ productId, onFiled }) {
  const user = useAuth((s) => s.user);
  const applyProgress = useAuth((s) => s.applyProgress);
  const toast = useUI((s) => s.toast);
  const [form, setForm] = useState({ rating: 5, headline: '', body: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="panel">
        <p className="text-dim">
          <Link to="/gate" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Enlist or sign in
          </Link>{' '}
          to file a field report. Reports earn 25 XP.
        </p>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api.createReview(productId, form);
      applyProgress(result);
      toast('Field report filed. +25 XP', { mark: 'XP!', variant: 'toast--xp' });
      setForm({ rating: 5, headline: '', body: '' });
      onFiled(result.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel stack" onSubmit={submit}>
      <h4>File a field report</h4>
      {error && <div className="alert">{error}</div>}

      <label className="field">
        <span className="field__label">Rating</span>
        <select
          className="field__select"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {starString(n)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Headline</span>
        <input
          className="field__input"
          maxLength={80}
          required
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field__label">Report</span>
        <textarea
          className="field__textarea"
          maxLength={1200}
          required
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </label>

      <button className="btn btn--primary" disabled={busy}>
        {busy ? 'Filing...' : 'File report'}
      </button>
    </form>
  );
}

/* --- page ----------------------------------------------------------------- */
export default function Dossier() {
  const { slug } = useParams();
  const coverRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [readerOpen, setReaderOpen] = useState(false);

  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);

  const { data, loading, error, setData } = useApi(() => api.product(slug), [slug]);

  if (loading) {
    return (
      <div className="loader">
        <span>O</span>
        <span>PEN</span>
        <span>ING</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="section shell">
        <div className="alert">{error || 'That rack is empty.'}</div>
      </div>
    );
  }

  const { product, reports, related } = data;
  const armor = ARMOR_BY_KEY[product.armorSlot];
  const soldOut = product.stock <= 0;

  const tilt = (event) => {
    const el = coverRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.transform = `rotateY(${(px - 0.5) * 22}deg) rotateX(${(0.5 - py) * 18}deg)`;
  };

  const handleAdd = (event) => {
    add(product, qty);
    flyToSatchel(coverRef.current, product.coverImage);
    popBurst(event.clientX, event.clientY, 'STOWED!');
    sfx.stow();
    toast(`${qty} × ${product.title} in the satchel.`, { mark: 'ADD!' });
  };

  return (
    <div className="section">
      <div className="shell">
        <p className="shop__count" style={{ marginBottom: 'var(--sp-5)' }}>
          <Link to="/racks">The Racks</Link> / {armor?.rack} / {product.title}
        </p>

        <div className="dossier">
          {/* --- stage ------------------------------------------------- */}
          <div className="dossier__stage">
            <img
              ref={coverRef}
              className="dossier__cover"
              src={product.coverImage}
              alt={product.title}
              onPointerMove={tilt}
              onPointerLeave={() => {
                if (coverRef.current) coverRef.current.style.transform = '';
              }}
            />
            <button
              className="btn btn--ghost"
              onClick={() => setReaderOpen(true)}
              disabled={!product.previewPages?.length}
            >
              <Icon name="book" size={16} />
              {product.previewPages?.length ? 'Read the first pages' : 'No preview available'}
            </button>
          </div>

          {/* --- details ----------------------------------------------- */}
          <div className="stack">
            <div className="dossier__meta">
              <span className="chip">{armor?.short}</span>
              <span className="chip">{titleCase(product.category)}</span>
              {product.firstEdition && <span className="chip chip--on">First Edition</span>}
            </div>

            <h1 className="dossier__title">{product.title}</h1>
            <p className="text-dim">{product.blurb}</p>

            <div className="stars">
              {starString(product.rating)}
              <span className="text-dim" style={{ marginLeft: 8 }}>
                {product.numReports} field report{product.numReports === 1 ? '' : 's'}
              </span>
            </div>

            {product.verse && (
              <blockquote className="dossier__verse">
                &ldquo;{product.verse}&rdquo;
                <br />
                <span className="beacon__ref">{product.verseRef}</span>
              </blockquote>
            )}

            <p>{product.description}</p>

            <div className="dossier__price">
              {rands(product.price)}
              {product.compareAtPrice > product.price && (
                <s style={{ fontSize: 'var(--step-0)', color: 'var(--text-faint)', marginLeft: 12 }}>
                  {rands(product.compareAtPrice)}
                </s>
              )}
            </div>

            <div className="dossier__buy">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Fewer">
                  <Icon name="minus" size={14} />
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="More">
                  <Icon name="plus" size={14} />
                </button>
              </div>
              <button className="btn btn--primary btn--lg" onClick={handleAdd} disabled={soldOut}>
                {soldOut ? 'Rack empty' : 'Stow in satchel'}
              </button>
              <ScrollToggle productId={product._id} label />
              <span className="text-dim" style={{ fontSize: 'var(--step--1)' }}>
                Earns {product.xpValue} XP
              </span>
            </div>

            <table className="spec-table">
              <tbody>
                <tr>
                  <th>Author</th>
                  <td>{product.author}</td>
                </tr>
                <tr>
                  <th>Publisher</th>
                  <td>{product.publisher}</td>
                </tr>
                <tr>
                  <th>Format</th>
                  <td>{titleCase(product.format)}</td>
                </tr>
                <tr>
                  <th>Pages</th>
                  <td>{product.pageCount || '—'}</td>
                </tr>
                <tr>
                  <th>Age range</th>
                  <td>{product.ageRange}</td>
                </tr>
                <tr>
                  <th>On the shelf</th>
                  <td>{product.stock}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- field reports ------------------------------------------- */}
        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-head__eyebrow">From the field</span>
              <h2 className="section-head__title">Field Reports</h2>
            </div>
          </div>

          <div className="grid-cards" style={{ alignItems: 'start' }}>
            <ReportForm
              productId={product._id}
              onFiled={(review) => setData({ ...data, reports: [review, ...reports] })}
            />
            {reports.map((report) => (
              <article key={report._id} className="report">
                <div className="report__head">
                  <span className="report__name">{report.name}</span>
                  <span className="rank-badge">
                    <i className="rank-badge__dot" />
                    {report.rankName}
                  </span>
                </div>
                <div className="stars">{starString(report.rating)}</div>
                <h4 className="card__title" style={{ fontSize: 'var(--step-0)' }}>
                  {report.headline}
                </h4>
                <p className="card__blurb" style={{ WebkitLineClamp: 6 }}>
                  {report.body}
                </p>
                <span className="satchel-item__slot">{shortDate(report.createdAt)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* --- related -------------------------------------------------- */}
        {related?.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2 className="section-head__title">Pairs well with</h2>
            </div>
            <div className="grid-cards">
              {related.map((item, index) => (
                <ProductCard key={item._id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {readerOpen && (
          <Reader
            pages={product.previewPages || []}
            cover={product.coverImage}
            onClose={() => setReaderOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
