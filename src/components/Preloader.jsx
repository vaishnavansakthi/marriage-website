import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);

    const removeTimer = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`preloader ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="initials-container">
          <span className="initial v">V</span>
          <span className="ampersand">❤</span>
          <span className="initial n">N</span>
        </div>
        <div className="blooming-ring"></div>
      </div>
    </div>
  );
};

export default Preloader;
