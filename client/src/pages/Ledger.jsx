import { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import api from '../api/client.js';
import useAuth from '../store/authStore.js';
import useUI from '../store/uiStore.js';
import ProductForm from '../components/ui/ProductForm.jsx';
import { rands, shortDate } from '../lib/format.js';

const TABS = ['Overview', 'Orders', 'Products', 'Users'];

const STATUSES = ['placed', 'packing', 'dispatched', 'delivered', 'cancelled'];

export default function Ledger() {
  const user = useAuth((s) => s.user);
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit

  const isKeeper = user?.role === 'keeper';

  const { data: stats } = useApi(() => api.orderStats(), [tab], { skip: !isKeeper });
  const { data: orders, refetch: refetchOrders } = useApi(() => api.allOrders(), [tab], { skip: !isKeeper });
  const { data: products, refetch: refetchProducts } = useApi(() => api.products({ limit: 48 }), [tab], {
    skip: !isKeeper,
  });
  const { data: users } = useApi(() => api.users(), [tab], { skip: !isKeeper });

  if (!isKeeper) {
    return (
      <div className="section shell-narrow">
        <div className="panel stack" style={{ textAlign: 'center' }}>
          <span className="stamp">Restricted</span>
          <h1>Only the Keeper may pass</h1>
          <Link className="btn btn--primary" to="/">
            Back to the outpost
          </Link>
        </div>
      </div>
    );
  }

  const setStatus = async (id, status) => {
    try {
      await api.setOrderStatus(id, status);
      toast('Ledger updated.', { mark: 'OK!' });
      refetchOrders();
    } catch (err) {
      toast(err.message, { mark: 'ERR!' });
    }
  };

  const removeProduct = async (id, title) => {
    try {
      await api.deleteProduct(id);
      toast(`${title} struck from the ledger.`, { mark: 'GONE!' });
      refetchProducts();
    } catch (err) {
      toast(err.message, { mark: 'ERR!' });
    }
  };

  const maxRevenue = Math.max(1, ...(stats?.daily || []).map((d) => d.revenue));

  return (
    <div className="section">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Restricted</span>
            <h1 className="section-head__title">The Keeper&apos;s Ledger</h1>
          </div>
        </div>

        <div className="ledger__tabs">
          {TABS.map((label) => (
            <button
              key={label}
              className={`ledger__tab ${tab === label ? 'is-on' : ''}`}
              onClick={() => setTab(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* --- overview ------------------------------------------------ */}
        {tab === 'Overview' && (
          <>
            <div className="stat-row">
              <div className="stat">
                <span className="stat__label">Revenue</span>
                <span className="stat__value">{rands(stats?.revenue || 0)}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Supply runs</span>
                <span className="stat__value">{stats?.orders || 0}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Units moved</span>
                <span className="stat__value">{stats?.units || 0}</span>
              </div>
              <div className="stat">
                <span className="stat__label">Low stock</span>
                <span className="stat__value">{stats?.lowStock?.length || 0}</span>
              </div>
            </div>

            <div className="panel" style={{ marginBottom: 'var(--sp-6)' }}>
              <h3 className="card__title">Revenue by day</h3>
              <div className="bars">
                {(stats?.daily || []).map((day) => (
                  <div
                    key={day._id}
                    className="bars__bar"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                    title={`${day._id}: ${rands(day.revenue)}`}
                  />
                ))}
                {(!stats?.daily || stats.daily.length === 0) && (
                  <p className="text-dim">No runs logged yet.</p>
                )}
              </div>
            </div>

            <div className="grid-cards">
              <div className="panel">
                <h3 className="card__title">Top sellers</h3>
                <table className="spec-table">
                  <tbody>
                    {(stats?.topSellers || []).map((row) => (
                      <tr key={row._id}>
                        <th>{row._id}</th>
                        <td>
                          {row.units} units · {rands(row.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <h3 className="card__title">Racks running empty</h3>
                <table className="spec-table">
                  <tbody>
                    {(stats?.lowStock || []).map((row) => (
                      <tr key={row._id}>
                        <th>{row.title}</th>
                        <td>{row.stock} left</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* --- orders --------------------------------------------------- */}
        {tab === 'Orders' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Recruit</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((order) => (
                  <tr key={order._id}>
                    <td>{order.reference}</td>
                    <td>{order.user?.name}</td>
                    <td>{shortDate(order.createdAt)}</td>
                    <td>{rands(order.grandTotal)}</td>
                    <td>{order.isPaid ? 'Yes' : 'No'}</td>
                    <td>
                      <select
                        className="field__select"
                        value={order.status}
                        onChange={(e) => setStatus(order._id, e.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- products ------------------------------------------------- */}
        {tab === 'Products' && (
          <div>
            <div className="shop__bar">
              <span className="shop__count">{products?.total || 0} titles on the racks</span>
              <button className="btn btn--primary btn--sm" onClick={() => setEditing({})}>
                New product
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Rack</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(products?.items || []).map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.coverImage}
                        alt=""
                        width="36"
                        style={{ aspectRatio: '2/3', objectFit: 'cover', border: '1px solid var(--line)' }}
                      />
                    </td>
                    <td>
                      <Link to={`/rack/${product.slug}`}>{product.title}</Link>
                    </td>
                    <td>{product.category}</td>
                    <td>{rands(product.price)}</td>
                    <td>{product.stock}</td>
                    <td style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <button className="btn btn--sm" onClick={() => setEditing(product)}>
                        Edit
                      </button>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => removeProduct(product._id, product.title)}
                      >
                        Strike
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* --- users ---------------------------------------------------- */}
        {tab === 'Users' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Rank</th>
                  <th>XP</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((row) => (
                  <tr key={row._id}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td>{row.rank?.name}</td>
                    <td>{row.xp}</td>
                    <td>{shortDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing._id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(saved, wasEditing) => {
            toast(
              wasEditing ? `${saved.title} amended.` : `${saved.title} added to the racks.`,
              { mark: 'OK!' }
            );
            refetchProducts();
          }}
        />
      )}
    </div>
  );
}
