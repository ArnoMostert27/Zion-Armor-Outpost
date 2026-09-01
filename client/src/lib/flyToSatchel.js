import gsap from 'gsap';

/**
 * Sends a ghost of the product cover along an arc into the satchel icon,
 * then bumps the counter. Falls back to doing nothing if motion is reduced.
 */
export const flyToSatchel = (sourceEl, imageSrc) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = document.getElementById('satchel-target');
  if (!sourceEl || !target) return;

  const from = sourceEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const ghost = document.createElement('img');
  ghost.src = imageSrc;
  ghost.className = 'fly-ghost';
  ghost.style.left = `${from.left + from.width / 2 - 35}px`;
  ghost.style.top = `${from.top}px`;
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + 52);

  gsap
    .timeline({
      onComplete: () => {
        ghost.remove();
        target.classList.add('is-bumped');
        setTimeout(() => target.classList.remove('is-bumped'), 460);
      },
    })
    .to(ghost, { x: dx * 0.45, y: dy - 140, rotate: -22, duration: 0.42, ease: 'power2.out' })
    .to(ghost, { x: dx, y: dy, rotate: 18, scale: 0.18, opacity: 0.2, duration: 0.44, ease: 'power2.in' });
};

/** Pops a comic burst word at a screen position. */
export const popBurst = (x, y, word = 'POW!') => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.createElement('div');
  el.className = 'burst burst--ember';
  el.textContent = word;
  el.style.position = 'fixed';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.zIndex = '8200';
  el.style.pointerEvents = 'none';
  el.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(el);

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { scale: 0.2, opacity: 0, rotate: -22 },
      { scale: 1.25, opacity: 1, rotate: -6, duration: 0.26, ease: 'back.out(3)' }
    )
    .to(el, { scale: 1.6, opacity: 0, y: -40, duration: 0.5, ease: 'power2.out' });
};

export default flyToSatchel;
