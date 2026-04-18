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
  const [showMap, setShowMap] = useState({ reception: false, wedding: false });

  const toggleMap = (type) => {
    setShowMap((prev) => ({ ...prev, [type]: !prev[type] }));
  };

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

          <div className={`map-embed-container ${showMap.reception ? 'active' : ''}`}>
             <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0806934774973!2d77.35376259999998!3d10.010193400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b070d366c693aff%3A0x155ba716ff4a2be0!2sSandiya%20Marriage%20Hall!5e0!3m2!1sen!2sin!4v1776532785251!5m2!1sen!2sin" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Sandhiyas Mahal Map"
              ></iframe>
          </div>

          <div className="event-actions">
            <button 
              className="btn-link" 
              onClick={() => {
                toggleMap('reception');
                sendEvent('toggle_map', { event_category: 'events', event_label: 'Reception Map' });
              }}
            >
              {showMap.reception ? 'Hide Map' : 'View map'}
            </button>
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

          <div className={`map-embed-container ${showMap.wedding ? 'active' : ''}`}>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0749740753054!2d77.350134!3d10.0106659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b070d340232b80d%3A0x4b5bba81608d639e!2sArulmigu%20Shri%20Subramaniya%20Swamy%20Temple!5e0!3m2!1sen!2sin!4v1776532685153!5m2!1sen!2sin" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Temple Map"
              ></iframe>
          </div>

          <div className="event-actions">
            <button 
              className="btn-link" 
              onClick={() => {
                toggleMap('wedding');
                sendEvent('toggle_map', { event_category: 'events', event_label: 'Wedding Map' });
              }}
            >
              {showMap.wedding ? 'Hide Map' : 'View map'}
            </button>
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
