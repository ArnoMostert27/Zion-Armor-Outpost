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

  const signIn = async (email, password) => {
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.name}. Rank: ${user.rank?.name}.`, { mark: 'HAIL!' });
      navigate('/rank');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (mode === 'login') return signIn(form.email, form.password);

    setBusy(true);
    setError(null);
    try {
      const user = await register(form.name, form.email, form.password);
      toast(`Welcome to the outpost, ${user.name}.`, { mark: 'HAIL!' });
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

        {/* Portfolio visitors should not have to invent an account to see the
            store work. One click puts them inside the full flow. */}
        <button
          type="button"
          className="btn btn--ember btn--block"
          disabled={busy}
          onClick={() => signIn('demo@zionarmor.dev', 'demo1234')}
        >
          Try it as a demo visitor
        </button>

        <p className="gate__hint" style={{ textAlign: 'center' }}>
          No sign-up needed. Browse, add to your satchel, build an armor set and place a
          demo order. Nothing is charged and nothing is shipped.
        </p>

        <div className="ink-rule" />

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
          Want to see the admin side? Sign in as the Outpost Keeper:
          <br />
          <code>keeper@zionarmor.dev</code> / <code>keeper123</code>
        </p>

        <Link to="/" className="gate__hint" style={{ textAlign: 'center' }}>
          Back to the outpost
        </Link>
      </form>
    </div>
  );
}
