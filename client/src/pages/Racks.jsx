import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '../components/ui/ProductCard.jsx';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import { ARMOR, CATEGORIES, SORTS } from '../data/armor.js';
import { rands } from '../lib/format.js';

export default function Racks() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('grid');

  const query = useMemo(
    () => ({
      q: params.get('q') || '',
      category: params.get('category') || '',
      armorSlot: params.get('armorSlot') || '',
      sort: params.get('sort') || 'newest',
      page: Number(params.get('page') || 1),
      inStock: params.get('inStock') || '',
      firstEdition: params.get('firstEdition') || '',
      limit: 12,
    }),
    [params]
  );

  const { data, loading, error } = useApi(() => api.products(query), [JSON.stringify(query)]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const toggleParam = (key, value) => {
    const current = (params.get(key) || '').split(',').filter(Boolean);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParam(key, next.join(','));
  };

  const isOn = (key, value) => (params.get(key) || '').split(',').includes(value);

  const items = data?.items || [];

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Supply manifest</span>
            <h1 className="section-head__title">The Racks</h1>
          </div>
          <p className="section-head__note">
            Filter by rack or by the piece of armor it belongs to. Switch to Longbox view to flick
            through the covers like a real comic box.
          </p>
        </div>

        <div className="shop">
          {/* --- filters ------------------------------------------------- */}
          <aside className="manifest">
            <h2 className="manifest__title">Manifest</h2>

            <div className="manifest__group">
              <span className="manifest__legend">Scout</span>
              <input
                className="field__input"
                placeholder="Title, tag, author"
                defaultValue={query.q}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setParam('q', e.currentTarget.value);
                }}
              />
            </div>

            <div className="manifest__group">
              <span className="manifest__legend">Rack</span>
              <div className="manifest__options">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    className={`chip ${isOn('category', cat.key) ? 'chip--on' : ''}`}
                    onClick={() => toggleParam('category', cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="manifest__group">
              <span className="manifest__legend">Armor piece</span>
              <div className="manifest__options">
                {ARMOR.map((piece) => (
                  <button
                    key={piece.key}
                    className={`chip ${isOn('armorSlot', piece.key) ? 'chip--on' : ''}`}
                    onClick={() => toggleParam('armorSlot', piece.key)}
                  >
                    {piece.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="manifest__group">
              <span className="manifest__legend">Flags</span>
              <div className="manifest__options">
                <button
                  className={`chip ${params.get('inStock') ? 'chip--on' : ''}`}
                  onClick={() => setParam('inStock', params.get('inStock') ? '' : 'true')}
                >
                  In stock
                </button>
                <button
                  className={`chip ${params.get('firstEdition') ? 'chip--on' : ''}`}
                  onClick={() => setParam('firstEdition', params.get('firstEdition') ? '' : 'true')}
                >
                  First edition
                </button>
              </div>
            </div>

            <button className="btn btn--ghost btn--sm btn--block" onClick={() => setParams({})}>
              Clear manifest
            </button>
          </aside>

          {/* --- results ------------------------------------------------- */}
          <div>
            <div className="shop__bar">
              <span className="shop__count">
                {loading ? 'Counting stock...' : `${data?.total || 0} titles on the racks`}
              </span>

              <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                <div className="view-toggle">
                  <button className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')}>
                    Grid
                  </button>
                  <button
                    className={view === 'longbox' ? 'is-on' : ''}
                    onClick={() => setView('longbox')}
                  >
                    Longbox
                  </button>
                </div>

                <select
                  className="field__select"
                  style={{ width: 'auto' }}
                  value={query.sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                >
                  {SORTS.map((sort) => (
                    <option key={sort.key} value={sort.key}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="alert">{error}</div>}

            {loading ? (
              <div className="loader">
                <span>S</span>
                <span>CO</span>
                <span>UTING</span>
              </div>
            ) : items.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
                <span className="burst">EMPTY!</span>
                <p className="text-dim" style={{ marginTop: 'var(--sp-4)' }}>
                  Nothing on the racks matches that manifest.
                </p>
              </div>
            ) : view === 'grid' ? (
              <motion.div className="grid-cards" layout>
                <AnimatePresence mode="popLayout">
                  {items.map((product, index) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 26, rotate: -1.5 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.035 }}
                    >
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="longbox">
                {items.map((product) => (
                  <Link
                    key={product._id}
                    to={`/rack/${product.slug}`}
                    className="longbox__item"
                    style={{ backgroundImage: `url(${product.coverImage})` }}
                  >
                    <span className="longbox__spine">
                      {product.title} · {rands(product.price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {data?.pages > 1 && (
              <div className="pager">
                <button
                  onClick={() => setParam('page', String(Math.max(1, query.page - 1)))}
                  disabled={query.page <= 1}
                >
                  ‹
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={page === query.page ? 'is-on' : ''}
                    onClick={() => setParam('page', String(page))}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setParam('page', String(Math.min(data.pages, query.page + 1)))}
                  disabled={query.page >= data.pages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
