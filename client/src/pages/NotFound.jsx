import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const [years, setYears] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setYears((y) => (y >= 40 ? 40 : y + 1));
    }, 90);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="lost">
      <div className="speedlines" style={{ opacity: 0.18 }} />
      <span className="lost__num">404</span>
      <h1>Lost in the wilderness</h1>
      <p className="lost__counter">
        Wandering for {years} year{years === 1 ? '' : 's'}
        {years >= 40 ? ' — that is long enough.' : '...'}
      </p>
      <p className="text-dim" style={{ maxWidth: '44ch' }}>
        Nothing on that road. The outpost is back the way you came.
      </p>
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn btn--primary btn--lg" to="/">
          Back to the outpost
        </Link>
        <Link className="btn btn--lg" to="/racks">
          Straight to the racks
        </Link>
      </div>
    </div>
  );
}
