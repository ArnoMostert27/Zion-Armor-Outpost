/**
 * All the site's iconography, drawn inline as SVG so nothing has to be
 * downloaded and every mark inherits the current theme colour.
 */

export const BrandMark = ({ className = '', animated = false }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <polygon points="32,3 58,13 58,32 32,61 6,32 6,13" fill="none" stroke="currentColor" strokeWidth="3" />
    <polygon points="32,11 50,18 50,32 32,52 14,32 14,18" fill="var(--accent)" opacity="0.18" />
    <path d="M32 14 v34" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M22 24 h20" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="32" cy="32" r="4" fill="var(--accent-2)">
      {animated && <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />}
    </circle>
  </svg>
);

export const ArmorIcon = ({ piece, className = '' }) => {
  const marks = {
    helmet: (
      <>
        <path d="M12 30a20 20 0 0 1 40 0v14a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M32 10v42" stroke="currentColor" strokeWidth="3" />
        <path d="M20 34h24" stroke="currentColor" strokeWidth="3" />
      </>
    ),
    breastplate: (
      <>
        <path d="M16 12h32l4 14-6 30H22L16 26Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 12v44" stroke="currentColor" strokeWidth="3" />
        <path d="M20 28h24M21 40h22" stroke="currentColor" strokeWidth="2.4" />
      </>
    ),
    belt: (
      <>
        <rect x="6" y="24" width="52" height="16" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="24" y="18" width="16" height="28" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
      </>
    ),
    shield: (
      <>
        <path d="M32 6 56 15v20c0 14-12 20-24 24C20 55 8 49 8 35V15Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 16v30M20 28h24" stroke="currentColor" strokeWidth="3" />
      </>
    ),
    sword: (
      <>
        <path d="M32 4 38 18v26l-6 14-6-14V18Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M16 44h32" stroke="currentColor" strokeWidth="3.4" />
        <path d="M32 44v14" stroke="currentColor" strokeWidth="3.4" />
      </>
    ),
    boots: (
      <>
        <path d="M18 8h14v26l14 8v14H18Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 44h28" stroke="currentColor" strokeWidth="2.6" />
        <path d="M22 16h8M22 24h8" stroke="currentColor" strokeWidth="2.2" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {marks[piece] || marks.shield}
    </svg>
  );
};

export const BadgeMark = ({ badge, className = '' }) => {
  const marks = {
    'first-blood': <path d="M32 8 44 32 32 56 20 32Z" fill="var(--accent-2)" stroke="currentColor" strokeWidth="3" />,
    'goliath-slayer': (
      <>
        <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="32" r="8" fill="var(--accent)" />
      </>
    ),
    'full-plate': (
      <>
        <polygon points="32,8 52,18 52,38 32,56 12,38 12,18" fill="var(--accent)" opacity="0.3" stroke="currentColor" strokeWidth="3" />
        <path d="M32 16v30" stroke="currentColor" strokeWidth="3" />
      </>
    ),
    scribe: (
      <>
        <rect x="14" y="10" width="36" height="44" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M22 22h20M22 32h20M22 42h12" stroke="var(--accent)" strokeWidth="3" />
      </>
    ),
    'faithful-watch': (
      <>
        <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M32 18v16l11 6" stroke="var(--accent)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </>
    ),
    collector: (
      <>
        <rect x="10" y="18" width="12" height="34" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="26" y="12" width="12" height="40" fill="var(--accent)" opacity="0.3" stroke="currentColor" strokeWidth="3" />
        <rect x="42" y="22" width="12" height="30" fill="none" stroke="currentColor" strokeWidth="3" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {marks[badge] || marks['first-blood']}
    </svg>
  );
};

export const RankSigil = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="rankGlow" cx="50%" cy="45%">
        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="55" fill="url(#rankGlow)" />
    <polygon points="60,10 104,32 104,74 60,110 16,74 16,32" fill="none" stroke="var(--accent)" strokeWidth="3" />
    <polygon points="60,24 92,40 92,70 60,96 28,70 28,40" fill="var(--accent)" opacity="0.14" />
    <path d="M60 30v56M42 48h36" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="60" r="7" fill="var(--accent-2)" />
  </svg>
);

export const WaxSeal = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <circle cx="60" cy="60" r="50" fill="var(--blood)" />
    <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" />
    <polygon points="60,26 88,42 88,72 60,94 32,72 32,42" fill="none" stroke="#f3e6c8" strokeWidth="3" />
    <path d="M60 36v44M44 54h32" stroke="#f3e6c8" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const StainedGlass = ({ className = '' }) => (
  <svg viewBox="0 0 180 240" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="glassA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#35e7dc" />
        <stop offset="100%" stopColor="#7b6bff" />
      </linearGradient>
      <linearGradient id="glassB" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#e3b93b" />
        <stop offset="100%" stopColor="#ff5a2b" />
      </linearGradient>
    </defs>
    <path d="M10 90a80 80 0 0 1 160 0v140H10Z" fill="var(--bg-raised)" stroke="currentColor" strokeWidth="4" />
    <path d="M30 92a60 60 0 0 1 120 0v50H30Z" fill="url(#glassA)" opacity="0.75">
      <animate attributeName="opacity" values="0.55;0.9;0.55" dur="6s" repeatCount="indefinite" />
    </path>
    <path d="M30 150h120v70H30Z" fill="url(#glassB)" opacity="0.6">
      <animate attributeName="opacity" values="0.45;0.8;0.45" dur="7.5s" repeatCount="indefinite" />
    </path>
    <path d="M90 32v198M30 150h120M30 92h120" stroke="var(--ink)" strokeWidth="5" />
    <circle cx="90" cy="120" r="18" fill="var(--parchment)" opacity="0.85">
      <animate attributeName="r" values="16;21;16" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const Icon = ({ name, size = 20, className = '' }) => {
  const paths = {
    satchel: 'M4 8h16l-1.4 12.2A2 2 0 0 1 16.6 22H7.4a2 2 0 0 1-2-1.8L4 8Zm4 0V6a4 4 0 0 1 8 0v2',
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm5.5 12.5L21 21',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
    close: 'M5 5l14 14M19 5 5 19',
    menu: 'M4 7h16M4 12h16M4 17h16',
    moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z',
    sun: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0-5v3m0 18v-3M1 12h3m18 0h-3M4.2 4.2l2.1 2.1m13.6 13.6-2.1-2.1M4.2 19.8l2.1-2.1M17.8 6.3l2.1-2.1',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    arrowRight: 'M4 12h15m-6-7 7 7-7 7',
    arrowLeft: 'M20 12H5m6 7-7-7 7-7',
    heart: 'M12 20s-8-4.8-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.2-8 10-8 10Z',
    book: 'M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4Zm16 0h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7Z',
    volume: 'M4 9v6h4l5 4V5L8 9H4Zm12 .5a4 4 0 0 1 0 5m3-8a8 8 0 0 1 0 11',
    mute: 'M4 9v6h4l5 4V5L8 9H4Zm12 1.5 5 5m0-5-5 5',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name] || paths.close} />
    </svg>
  );
};
