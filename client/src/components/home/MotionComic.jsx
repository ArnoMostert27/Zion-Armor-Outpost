import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    id: 'p1',
    kicker: '1 Samuel 17',
    line: 'Forty days. One voice.',
    sub: 'Every morning the giant walks out and shouts. Every morning the army goes quiet.',
    from: { x: -160, rotate: -6 },
  },
  {
    id: 'p2',
    kicker: 'The errand',
    line: 'Bread. Cheese. A message.',
    sub: 'A shepherd is sent to the front line with lunch for his brothers. That is all.',
    from: { y: -140, rotate: 4 },
  },
  {
    id: 'p3',
    kicker: 'The argument',
    line: '“Who is this Philistine?”',
    sub: 'He has already fought a lion. He has already fought a bear. Nobody remembers.',
    from: { x: 180, rotate: 5 },
  },
  {
    id: 'p4',
    kicker: 'The armor that did not fit',
    line: 'He took it off.',
    sub: 'The king’s armor was the wrong shape. He went out with what was already his.',
    from: { x: -180, rotate: 7 },
  },
  {
    id: 'p5',
    kicker: 'The stone',
    line: 'The battle is the Lord’s.',
    sub: 'One stone. One sling. One line that outlived every sword in the valley.',
    from: { y: 160, rotate: -5 },
  },
];

/**
 * A scroll-driven motion comic. The stage pins to the viewport while panels
 * slam in one at a time and onomatopoeia bursts pop between them.
 */
export default function MotionComic() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panels = root.querySelectorAll('.comic-panel');
    const bursts = root.querySelectorAll('.comic__burst');
    const bar = root.querySelector('.comic__progress');

    if (reduced) {
      gsap.set(panels, { opacity: 1, x: 0, y: 0, rotate: 0 });
      gsap.set(bursts, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            if (bar) bar.style.width = `${self.progress * 100}%`;
          },
        },
      });

      PANELS.forEach((panel, index) => {
        const el = root.querySelector(`.comic-panel--${panel.id}`);
        if (!el) return;

        tl.fromTo(
          el,
          { opacity: 0, ...panel.from, scale: 0.92 },
          { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 1, ease: 'power3.out' },
          index * 1.1
        );

        // Ink lines draw themselves along the panel border.
        tl.fromTo(
          el,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut' },
          index * 1.1
        );
      });

      bursts.forEach((burst, index) => {
        tl.fromTo(
          burst,
          { opacity: 0, scale: 0.2, rotate: -24 },
          { opacity: 1, scale: 1, rotate: -6, duration: 0.45, ease: 'back.out(3)' },
          index * 1.6 + 0.9
        ).to(burst, { opacity: 0, scale: 1.5, duration: 0.5 }, index * 1.6 + 1.9);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="comic" ref={rootRef} aria-label="The Shepherd and the Giant">
      <div className="comic__scroller">
        <div className="comic__sticky">
          <div className="comic__stage">
            {PANELS.map((panel) => (
              <article key={panel.id} className={`comic-panel comic-panel--${panel.id} halftone`}>
                <span className="comic-panel__kicker">{panel.kicker}</span>
                <h3 className="comic-panel__line">{panel.line}</h3>
                <p className="comic-panel__sub">{panel.sub}</p>
              </article>
            ))}

            <span className="comic__burst comic__burst--1 burst">KRA-KOOM!</span>
            <span className="comic__burst comic__burst--2 burst burst--ember">THWIP!</span>
            <span className="comic__burst comic__burst--3 burst burst--cyan">SHKKT!</span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 'var(--sp-6)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 7,
            }}
          >
            <Link to="/rack/little-shield-david" className="btn btn--primary">
              Read the whole issue
            </Link>
          </div>

          <div className="comic__progress" />
        </div>
      </div>
    </section>
  );
}
