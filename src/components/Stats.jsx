import React, { useState, useEffect, useRef } from 'react';
import './Stats.css';

const statsData = [
  { label: 'Days Together', value: 487 },
  { label: 'Late Night Calls', value: 125 },
  { label: 'Families Becoming One', value: 2 },
  { label: 'Big Day!', value: 1 }
];

const Counter = ({ target, duration, isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Use easeOut curve so counters gracefully slow down at the end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [target, duration, isVisible]);

  return <span className="stat-number gold-text">{count}</span>;
};

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Ensure it only animates once per pageload
        }
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section stats-section" id="stats" ref={sectionRef}>
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div 
            className={`stat-card glass-card reveal ${isVisible ? 'active' : ''}`} 
            key={index}
            style={{ transitionDelay: `${index * 0.15}s` }}
          >
            <Counter target={stat.value} duration={2500} isVisible={isVisible} />
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
