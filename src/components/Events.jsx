import { MapPin, Clock, Calendar, BookmarkPlus } from 'lucide-react';
import './Events.css';

const Events = () => {
  const addToCalendar = (type) => {
    const event = type === 'reception' ? {
      title: "Vaishnavan & Nagadivya - Wedding Reception",
      start: "20260606T180000",
      end: "20260606T220000",
      location: "Sandhiya Mahal, Bodinayakanur",
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
          <div className="event-icon">
            <Clock size={32} color="var(--gold-accent)" />
          </div>
          <h3>Reception</h3>

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
              <span>Sandhiya Mahal, Bodinayakanur</span>
            </div>
          </div>

          <p className="event-desc">
            Join us for an evening of joy, celebration, and dinner.
          </p>

          <div className="event-actions">
            <a target="_blank" href="https://maps.app.goo.gl/8MCUj75FvA7ypdyL8" className="btn-link">View Map</a>
            <button onClick={() => addToCalendar('reception')} className="btn-calendar">
              <BookmarkPlus size={16} />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>

        <div className="event-card glass-card reveal" style={{ transitionDelay: '0.2s' }}>
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
            <a target="_blank" href="https://maps.app.goo.gl/QigZo7WG7pWRv3Lr5" className="btn-link">View Map</a>
            <button onClick={() => addToCalendar('wedding')} className="btn-calendar">
              <BookmarkPlus size={16} />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
