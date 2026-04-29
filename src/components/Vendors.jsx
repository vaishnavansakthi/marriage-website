import React from 'react';
import './Vendors.css';
import { sendEvent } from '../utils/analytics';

const vendors = [
  {
    category: 'Mahal / Venue',
    vendorName: 'Sandhiyas Mahal',
    contactName: '',
    phone: '+91 95979 79632',
    email: 'sandhiyasmahal@example.com',
    instagram: '',
    youtube: '',
    notes: 'Event coordination and mahal arrangements for the wedding reception'
  },
  {
    category: 'DJ & Music',
    vendorName: 'Dragonz Events',
    contactName: 'Mr. Vinoth',
    phone: '+91 75300 38473',
    email: 'arjun@rhythmbeats.in',
    instagram: 'https://www.instagram.com/dragonz_events?igsh=ZXNlZWNidGpsb3pn',
    youtube: '',
    notes: 'Sound, lights and DJ services'
  },
  {
    category: 'Decor & Styling',
    vendorName: 'JMR Decorators',
    contactName: 'Smt. Kalaiselvi',
    phone: '+91 77088 74909',
    email: 'meena@floraldreams.in',
    instagram: 'https://www.instagram.com/thenidecorator?igsh=b2thYTQwbm40cHh4',
    youtube: 'https://www.youtube.com/@jmrdecorators7377',
    notes: 'Stage design, florals and setup'
  },
  {
    category: 'Photography',
    vendorName: 'VStudios',
    contactName: 'Mr. Vivek',
    phone: '+91 99762 40100',
    email: 'ravi@memoriesstudio.com',
    instagram: 'https://www.instagram.com/vstudiosss?igsh=MWxieWxlZTRwdXoxZg==',
    youtube: 'https://www.youtube.com/@vstudioofficial633',
    notes: 'Photography & videography packages'
  }
];

const SocialIcon = ({ type }) => {
  if (type === 'instagram') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'youtube') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" />
      </svg>
    );
  }

  return null;
};

const Vendors = () => {
  return (
    <section className="section vendors-section" id="vendors">
      <div className="section-header reveal">
        <h2 className="gold-text">Special Thanks</h2>
        <div className="divider"></div>
        <p className="subtitle">Grateful acknowledgement to those who helped arrange this celebration.</p>
      </div>

      <div className="vendors-grid reveal">
        {vendors.map((v, i) => (
          <div className="vendor-card glass-card" key={i}>
            <h4 className="vendor-category">{v.category}</h4>
            <h3 className="vendor-name">Special thanks to {v.vendorName}</h3>
            {v.contactName && (
              <p className="vendor-contact"><strong>Representative:</strong> {v.contactName}</p>
            )}
            {v.notes && <p className="vendor-notes">For: {v.notes}.</p>}
            {v.phone && (
              <p className="vendor-phone" style={{marginTop: '0.6rem', color: 'var(--text-muted)'}}>
                <strong>Contact:</strong> <a href={`tel:${v.phone}`} onClick={() => sendEvent('vendor_call', { event_category: 'vendors', event_label: v.vendorName })}>{v.phone}</a>
              </p>
            )}

            {(v.instagram || v.youtube) && (
              <div className="vendor-social" style={{marginTop: '0.5rem'}}>
                {v.instagram && (
                  <a href={v.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link" onClick={() => sendEvent('vendor_social_click', { event_category: 'vendors', event_label: `${v.vendorName} - Instagram` })}>
                    <SocialIcon type="instagram" />
                  </a>
                )}
                {v.youtube && (
                  <a href={v.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-link" onClick={() => sendEvent('vendor_social_click', { event_category: 'vendors', event_label: `${v.vendorName} - YouTube` })}>
                    <SocialIcon type="youtube" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Vendors;
