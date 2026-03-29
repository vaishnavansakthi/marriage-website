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
  try {
    window.gtag('config', 'G-HF0XTDRYV8', { page_path: path });
  } catch (e) {}
}

export default { sendEvent, pageview };
