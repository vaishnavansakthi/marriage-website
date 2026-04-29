import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendEvent } from '../utils/analytics';
import './ScrollProgress.css';

/* ─── Milestone configuration ─── */
const MILESTONES = [
  {
    pct: 25,
    icon: '💍',
    title: 'Journey Unlocked!',
    subtitle: 'You explored our love story',
  },
  {
    pct: 50,
    icon: '🎉',
    title: 'Halfway There!',
    subtitle: 'Keep scrolling — surprises await',
  },
  {
    pct: 75,
    icon: '✨',
    title: 'Almost There!',
    subtitle: 'A special reward is near…',
  },
  {
    pct: 100,
    icon: '🎊',
    title: 'You Made It!',
    subtitle: 'Tap to unlock a secret photo',
    hasReward: true,
  },
];

/* ─── Lightweight confetti engine (no dependencies) ─── */
function launchConfetti(canvasEl, durationMs = 3000) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const W = (canvasEl.width = window.innerWidth);
  const H = (canvasEl.height = window.innerHeight);

  const COLORS = [
    '#D4AF37', '#F3E5AB', '#FFD700', '#B8860B',
    '#ff1744', '#ff6d00', '#e040fb', '#FFFFFF',
  ];

  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 50 : 120;

  const pieces = Array.from({ length: particleCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * -1,
    w: 4 + Math.random() * 6,
    h: 8 + Math.random() * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 8,
    opacity: 1,
  }));

  const start = performance.now();
  let rafId;

  function draw(ts) {
    const elapsed = ts - start;
    const fade = elapsed > durationMs * 0.6
      ? 1 - (elapsed - durationMs * 0.6) / (durationMs * 0.4)
      : 1;

    ctx.clearRect(0, 0, W, H);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.vy += 0.05; // gravity
      p.opacity = Math.max(0, fade);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (elapsed < durationMs) {
      rafId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  rafId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, W, H);
  };
}

/* ─── ScrollProgress component ─── */
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [reached, setReached] = useState(() => {
    // Restore already-seen milestones from session
    try {
      const saved = sessionStorage.getItem('scroll-milestones');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeToast, setActiveToast] = useState(null);
  const [showSecretPhoto, setShowSecretPhoto] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);

  /* ─── Lock body scroll when modal is open ─── */
  useEffect(() => {
    if (showSecretPhoto) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSecretPhoto]);

  const canvasRef = useRef(null);
  const toastTimerRef = useRef(null);
  const badgeTimerRef = useRef(null);
  const lastScrollRef = useRef(0);

  /* ─── Scroll listener ─── */
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    setProgress(pct);

    // Show badge briefly while scrolling
    setBadgeVisible(true);
    clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => setBadgeVisible(false), 1500);
    lastScrollRef.current = scrollTop;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(badgeTimerRef.current);
    };
  }, [handleScroll]);

  /* ─── Milestone detection ─── */
  useEffect(() => {
    for (const ms of MILESTONES) {
      if (progress >= ms.pct && !reached[ms.pct]) {
        // Mark as reached
        setReached((prev) => {
          const next = { ...prev, [ms.pct]: true };
          try {
            sessionStorage.setItem('scroll-milestones', JSON.stringify(next));
          } catch { /* noop */ }
          return next;
        });

        // Fire confetti
        launchConfetti(canvasRef.current, ms.pct === 100 ? 4500 : 2500);

        // Show toast
        clearTimeout(toastTimerRef.current);
        setActiveToast(ms);
        toastTimerRef.current = setTimeout(() => setActiveToast(null), 5000);

        // Analytics
        sendEvent('scroll_milestone', {
          event_category: 'engagement',
          event_label: `${ms.pct}% reached`,
          value: ms.pct,
        });

        break; // only trigger one at a time
      }
    }
  }, [progress, reached]);

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  /* ─── Toast action handler ─── */
  const handleToastAction = () => {
    if (activeToast?.hasReward) {
      setShowSecretPhoto(true);
      setActiveToast(null);
      sendEvent('secret_photo_unlocked', {
        event_category: 'engagement',
        event_label: '100% Scroll Reward',
      });
    } else {
      setActiveToast(null);
    }
  };

  return (
    <>
      {/* Progress Bar */}
      <div className="scroll-progress-track">
        <div
          className="scroll-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Milestone Dots */}
      <div className="scroll-milestone-markers">
        {MILESTONES.map((ms) => (
          <div
            key={ms.pct}
            className="milestone-dot"
            data-reached={reached[ms.pct] ? 'true' : 'false'}
            style={{ left: `${ms.pct}%` }}
          />
        ))}
      </div>

      {/* Percentage Badge */}
      <div className={`scroll-progress-badge ${badgeVisible ? 'visible' : ''}`}>
        {Math.round(progress)}%
      </div>

      {/* Toast Notification */}
      <div className={`milestone-toast ${activeToast ? 'toast-visible' : ''}`}>
        {activeToast && (
          <>
            <span className="milestone-toast-icon">{activeToast.icon}</span>
            <div className="milestone-toast-content">
              <span className="milestone-toast-title">{activeToast.title}</span>
              <span className="milestone-toast-subtitle">{activeToast.subtitle}</span>
            </div>
            <button className="milestone-toast-action" onClick={handleToastAction}>
              {activeToast.hasReward ? 'Unlock' : 'Nice!'}
            </button>
          </>
        )}
      </div>

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      {/* Secret Photo Modal (100% reward) */}
      <div
        className={`secret-photo-overlay ${showSecretPhoto ? 'modal-open' : ''}`}
        onClick={() => setShowSecretPhoto(false)}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="secret-photo-card" onClick={(e) => e.stopPropagation()}>
          <div className="secret-photo-badge">
            <span className="secret-photo-badge-icon">🏆</span>
            <span>Secret Unlocked</span>
          </div>

          <img
            src="/couple.jpeg"
            alt="Secret couple photo"
            className="secret-photo-image"
          />

          <h3 className="secret-photo-title gold-text">Thank You for Being Here!</h3>
          <p className="secret-photo-message">
            You scrolled through our entire love story — that means the world to us.
            This photo is a special memory we wanted to share only with those who care enough
            to explore every part of our journey. We love you! 💕
          </p>

          <button
            className="secret-photo-close"
            onClick={() => setShowSecretPhoto(false)}
          >
            Close & Continue ✨
          </button>
        </div>
      </div>
    </>
  );
};

export default ScrollProgress;
