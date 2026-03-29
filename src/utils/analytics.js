// Lightweight Google Analytics helper
// Usage: import { sendEvent, pageview } from '../utils/analytics';

export function sendEvent(action, params = {}) {
  if (typeof window === 'undefined') return;
  const g = window.gtag || window.dataLayer && window.dataLayer.push ? window.gtag : null;
  if (!g && !window.gtag) return;

  try {
    window.gtag('event', action, params);
  } catch (e) {
    // fail silently in environments without gtag
    // console.warn('gtag not available', e);
  }
}

export function pageview(path) {
  if (typeof window === 'undefined' || !window.gtag) return;
  const GTAG_ID = import.meta.env.VITE_GTAG_ID;
  if (!GTAG_ID) return;
  try {
    window.gtag('config', GTAG_ID, { page_path: path });
  } catch {}
}

export default { sendEvent, pageview };
