import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../store/authStore.js';
import useUI from '../store/uiStore.js';

export default function Gate() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const toast = useUI((s) => s.toast);

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await login(form.email, form.password)
          : await register(form.name, form.email, form.password);
      toast(`Welcome back, ${user.name}. Rank: ${user.rank?.name}.`, { mark: 'HAIL!' });
      navigate('/rank');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gate">
      <form className="gate__card" onSubmit={submit}>
        <span className="section-head__eyebrow">The gate</span>
        <h1 className="gate__title">{mode === 'login' ? 'Sign in' : 'Enlist'}</h1>

        {error && <div className="alert">{error}</div>}

        {mode === 'register' && (
          <label className="field">
            <span className="field__label">Name</span>
            <input
              className="field__input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}

        <label className="field">
          <span className="field__label">Email</span>
          <input
            className="field__input"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="field__input"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Checking...' : mode === 'login' ? 'Open the gate' : 'Enlist'}
        </button>

        <p className="gate__hint">
          {mode === 'login' ? 'No papers yet? ' : 'Already enlisted? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Enlist here' : 'Sign in'}
          </button>
        </p>

        <p className="gate__hint">
          Demo Keeper: <code>keeper@zionarmor.dev</code> / <code>keeper123</code>
          <br />
          Demo recruit: <code>arno@zionarmor.dev</code> / <code>recruit123</code>
        </p>

        <Link to="/" className="gate__hint" style={{ textAlign: 'center' }}>
          Back to the outpost
        </Link>
      </form>
    </div>
  );
}
