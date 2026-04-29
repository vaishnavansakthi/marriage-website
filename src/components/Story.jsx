import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Story.css';
import './Gallery.css';
import { sendEvent } from '../utils/analytics';

const STORY_HERO = {
  src: '/engage.jpeg',
  title: 'Vaishnavan & Nagadivya',
};

const Story = () => {
  const [showFullStory, setShowFullStory] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    sendEvent('story_photo_lightbox', { event_category: 'story', event_label: 'Open Photo' });
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        document.body.style.overflow = 'unset';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  return (
    <section className="section story-section" id="story" style={{ zIndex: lightboxOpen ? 20000 : undefined }}>
      <div className="section-header reveal">
        <h2 className="gold-text">Our Journey</h2>
        <div className="divider"></div>
        <p className="subtitle">Every love story is beautiful, but ours is our favorite.</p>

        <button
          type="button"
          className="story-hero-image-btn"
          onClick={openLightbox}
          aria-label="View photo full size"
        >
          <img src={STORY_HERO.src} alt="Vaishnavan and Nagadivya" />
        </button>
      </div>

      <div className="timeline">
        <div className="timeline-item reveal">
          <div className="timeline-dot"></div>
          <div className="timeline-content right glass-card">
            <span className="timeline-date">February 5, 2026</span>
            <h3>The First Call</h3>
            <p>We first spoke on the phone to get to know each other. That initial conversation sparked a connection that we instantly knew was special.</p>
          </div>
        </div>

        <div className="timeline-item reveal">
          <div className="timeline-dot"></div>
          <div className="timeline-content left glass-card">
            <span className="timeline-date">February 8, 2026</span>
            <h3>Ponnu Paarkum & The Proposal</h3>
            <p>We met in person for the 'ponnu paarkum' ceremony at her home with our families. On that very same “Propose Day”, I took a leap of faith and proposed to her. Moved by our wonderful conversations and my kind behavior, she happily said a big YES!</p>
          </div>
        </div>

        <div className="timeline-item reveal">
          <div className="timeline-dot"></div>
          <div className="timeline-content right glass-card">
            <span className="timeline-date">February 22, 2026</span>
            <h3>Flowering Ceremony</h3>
            <p>We celebrated our official Flowering Ceremony in Madurai, joyously surrounded by all our family members. With their heartfelt blessings, our two families formally became one!</p>
          </div>
        </div>

        {showFullStory && (
          <>
            <div className="timeline-item reveal-immediate">
              <div className="timeline-dot"></div>
              <div className="timeline-content left glass-card">
                <span className="timeline-date">February 28, 2026</span>
                <h3>Our First Outing</h3>
                <p>We went on our first outing to seek blessings at the Kuladeivam temple in Ulusampatti. Afterwards, we enjoyed watching the movie "With Love" together and spent a beautiful afternoon bonding over lunch.</p>
              </div>
            </div>

            <div className="timeline-item reveal-immediate">
              <div className="timeline-dot"></div>
              <div className="timeline-content right glass-card">
                <span className="timeline-date">March 5, 2026</span>
                <h3>A Birthday Surprise</h3>
                <p>For my birthday, she took the special effort to travel all the way to Chennai just to meet me in person. It was a beautiful and deeply touching surprise that made my day truly unforgettable.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {!showFullStory && (
        <div className="story-action">
          <button className="expand-story-btn" onClick={() => { setShowFullStory(true); sendEvent('expand_story', { event_category: 'story', event_label: 'Unfold Next Chapter' }); }}>
            Unfold Our Next Chapter
          </button>
        </div>
      )}

      {lightboxOpen && (
        <div className="lightbox-overlay active story-lightbox" onClick={closeLightbox}>
          <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close full size image">
            <X size={32} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={STORY_HERO.src} alt="" />
            <p className="lightbox-caption">{STORY_HERO.title}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Story;
