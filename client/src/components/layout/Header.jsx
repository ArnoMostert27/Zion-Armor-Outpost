import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useCart from '../../store/cartStore.js';
import useAuth from '../../store/authStore.js';
import useUI from '../../store/uiStore.js';
import { BrandMark, Icon } from '../ui/Sigils.jsx';

const LINKS = [
  { to: '/racks', label: 'The Racks' },
  { to: '/forge', label: 'Build Your Armor' },
  { to: '/plans', label: 'Reading Plans' },
  { to: '/scroll', label: 'The Scroll' },
];

export default function Header() {
  const navigate = useNavigate();
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const toggleSatchel = useCart((s) => s.toggle);
  const user = useAuth((s) => s.user);
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const mobileNavOpen = useUI((s) => s.mobileNavOpen);
  const setMobileNav = useUI((s) => s.setMobileNav);
  const soundOn = useUI((s) => s.soundOn);
  const toggleSound = useUI((s) => s.toggleSound);

  const [hidden, setHidden] = useState(false);
  const [scouting, setScouting] = useState(false);
  const [term, setTerm] = useState('');
  const lastY = useRef(0);

  // Hide the bar on the way down, bring it back on the way up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 220 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitScout = (event) => {
    event.preventDefault();
    if (!term.trim()) return;
    navigate(`/racks?q=${encodeURIComponent(term.trim())}`);
    setScouting(false);
    setTerm('');
  };

  return (
    <>
      <header className={`header ${hidden ? 'is-hidden' : ''}`}>
        <div className="header__bar">
          <Link to="/" className="brand" aria-label="Zion Armor Outpost home">
            <BrandMark className="brand__mark" animated />
            <span className="brand__text">
              <span className="brand__name">Zion Armor Outpost</span>
              <span className="brand__tag">Resupply. Then go back out.</span>
            </span>
          </Link>

          <nav className="nav">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav__link ink-underline ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'keeper' && (
              <NavLink to="/ledger" className="nav__link ink-underline">
                Keeper&apos;s Ledger
              </NavLink>
            )}
          </nav>

          <div className="header__tools">
            {scouting ? (
              <form onSubmit={submitScout} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field__input"
                  style={{ width: 200 }}
                  placeholder="Scout the racks..."
                  value={term}
                  autoFocus
                  onChange={(e) => setTerm(e.target.value)}
                  onBlur={() => !term && setScouting(false)}
                />
              </form>
            ) : (
              <button className="icon-btn" onClick={() => setScouting(true)} aria-label="Search">
                <Icon name="search" />
              </button>
            )}

            <button
              className="icon-btn"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}
              title={soundOn ? 'Sound on' : 'Sound off'}
            >
              <Icon name={soundOn ? 'volume' : 'mute'} />
            </button>

            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'night' ? 'Switch to Day Watch' : 'Switch to Night Watch'}
            >
              <Icon name={theme === 'night' ? 'sun' : 'moon'} />
            </button>

            <Link className="icon-btn" to={user ? '/rank' : '/gate'} aria-label="Your rank">
              <Icon name="user" />
            </Link>

            <button className="icon-btn" onClick={toggleSatchel} aria-label="Open satchel">
              <Icon name="satchel" />
              {count > 0 && (
                <span className="icon-btn__count" id="satchel-target">
                  {count}
                </span>
              )}
              {count === 0 && <span id="satchel-target" style={{ position: 'absolute', inset: 0 }} />}
            </button>

            <button
              className="icon-btn burger"
              onClick={() => setMobileNav(!mobileNavOpen)}
              aria-label="Menu"
            >
              <Icon name={mobileNavOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${mobileNavOpen ? 'is-open' : ''}`}>
        <ul>
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setMobileNav(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to={user ? '/rank' : '/gate'} onClick={() => setMobileNav(false)}>
              {user ? 'Your Rank' : 'Enlist'}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
