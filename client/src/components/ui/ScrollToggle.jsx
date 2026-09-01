import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScroll from '../../store/scrollStore.js';
import useAuth from '../../store/authStore.js';
import useUI from '../../store/uiStore.js';
import { Icon } from './Sigils.jsx';
import { sfx } from '../../lib/sound.js';

/**
 * The heart that adds a product to The Scroll.
 * Signed-out visitors are sent to the gate rather than silently failing.
 */
export default function ScrollToggle({ productId, label = false, className = '' }) {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const ids = useScroll((s) => s.ids);
  const toggle = useScroll((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);

  const on = ids.includes(productId);

  const handle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast('Sign in to keep a scroll.', { mark: 'HOLD!' });
      navigate('/gate');
      return;
    }

    setBusy(true);
    try {
      const added = await toggle(productId);
      sfx.tick();
      toast(added ? 'Added to your scroll.' : 'Removed from your scroll.', { mark: added ? 'KEPT!' : 'OFF!' });
    } catch (error) {
      toast(error.message, { mark: 'ERR!' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`scroll-toggle ${on ? 'is-on' : ''} ${className}`}
      onClick={handle}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? 'Remove from your scroll' : 'Add to your scroll'}
      title={on ? 'On your scroll' : 'Add to your scroll'}
    >
      <Icon name="heart" size={label ? 18 : 16} />
      {label && <span>{on ? 'On your scroll' : 'Add to scroll'}</span>}
    </button>
  );
}
