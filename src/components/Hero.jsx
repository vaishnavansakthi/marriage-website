import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Wedding Date: June 7, 2026 at 8:00 AM
  const weddingDate = new Date('June 7, 2026 08:00:00').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  const scrollToStory = () => {
    const storySection = document.getElementById('story');
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="section hero-section" id="home">
      <div className="hero-content reveal active">
        <p className="intro-text">TOGETHER WITH THEIR FAMILIES</p>
        <h1 className="couple-names gold-text">
          Vaishnavan <span className="weds-main">weds</span> Nagadivya
        </h1>

        <div className="kavithai-wrapper">
          <p className="kavithai-text">
            "Nodi nodi aai sithari pona en manadhai serka vaika vandha penn nee dhaan endru tharindha pinbu en manam siragadiken ndradheyyy"
          </p>
          <p className="kavithai-author">- Vaishnavan</p>
        </div>

        <div className="date-location">
          <p className="date">June 7, 2026</p>
          <p className="location">Bodinayakanur, Theni</p>
        </div>

        <div className="countdown">
          <div className="time-block">
            <span className="time">{timeLeft.days}</span>
            <span className="label">Days</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-block">
            <span className="time">{timeLeft.hours}</span>
            <span className="label">Hours</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-block">
            <span className="time">{timeLeft.minutes}</span>
            <span className="label">Minutes</span>
          </div>
          <div className="time-separator">:</div>
          <div className="time-block">
            <span className="time">{timeLeft.seconds}</span>
            <span className="label">Seconds</span>
          </div>
        </div>

        <button onClick={scrollToStory} className="scroll-hint" aria-label="Scroll down">
          <ChevronDown size={32} color="var(--gold-accent)" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
