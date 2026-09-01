import { useRef } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../store/cartStore.js';
import useUI from '../../store/uiStore.js';
import { rands, starString } from '../../lib/format.js';
import { flyToSatchel, popBurst } from '../../lib/flyToSatchel.js';
import { ARMOR_BY_KEY } from '../../data/armor.js';
import ScrollToggle from './ScrollToggle.jsx';
import { sfx } from '../../lib/sound.js';

/**
 * A comic cover that tilts in 3D under the pointer, sweeps a foil shine
 * on hover, and throws a ghost into the satchel when added.
 */
export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);

  const armor = ARMOR_BY_KEY[product.armorSlot];
  const soldOut = product.stock <= 0;

  const handleMove = (event) => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 13}deg) rotateX(${
      (0.5 - py) * 13
    }deg) translateY(-6px)`;
    card.style.setProperty('--holo-angle', `${px * 360}deg`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = '';
  };

  const handleAdd = (event) => {
    event.preventDefault();
    if (soldOut) return;
    add(product, 1);
    flyToSatchel(mediaRef.current, product.coverImage);
    popBurst(event.clientX, event.clientY, 'POW!');
    sfx.stow();
    toast(`${product.title} stowed in the satchel.`, { mark: 'ADD!' });
  };

  return (
    <article
      ref={cardRef}
      className={`card ${product.firstEdition ? 'holo holo--rainbow' : 'holo'}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <ScrollToggle productId={product._id} className="card__scroll" />

      <Link to={`/rack/${product.slug}`} className="card__media" ref={mediaRef}>
        <img src={product.coverImage} alt={product.title} loading="lazy" />
        <div className="card__flags">
          {product.firstEdition && <span className="card__flag">First Edition</span>}
          {product.compareAtPrice > product.price && (
            <span className="card__flag card__flag--ember">On Sale</span>
          )}
        </div>
        {soldOut && (
          <div className="card__soldout">
            <span className="stamp stamp--slam">Rack Empty</span>
          </div>
        )}
      </Link>

      <div className="card__body">
        <span className="satchel-item__slot">{armor?.short || product.armorSlot}</span>
        <h3 className="card__title">
          <Link to={`/rack/${product.slug}`}>{product.title}</Link>
        </h3>
        <p className="card__blurb">{product.blurb}</p>

        <div className="stars" aria-label={`Rated ${product.rating} out of 5`}>
          {starString(product.rating)}
          <span className="satchel-item__slot" style={{ marginLeft: 6 }}>
            {product.numReports || 0}
          </span>
        </div>

        <div className="card__foot">
          <span className="card__price">
            {rands(product.price)}
            {product.compareAtPrice > product.price && <s>{rands(product.compareAtPrice)}</s>}
          </span>
          <button className="btn btn--primary btn--sm" onClick={handleAdd} disabled={soldOut}>
            {soldOut ? 'Empty' : 'Stow'}
          </button>
        </div>
      </div>
    </article>
  );
}
