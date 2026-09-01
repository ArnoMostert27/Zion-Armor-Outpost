import { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import useAuth from '../store/authStore.js';
import useUI from '../store/uiStore.js';

function PlanCard({ plan }) {
  const user = useAuth((s) => s.user);
  const applyProgress = useAuth((s) => s.applyProgress);
  const toast = useUI((s) => s.toast);

  const { data, setData } = useApi(() => api.plan(plan.slug), [plan.slug]);
  const [busy, setBusy] = useState(false);

  const done = new Set(data?.myProgress?.completedDays || []);

  const toggle = async (day) => {
    if (!user) {
      toast('Sign in to track a plan.', { mark: 'HOLD!' });
      return;
    }
    setBusy(true);
    try {
      const result = await api.togglePlanDay(plan.slug, day);
      setData({ ...data, myProgress: result.myProgress });
      if (result.xpAwarded) {
        applyProgress({ xp: result.xp, rank: result.rank });
        toast(`Plan complete. +${result.xpAwarded} XP`, { mark: 'XP!', variant: 'toast--xp' });
      }
    } catch (err) {
      toast(err.message, { mark: 'ERR!' });
    } finally {
      setBusy(false);
    }
  };

  const steps = data?.steps || plan.steps || [];
  const pct = steps.length ? Math.round((done.size / steps.length) * 100) : 0;

  return (
    <article className="panel stack">
      <span className="section-head__eyebrow">{steps.length} days</span>
      <h3 className="card__title">{plan.title}</h3>
      <p className="card__blurb" style={{ WebkitLineClamp: 3 }}>
        {plan.summary}
      </p>

      <div className="xp-sword" style={{ height: 22 }}>
        <div className="xp-sword__fill" style={{ width: `${pct}%` }} />
        <span className="xp-sword__label">{pct}%</span>
      </div>

      <ul className="stack" style={{ marginTop: 'var(--sp-3)' }}>
        {steps.map((step) => (
          <li key={step.day}>
            <button
              className={`chip ${done.has(step.day) ? 'chip--on' : ''}`}
              disabled={busy}
              onClick={() => toggle(step.day)}
              style={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none' }}
            >
              <strong>Day {step.day}</strong> · {step.title} · {step.passage}
            </button>
          </li>
        ))}
      </ul>

      {plan.product && (
        <Link className="btn btn--ghost btn--sm" to={`/rack/${plan.product.slug}`}>
          Pairs with {plan.product.title}
        </Link>
      )}
    </article>
  );
}

export default function Plans() {
  const { data: plans, loading } = useApi(() => api.plans(), []);

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Track it</span>
            <h1 className="section-head__title">Reading Plans</h1>
          </div>
          <p className="section-head__note">
            Short tracks tied to the comics. Finish one and it is worth 100 XP toward your rank.
          </p>
        </div>

        {loading ? (
          <div className="loader">
            <span>L</span>
            <span>OAD</span>
            <span>ING</span>
          </div>
        ) : (
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {(plans || []).map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
