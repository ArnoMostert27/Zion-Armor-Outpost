import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import useAuth from '../store/authStore.js';
import { BadgeMark, RankSigil } from '../components/ui/Sigils.jsx';
import { rands, shortDate } from '../lib/format.js';

export default function Rank() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const authLoading = useAuth((s) => s.loading);
  const logout = useAuth((s) => s.logout);

  const { data: dossier, loading } = useApi(() => api.rankDossier(), [user?._id], { skip: !user });
  const { data: orders } = useApi(() => api.myOrders(), [user?._id], { skip: !user });

  // Wait for the stored token to be checked before deciding nobody is signed in.
  if (authLoading) {
    return (
      <div className="loader">
        <span>C</span>
        <span>HECK</span>
        <span>ING</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section shell-narrow">
        <div className="panel stack" style={{ textAlign: 'center' }}>
          <h1>Not enlisted</h1>
          <p className="text-dim">Sign in to see your rank, badges and supply runs.</p>
          <Link className="btn btn--primary" to="/gate">
            Open the gate
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !dossier) {
    return (
      <div className="loader">
        <span>R</span>
        <span>EAD</span>
        <span>ING</span>
      </div>
    );
  }

  const held = new Set(dossier.badges.map((b) => b.key));
  const pct = Math.round(dossier.progress * 100);

  return (
    <div className="section">
      <div className="shell stack">
        {/* --- hero --------------------------------------------------- */}
        <div className="rank-hero">
          <RankSigil className="rank-sigil" />
          <div className="stack" style={{ width: '100%' }}>
            <span className="section-head__eyebrow">{user.name}</span>
            <h1 className="section-head__title">{dossier.rank.name}</h1>
            <p className="text-dim">{dossier.rank.perk}</p>

            <div className="xp-sword">
              <div className="xp-sword__fill" style={{ width: `${pct}%` }} />
              <span className="xp-sword__label">
                {dossier.xp} XP
                {dossier.nextRank ? ` · ${dossier.nextRank.xp - dossier.xp} to ${dossier.nextRank.name}` : ' · MAX'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
              <span className="text-dim">Supply runs: <strong>{dossier.orderCount}</strong></span>
              <span className="text-dim">Titles owned: <strong>{dossier.titlesOwned}</strong></span>
              <span className="text-dim">Visit streak: <strong>{dossier.streak}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              {user.role === 'keeper' && (
                <Link className="btn btn--sm" to="/ledger">
                  Keeper&apos;s Ledger
                </Link>
              )}
              <button
                className="btn btn--ghost btn--sm"
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                Stand down
              </button>
            </div>
          </div>
        </div>

        {/* --- badges ------------------------------------------------- */}
        <section className="section" style={{ paddingBlock: 'var(--sp-7)' }}>
          <div className="section-head">
            <h2 className="section-head__title">Badges</h2>
            <p className="section-head__note">
              {held.size} of {dossier.allBadges.length} earned.
            </p>
          </div>

          <div className="badge-grid">
            {dossier.allBadges.map((badge, index) => (
              <motion.div
                key={badge.key}
                className={`badge ${held.has(badge.key) ? '' : 'is-locked'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <BadgeMark badge={badge.key} className="badge__mark" />
                <span className="badge__name">{badge.name}</span>
                <span className="text-dim" style={{ fontSize: 'var(--step--2)' }}>
                  {badge.description}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- supply runs -------------------------------------------- */}
        <section className="section" style={{ paddingBlock: 'var(--sp-7)' }}>
          <div className="section-head">
            <h2 className="section-head__title">Supply Runs</h2>
          </div>

          {!orders?.length ? (
            <div className="panel" style={{ textAlign: 'center' }}>
              <p className="text-dim">No runs logged yet.</p>
            </div>
          ) : (
            <div className="timeline">
              {orders.map((order) => (
                <div key={order._id} className="timeline__item">
                  <div className="report__head">
                    <span className="report__name">{order.reference}</span>
                    <span className="status-pill" data-s={order.status}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-dim" style={{ fontSize: 'var(--step--1)' }}>
                    {shortDate(order.createdAt)} · {order.items.length} item
                    {order.items.length === 1 ? '' : 's'} · {rands(order.grandTotal)} · +{order.xpAwarded} XP
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    {order.items.map((item) => (
                      <img
                        key={item.slug}
                        src={item.coverImage}
                        alt={item.title}
                        width="44"
                        style={{ border: '2px solid var(--line-strong)', aspectRatio: '2/3', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
