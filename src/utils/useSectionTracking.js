import { useEffect, useRef } from 'react';
import { sendEvent } from './analytics';

/**
 * Section engagement tracking via Google Analytics.
 *
 * Fires:
 *  • `section_view`        – once when a section first enters the viewport (≥20% visible)
 *  • `section_engagement`  – when a section leaves the viewport, with the total seconds
 *                            the user spent viewing it during that visit
 *  • `scroll_depth`        – when the user reaches the bottom 10% of the page
 *
 * Usage: call useSectionTracking() inside App after loading is complete.
 *        It targets elements that have a data-track-section attribute OR an id attribute
 *        within `.content-wrapper`.
 */

// Human-readable labels for each section id
const SECTION_LABELS = {
  home: 'Hero / Home',
  story: 'Our Journey',
  'family-tree': 'Family Heritage',
  'guest-map': 'Guest Map',
  moments: 'Photo Wall',
  albums: 'Ceremony Albums',
  'journey-map': 'Journey Map',
  puzzle: 'Puzzle Game',
  events: 'Wedding Events',
  vendors: 'Vendors',
  playlist: 'Song Requests',
  blessings: 'Blessings',
  footer: 'Footer',
};

export default function useSectionTracking() {
  // Keep refs so they persist across renders without causing re-subscriptions
  const viewedRef = useRef(new Set());       // ids that have already fired section_view
  const timerRef = useRef({});               // id → { start: timestamp, total: ms }
  const scrollDepthFiredRef = useRef(false);

  useEffect(() => {
    // Abort gracefully if gtag isn't loaded
    if (typeof window === 'undefined' || !window.gtag) return;

    // ── Section visibility tracking ─────────────────────────────────────────

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-track-section') || entry.target.id;
        if (!id) return;

        const label = SECTION_LABELS[id] || id;

        if (entry.isIntersecting) {
          // ── Section entered viewport ───────────────────────────────────
          // Fire section_view only the first time
          if (!viewedRef.current.has(id)) {
            viewedRef.current.add(id);
            sendEvent('section_view', {
              event_category: 'engagement',
              event_label: label,
              section_id: id,
            });
          }

          // Start (or resume) engagement timer
          if (!timerRef.current[id]) {
            timerRef.current[id] = { start: Date.now(), total: 0 };
          } else {
            timerRef.current[id].start = Date.now();
          }
        } else {
          // ── Section left viewport ──────────────────────────────────────
          const t = timerRef.current[id];
          if (t && t.start) {
            t.total += Date.now() - t.start;
            t.start = null; // pause timer

            const seconds = Math.round(t.total / 1000);
            if (seconds >= 2) {
              // Only report meaningful engagement (≥ 2 s)
              sendEvent('section_engagement', {
                event_category: 'engagement',
                event_label: label,
                section_id: id,
                engagement_seconds: seconds,
                value: seconds,
              });
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      threshold: 0.2, // fire when 20% of the section is visible
      rootMargin: '0px',
    });

    // Observe every section with an id inside the content wrapper
    const wrapper = document.querySelector('.content-wrapper');
    if (wrapper) {
      const sections = wrapper.querySelectorAll('section[id], footer[id], [data-track-section]');
      sections.forEach((el) => observer.observe(el));
    }

    // ── Scroll depth tracking ───────────────────────────────────────────────

    const handleScroll = () => {
      if (scrollDepthFiredRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);
      if (pct >= 90) {
        scrollDepthFiredRef.current = true;
        sendEvent('scroll_depth', {
          event_category: 'engagement',
          event_label: '90% scroll',
          value: pct,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ── Flush engagement timers on page unload ──────────────────────────────

    const flush = () => {
      Object.entries(timerRef.current).forEach(([id, t]) => {
        if (t.start) {
          t.total += Date.now() - t.start;
          t.start = null;
        }
        const seconds = Math.round(t.total / 1000);
        if (seconds >= 2) {
          const label = SECTION_LABELS[id] || id;
          sendEvent('section_engagement', {
            event_category: 'engagement',
            event_label: label,
            section_id: id,
            engagement_seconds: seconds,
            value: seconds,
          });
        }
      });
    };

    window.addEventListener('beforeunload', flush);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', flush);
    };
  }, []); // run once when mounted
}
