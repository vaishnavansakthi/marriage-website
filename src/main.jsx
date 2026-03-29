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

// Inject absolute social meta tags when VITE_SITE_URL is provided so crawlers see full URLs
function injectSocialMeta(siteUrl) {
  if (!siteUrl) return;
  try {
    const imagePath = '/social-share-1200x630.png';
    const imageUrl = new URL(imagePath, siteUrl).toString();

    const setMeta = (attr, value, isProperty = false) => {
      let selector = isProperty ? `meta[property="${attr}"]` : `meta[name="${attr}"]`;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', attr); else el.setAttribute('name', attr);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Open Graph
    setMeta('og:url', siteUrl, true);
    setMeta('og:image', imageUrl, true);
    setMeta('og:image:secure_url', imageUrl, true);

    // Twitter
    setMeta('twitter:image', imageUrl, false);
    // generic image_src
    let imgSrc = document.head.querySelector('link[rel="image_src"]');
    if (!imgSrc) {
      imgSrc = document.createElement('link');
      imgSrc.setAttribute('rel', 'image_src');
      document.head.appendChild(imgSrc);
    }
    imgSrc.setAttribute('href', imageUrl);
  } catch {
    // ignore
  }
}

const SITE_URL = import.meta.env.VITE_SITE_URL;
if (SITE_URL) injectSocialMeta(SITE_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
