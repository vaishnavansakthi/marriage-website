import { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, BookmarkPlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import mahalImg from '../assets/sandhiya mahal.webp';
import templeImg from '../assets/temple.webp';
import './Events.css';
import './Gallery.css';
import { sendEvent } from '../utils/analytics';

const EVENT_IMAGES = [
  { src: mahalImg, title: 'Reception — Sandhiyas Mahal' },
  { src: templeImg, title: 'Wedding — Arulmigu Sri Subramaniya Swamy Temple' },
];

const Events = () => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextImg = () => {
    setLightboxIndex((i) => (i + 1) % EVENT_IMAGES.length);
  };

  const prevImg = () => {
    setLightboxIndex((i) => (i - 1 + EVENT_IMAGES.length) % EVENT_IMAGES.length);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        document.body.style.overflow = 'unset';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex]);

  const addToCalendar = (type) => {
    const event = type === 'reception' ? {
      title: "Vaishnavan & Nagadivya - Wedding Reception",
      start: "20260606T180000",
      end: "20260606T220000",
      location: "Sandhiyas Mahal, Bodinayakanur",
      desc: "Join us for an evening of joy and celebration!"
    } : {
      title: "Vaishnavan & Nagadivya - Wedding Ceremony",
      start: "20260607T080000",
      end: "20260607T090000",
      location: "Arulmigu Sri Subramaniya Swamy Temple, Bodinayakanur",
      desc: "We invite you to witness our sacred union."
    };

    // Google Calendar Link
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.desc)}&location=${encodeURIComponent(event.location)}`;
    
    // Analytics: record calendar add
    sendEvent('add_to_calendar', {
      event_category: 'events',
      event_label: event.title,
      value: type,
    });

    window.open(googleUrl, '_blank');
  };
  return (
    <section className="section events-section" id="events">
      <div className="section-header reveal">
        <h2 className="gold-text">Wedding Events</h2>
        <div className="divider"></div>
        <p className="subtitle">Join us in celebrating our special day.</p>
      </div>

      <div className="events-grid">
        <div className="event-card glass-card reveal">
          <button
            type="button"
            className="event-card-image-btn"
            onClick={() => openLightbox(0)}
            aria-label="View reception venue photo full size"
          >
            <img src={mahalImg} alt="" />
          </button>
          <div className="event-icon">
            <Clock size={32} color="var(--gold-accent)" />
          </div>
          <h3>Engagement</h3>

          <div className="event-details">
            <div className="detail-item">
              <Calendar size={16} />
              <span>06.06.2026, Saturday</span>
            </div>
            <div className="detail-item">
              <Clock size={16} />
              <span>6:00 PM onwards</span>
            </div>
            <div className="detail-item">
              <MapPin size={16} />
              <span>Sandhiyas Mahal, Bodinayakanur</span>
            </div>
          </div>

          <p className="event-desc">
            Join us for an evening of joy, celebration, and dinner.
          </p>

          <div className="event-actions">
            <a target="_blank" href="https://maps.app.goo.gl/8MCUj75FvA7ypdyL8" className="btn-link" onClick={() => sendEvent('view_map', { event_category: 'events', event_label: 'Reception Map' })} rel="noreferrer">View Map</a>
            <button onClick={() => addToCalendar('reception')} className="btn-calendar">
              <BookmarkPlus size={16} />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>

        <div className="event-card glass-card reveal" style={{ transitionDelay: '0.2s' }}>
          <button
            type="button"
            className="event-card-image-btn"
            onClick={() => openLightbox(1)}
            aria-label="View wedding temple photo full size"
          >
            <img src={templeImg} alt="" />
          </button>
          <div className="event-icon">
            <Calendar size={32} color="var(--gold-accent)" />
          </div>
          <h3>Wedding</h3>

          <div className="event-details">
            <div className="detail-item">
              <Calendar size={16} />
              <span>07.06.2026, Sunday</span>
            </div>
            <div className="detail-item">
              <Clock size={16} />
              <span>8:00 AM to 9:00 AM</span>
            </div>
            <div className="detail-item">
              <MapPin size={16} />
              <span>Arulmigu Sri Subramaniya Swamy Temple, Bodinayakanur</span>
            </div>
          </div>

          <p className="event-desc">
            We invite you to witness our sacred union and bless us on our special morning.
          </p>

          <div className="event-actions">
            <a target="_blank" href="https://maps.app.goo.gl/QigZo7WG7pWRv3Lr5" className="btn-link" onClick={() => sendEvent('view_map', { event_category: 'events', event_label: 'Wedding Map' })} rel="noreferrer">View Map</a>
            <button onClick={() => addToCalendar('wedding')} className="btn-calendar">
              <BookmarkPlus size={16} />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay active events-lightbox" onClick={closeLightbox}>
          <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close full size image">
            <X size={32} />
          </button>
          <button
            type="button"
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); prevImg(); }}
            aria-label="Previous image"
          >
            <ChevronLeft size={48} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={EVENT_IMAGES[lightboxIndex].src} alt="" />
            <p className="lightbox-caption">{EVENT_IMAGES[lightboxIndex].title}</p>
          </div>
          <button
            type="button"
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); nextImg(); }}
            aria-label="Next image"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Events;
