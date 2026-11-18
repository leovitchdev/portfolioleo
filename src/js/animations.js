import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const heroItems = gsap.utils.toArray('.hero__eyebrow, .hero__title, .hero__copy, .hero__content .button');
    if (heroItems.length) {
      gsap.from(heroItems, {
        autoAlpha: 0,
        yPercent: 100,
        duration: 1,
        stagger: 0.09,
        ease: 'power4.out',
        delay: 0.08,
        clearProps: 'all',
      });
    }

    gsap.utils.toArray('[data-reveal]').forEach(element => {
      gsap.from(element, {
        autoAlpha: 0,
        // Keep the transformed box within its normal scroll threshold. A full-height
        // offset makes near-viewport cards look absent until the visitor scrolls past them.
        y: 24,
        duration: 1,
        ease: 'power4.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: element,
          // Animate elements that enter the viewport, but treat anything already
          // visible on initial load as visible so the first fold never looks empty.
          start: 'top 96%',
          once: true,
        },
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh, { once: true });
    return () => {
      window.removeEventListener('load', refresh);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  });
}
