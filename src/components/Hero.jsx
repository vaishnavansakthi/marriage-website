import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const KAVITHAI_QUOTE =
  '"Nodi nodi aai sithari pona en manadhai serka vaika vandha penn nee dhaan endru tharindha pinbu en manam siragadiken ndradheyyy"';

const Hero = () => {
  const [kavithaiShown, setKavithaiShown] = useState('');
  const [kavithaiComplete, setKavithaiComplete] = useState(false);
  const kavithaiTimersRef = useRef({ start: null, tick: null });
  const kavithaiCancelledRef = useRef(false);

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

  useEffect(() => {
    kavithaiCancelledRef.current = false;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setKavithaiShown(KAVITHAI_QUOTE);
      setKavithaiComplete(true);
      return undefined;
    }

    const startDelayMs = 800;
    const msPerChar = 22;
    const quote = KAVITHAI_QUOTE;
    let index = 0;

    const clearTimers = () => {
      if (kavithaiTimersRef.current.start != null) {
        window.clearTimeout(kavithaiTimersRef.current.start);
        kavithaiTimersRef.current.start = null;
      }
      if (kavithaiTimersRef.current.tick != null) {
        window.clearTimeout(kavithaiTimersRef.current.tick);
        kavithaiTimersRef.current.tick = null;
      }
    };

    const runTick = () => {
      if (kavithaiCancelledRef.current) return;
      index += 1;
      if (index >= quote.length) {
        setKavithaiShown(quote);
        setKavithaiComplete(true);
        kavithaiTimersRef.current.tick = null;
        return;
      }
      setKavithaiShown(quote.slice(0, index));
      kavithaiTimersRef.current.tick = window.setTimeout(runTick, msPerChar);
    };

    kavithaiTimersRef.current.start = window.setTimeout(() => {
      kavithaiTimersRef.current.start = null;
      if (kavithaiCancelledRef.current) return;
      runTick();
    }, startDelayMs);

    return () => {
      kavithaiCancelledRef.current = true;
      clearTimers();
    };
  }, []);

  const scrollToStory = () => {
    const storySection = document.getElementById('story');
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const printInvite = () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Vaishnavan & Nagadivya - Invitation</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" />
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #fff; color:#1a0510; margin:0; padding:32px; }
            .invite { max-width:900px; margin:0 auto; text-align:center; }
            .hero-img { width:100%; height:auto; max-height:500px; object-fit:contain; border-radius:12px }
            .names-print { font-family: 'Cinzel', serif; margin:20px 0 12px; color:#2a0815; }
            .np-role { font-size:11px; letter-spacing:0.35em; text-transform:uppercase; color:#888; font-family:Inter,sans-serif; margin-bottom:6px; }
            .np-line { font-size:36px; margin:12px 0; line-height:1.15; }
            .np-weds { font-family:'Great Vibes',cursive; font-size:32px; color:#e91e63; margin:4px 0 10px; text-transform:lowercase; position:relative; top:-6px; text-align:center; }
            .sub { font-size:18px; color:#6b6b6b; margin-bottom:18px; }
            .date { font-size:20px; font-weight:600; margin-bottom:6px; }
            .location { font-size:16px; color:#444; margin-bottom:24px; }
            .poem { font-style:italic; color:#333; margin:18px 0 28px; line-height:1.6 }
            .footer { font-size:13px; color:#666; margin-top:36px }
            @media print { body{padding:12mm;} .hero-img{max-height:450px;} }
          </style>
        </head>
        <body>
          <div class="invite">
            <img src="/pole.jpeg" alt="Vaishnavan and Nagadivya" class="hero-img" />
            <div class="names-print">
              <div class="np-line"><div class="np-role">Groom</div>Vaishnavan</div>
              <div class="np-weds" aria-hidden="true">weds</div>
              <div class="np-line"><div class="np-role">Bride</div>Nagadivya</div>
            </div>
            <div class="sub">Together with their families</div>

            <div class="date">June 7, 2026</div>
            <div class="location">Bodinayakanur, Theni</div>

            <div class="poem">With joyful hearts and laughter shared, we invite you to witness the moment our two stories become one. Come bless our union with your presence, your blessings, and your wishes as we begin this new chapter together.</div>

            <div class="footer">Kindly RSVP at the website to let us know you'll celebrate with us. For questions or travel assistance, contact the hosts listed on the site.</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Unable to open print window. Please allow popups and try again.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  };

  return (
    <section className="section hero-section" id="home">
      <div className="hero-content reveal active">
        <p className="intro-text">TOGETHER WITH THEIR FAMILIES</p>
        <h1 className="couple-names couple-names--animated">
          <span className="name-line name-line--groom">
            <span className="name-role">Groom</span>
            <span className="name-person gold-text">Vaishnavan</span>
          </span>
          <span className="couple-names-weds-wrap" aria-hidden="true">
            <span className="couple-names-weds">weds</span>
          </span>
          <span className="name-line name-line--bride">
            <span className="name-role">Bride</span>
            <span className="name-person gold-text">Nagadivya</span>
          </span>
        </h1>

        <div className="kavithai-wrapper">
          <span className="kavithai-sr-only">
            {KAVITHAI_QUOTE} — Vaishnavan
          </span>
          <p className="kavithai-text" aria-hidden="true">
            <span className="kavithai-typewriter">{kavithaiShown}</span>
            {!kavithaiComplete && (
              <span className="kavithai-cursor" aria-hidden="true">
                |
              </span>
            )}
          </p>
          {kavithaiComplete && (
            <p className="kavithai-author">- Vaishnavan</p>
          )}
        </div>

        <div className="date-location">
          <p className="date">June 7, 2026</p>
          <p className="location">Bodinayakanur, Theni</p>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn-premium" onClick={printInvite} aria-label="Print invitation">Download Invitation ✨</button>
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
