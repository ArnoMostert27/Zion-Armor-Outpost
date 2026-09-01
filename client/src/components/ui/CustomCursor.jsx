import { useEffect, useRef } from 'react';

/**
 * A two-part cursor: a hard diamond that tracks the pointer exactly and a
 * ring that lags behind. The ring swells over anything interactive.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let frame;

    const onMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      const target = event.target;
      const hot = target.closest?.('a, button, input, select, textarea, [data-hot]');
      ring?.classList.toggle('is-hot', Boolean(hot));
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(45deg)`;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={dotRef}>
        <div className="cursor__dot" />
      </div>
      <div className="cursor__ring" ref={ringRef} />
    </>
  );
}
