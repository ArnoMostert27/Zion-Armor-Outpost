import { Link } from 'react-router-dom';
import { BrandMark } from '../ui/Sigils.jsx';
import { ARMOR } from '../../data/armor.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <div className="brand" style={{ marginBottom: 'var(--sp-4)' }}>
            <BrandMark className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">Zion Armor Outpost</span>
              <span className="brand__tag">Est. on the edge of the wilderness</span>
            </span>
          </div>
          <p className="text-dim" style={{ fontSize: 'var(--step--1)', maxWidth: '38ch' }}>
            A comic Bible armoury. Action Bibles, graphic novels, study editions and gear for
            readers who would rather be shown than told.
          </p>
        </div>

        <div>
          <h4 className="footer__title">The Six Racks</h4>
          <ul className="footer__links">
            {ARMOR.map((piece) => (
              <li key={piece.key}>
                <Link to={`/racks?category=${piece.category}`}>{piece.rack}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="footer__title">The Outpost</h4>
          <ul className="footer__links">
            <li>
              <Link to="/forge">Build Your Armor</Link>
            </li>
            <li>
              <Link to="/plans">Reading Plans</Link>
            </li>
            <li>
              <Link to="/rank">Your Rank</Link>
            </li>
            <li>
              <Link to="/racks?firstEdition=true">First Editions</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer__title">The Watch Signal</h4>
          <p className="text-dim" style={{ fontSize: 'var(--step--1)', marginBottom: 'var(--sp-3)' }}>
            New arrivals and first-edition drops.
          </p>
          <form className="stack" onSubmit={(e) => e.preventDefault()}>
            <input className="field__input" type="email" placeholder="you@outpost.dev" aria-label="Email" />
            <button className="btn btn--primary btn--sm btn--block" type="submit">
              Light the signal
            </button>
          </form>
        </div>
      </div>

      <div className="footer__bottom">
        <span>Zion Armor Outpost #001</span>
        <span>Built with React, Express, MongoDB and far too much halftone</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
