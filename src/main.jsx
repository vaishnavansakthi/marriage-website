import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dynamically inject gtag when VITE_GTAG_ID is provided.
function loadGtag(gtagId) {
  if (!gtagId) return;
  try {
    // avoid injecting twice
    if (document.querySelector(`script[data-gtag-id="${gtagId}"]`)) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    s.setAttribute('data-gtag-id', gtagId);
    document.head.appendChild(s);

    const inline = document.createElement('script');
    inline.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gtagId}');`;
    document.head.appendChild(inline);
  } catch {
    // fail silently
  }
}

// Load only when ID is provided (set via .env as VITE_GTAG_ID)
const GTAG_ID = import.meta.env.VITE_GTAG_ID;
if (GTAG_ID) loadGtag(GTAG_ID);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
