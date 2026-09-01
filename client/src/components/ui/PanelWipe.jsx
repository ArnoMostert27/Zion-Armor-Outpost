import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { sfx } from '../../lib/sound.js';

/**
 * Route changes shear the screen into five comic panels that slam up
 * and then peel away. Purely decorative - it never blocks input for long.
 */
export default function PanelWipe() {
  const location = useLocation();
  const wrapRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bars = wrapRef.current?.querySelectorAll('i');
    if (!bars?.length) return;

    sfx.panel();

    const tl = gsap.timeline();
    tl.set(bars, { scaleY: 0, transformOrigin: 'bottom' })
      .to(bars, { scaleY: 1, duration: 0.28, ease: 'power3.in', stagger: 0.045 })
      .to(bars, { scaleY: 0, transformOrigin: 'top', duration: 0.3, ease: 'power3.out', stagger: 0.045 }, '>-0.02');

    return () => tl.kill();
  }, [location.pathname]);

  return (
    <div className="panel-wipe" ref={wrapRef} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
