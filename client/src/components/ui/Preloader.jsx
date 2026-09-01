import { useEffect, useState } from 'react';

/**
 * Armor assembles piece by piece while the app boots.
 * Shown once per session so navigation never sits behind it twice.
 */
export default function Preloader() {
  const [done, setDone] = useState(() => {
    try {
      return sessionStorage.getItem('zao.booted') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem('zao.booted', '1');
      } catch {
        /* ignore */
      }
    }, 1900);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <div className={`preloader ${done ? 'is-done' : ''}`} aria-hidden={done}>
      <div className="preloader__inner">
        <svg viewBox="0 0 120 120" className="preloader__mark">
          <polygon points="60,8 106,30 106,74 60,112 14,74 14,30" fill="none" stroke="#efe3c6" strokeWidth="3" />
          <polygon points="60,22 92,38 92,70 60,96 28,70 28,38" fill="#e3b93b" opacity="0.16" />
          <rect x="56" y="30" width="8" height="56" fill="#e3b93b" />
          <rect x="34" y="48" width="52" height="8" fill="#e3b93b" />
          <circle cx="60" cy="60" r="8" fill="#ff5a2b" />
          <path d="M28 92h64" stroke="#efe3c6" strokeWidth="3" />
        </svg>
        <div className="preloader__word">ARMING THE OUTPOST</div>
        <div className="preloader__bar">
          <i />
        </div>
      </div>
    </div>
  );
}
