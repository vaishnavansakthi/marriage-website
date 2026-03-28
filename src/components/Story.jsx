import React, { useState } from 'react';
import './Story.css';

const Story = () => {
  const [showFullStory, setShowFullStory] = useState(false);

  return (
    <section className="section story-section" id="story">
      <div className="section-header reveal">
        <h2 className="gold-text">Our Journey</h2>
        <div className="divider"></div>
        <p className="subtitle">Every love story is beautiful, but ours is our favorite.</p>
        
        <div className="story-hero-image">
          <img src="/couple-photo.jpg" alt="Vaishnavan and Nagadivya" />
        </div>
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
            <h3>The Engagement</h3>
            <p>We celebrated our official engagement in Madurai, joyously surrounded by all our family members. With their heartfelt blessings, our two families formally became one!</p>
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
          <button className="expand-story-btn" onClick={() => setShowFullStory(true)}>
            Unfold Our Next Chapter
          </button>
        </div>
      )}
    </section>
  );
};

export default Story;
