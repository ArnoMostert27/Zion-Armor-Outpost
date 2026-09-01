import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import MotionComic from '../components/home/MotionComic.jsx';
import VerseBeacon from '../components/home/VerseBeacon.jsx';
import ArmorTeaser from '../components/home/ArmorTeaser.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import { ARMOR } from '../data/armor.js';
import { ArmorIcon } from '../components/ui/Sigils.jsx';

// Three.js is the heaviest dependency in the app, so the hero is split out of
// the main bundle and streamed in behind a lightweight placeholder.
const ArmoryHero = lazy(() => import('../components/home/ArmoryHero.jsx'));

function HeroPlaceholder() {
  return (
    <section className="armory">
      <div className="armory__content">
        <span className="armory__eyebrow">Ephesians Six &middot; The Armoury</span>
        <h1 className="armory__title">
          Zion Armor
          <em>Outpost</em>
        </h1>
        <p className="armory__lede">Arming the outpost...</p>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: featured, loading } = useApi(() => api.featured(), []);

  return (
    <>
      <Suspense fallback={<HeroPlaceholder />}>
        <ArmoryHero />
      </Suspense>

      <MotionComic />

      {/* --- new arrivals rail ------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="section-head__eyebrow">Fresh off the press</span>
              <h2 className="section-head__title">New on the racks</h2>
            </div>
            <p className="section-head__note">
              Drag sideways. First editions carry a foil sweep you can catch with the pointer.
            </p>
          </div>

          {loading ? (
            <div className="loader">
              <span>L</span>
              <span>O</span>
              <span>ADING</span>
            </div>
          ) : (
            <div className="rail">
              {(featured || []).map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- the six racks ------------------------------------------------ */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="section-head__eyebrow">Ephesians 6:11</span>
              <h2 className="section-head__title">The Six Racks</h2>
            </div>
            <p className="section-head__note">
              Every rack in the outpost is named for a piece of the armor. That is not decoration -
              it is how the shop is organised.
            </p>
          </div>

          <div className="grid-cards">
            {ARMOR.map((piece) => (
              <Link
                key={piece.key}
                to={`/racks?category=${piece.category}`}
                className="panel halftone"
                style={{ display: 'grid', gap: 'var(--sp-3)' }}
              >
                <ArmorIcon piece={piece.key} className="brand__mark" />
                <span className="satchel-item__slot">{piece.verseRef}</span>
                <h3 className="card__title">{piece.rack}</h3>
                <p className="card__blurb">{piece.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- build your armor teaser -------------------------------------- */}
      <section className="section">
        <div className="shell">
          <ArmorTeaser />
        </div>
      </section>

      {/* --- verse beacon -------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <VerseBeacon />
        </div>
      </section>
    </>
  );
}
