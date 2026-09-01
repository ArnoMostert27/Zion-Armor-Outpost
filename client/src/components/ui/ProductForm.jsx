import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../api/client.js';
import { ARMOR, CATEGORIES } from '../../data/armor.js';
import { Icon } from './Sigils.jsx';

const FORMATS = ['hardcover', 'paperback', 'boxed', 'merch'];

const BLANK = {
  title: '',
  slug: '',
  author: 'Various',
  publisher: 'David C Cook',
  blurb: '',
  description: '',
  verse: '',
  verseRef: '',
  price: 0,
  compareAtPrice: 0,
  category: 'action-bibles',
  armorSlot: 'breastplate',
  tags: '',
  coverImage: '/covers/the-action-bible.svg',
  pageCount: 0,
  ageRange: 'All ages',
  format: 'hardcover',
  stock: 0,
  xpValue: 0,
  firstEdition: false,
  featured: false,
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Create / edit form for the Keeper's Ledger. Handles both modes - pass a
 * product to edit it, or nothing to create a new one.
 */
export default function ProductForm({ product, onClose, onSaved }) {
  const editing = Boolean(product?._id);

  const [form, setForm] = useState(() =>
    product
      ? { ...BLANK, ...product, tags: (product.tags || []).join(', ') }
      : { ...BLANK }
  );
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Keep the slug in step with the title until it is edited by hand.
      if (key === 'title' && (!editing || !prev.slug)) next.slug = slugify(value);
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      ...form,
      slug: slugify(form.slug || form.title),
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice),
      pageCount: Number(form.pageCount),
      stock: Number(form.stock),
      xpValue: Number(form.xpValue),
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    delete payload._id;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;

    try {
      const saved = editing
        ? await api.updateProduct(product._id, payload)
        : await api.createProduct(payload);
      onSaved(saved, editing);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const text = (name, label, extra = {}) => (
    <label className={`field ${extra.full ? 'field--full' : ''}`}>
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type={extra.type || 'text'}
        min={extra.type === 'number' ? 0 : undefined}
        step={extra.type === 'number' ? 1 : undefined}
        value={form[name]}
        onChange={set(name)}
        required={extra.required}
      />
    </label>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.form
          className="modal__card"
          onSubmit={submit}
          initial={{ y: 40, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="modal__head">
            <div>
              <span className="section-head__eyebrow">
                {editing ? 'Amend the ledger' : 'Add to the ledger'}
              </span>
              <h2 className="card__title">{editing ? form.title : 'New product'}</h2>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="form-grid">
            {text('title', 'Title', { required: true, full: true })}
            {text('slug', 'Slug', { required: true })}
            {text('author', 'Author')}
            {text('publisher', 'Publisher')}
            {text('coverImage', 'Cover image path')}

            <label className="field field--full">
              <span className="field__label">Blurb</span>
              <input className="field__input" value={form.blurb} onChange={set('blurb')} required />
            </label>

            <label className="field field--full">
              <span className="field__label">Description</span>
              <textarea className="field__textarea" value={form.description} onChange={set('description')} />
            </label>

            {text('verse', 'Verse', { full: true })}
            {text('verseRef', 'Verse reference')}
            {text('tags', 'Tags (comma separated)')}

            {text('price', 'Price (ZAR)', { type: 'number', required: true })}
            {text('compareAtPrice', 'Compare-at price', { type: 'number' })}
            {text('stock', 'Stock', { type: 'number', required: true })}
            {text('xpValue', 'XP value', { type: 'number' })}
            {text('pageCount', 'Page count', { type: 'number' })}
            {text('ageRange', 'Age range')}

            <label className="field">
              <span className="field__label">Rack (category)</span>
              <select className="field__select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Armor slot</span>
              <select className="field__select" value={form.armorSlot} onChange={set('armorSlot')}>
                {ARMOR.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Format</span>
              <select className="field__select" value={form.format} onChange={set('format')}>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <div className="field" style={{ display: 'grid', gap: 'var(--sp-3)', alignContent: 'end' }}>
              <label className="check">
                <input type="checkbox" checked={form.firstEdition} onChange={set('firstEdition')} />
                First edition
              </label>
              <label className="check">
                <input type="checkbox" checked={form.featured} onChange={set('featured')} />
                Featured on the home rail
              </label>
            </div>
          </div>

          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? 'Saving...' : editing ? 'Save changes' : 'Add to the racks'}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
