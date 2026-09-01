import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Boots Lenis smooth scrolling and keeps GSAP ScrollTrigger in sync with it.
 * Skipped entirely when the visitor prefers reduced motion.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Scroll velocity drives the halftone streak on the body backdrop.
    let velocityTimer;
    lenis.on('scroll', ({ velocity }) => {
      const stretch = Math.min(3.2, 1 + Math.abs(velocity) * 0.03);
      document.documentElement.style.setProperty('--halftone-size', `${7 * stretch}px`);
      clearTimeout(velocityTimer);
      velocityTimer = setTimeout(() => {
        document.documentElement.style.setProperty('--halftone-size', '7px');
      }, 180);
    });

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      clearTimeout(velocityTimer);
    };
  }, []);
}
