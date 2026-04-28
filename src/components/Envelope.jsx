import React, { useState, useEffect } from 'react';
import './Envelope.css';

const Envelope = ({ onOpenComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Check if we already showed it this session
  useEffect(() => {
    const hasSeenEnvelope = sessionStorage.getItem('hasSeenEnvelope');
    if (hasSeenEnvelope) {
      setIsHidden(true);
      onOpenComplete();
    }
  }, [onOpenComplete]);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Mark as seen so refresh doesn't show it again immediately
    sessionStorage.setItem('hasSeenEnvelope', 'true');

    // 1. Seal bursts + Top Flap opens
    // 2. Letter slides up
    // 3. Whole container scales in and fades out
    setTimeout(() => {
      setIsHidden(true);
      setTimeout(() => {
        onOpenComplete();
      }, 1000); // Wait for fade out
    }, 5000); // 1.9s for animation + 3.1s for reading
  };

  if (isHidden) return null;

  return (
    <div className={`envelope-screen ${isOpen ? 'fade-out' : ''}`}>
      <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`}>

        <div className="envelope">
          {/* Back wall of the pocket */}
          <div className="envelope-back"></div>

          {/* The letter inside */}
          <div className="envelope-letter">
            <div className="letter-header">
              <h2 className="gold-text">V & N</h2>
              <p>Special Invitation</p>
            </div>
            <div className="letter-body">
              <p>We invite you to share our joy!</p>
            </div>
            <div className="decorations">
              <div className="floral left"></div>
              <div className="floral right"></div>
            </div>
          </div>

          {/* The front pockets that cover the letter */}
          <div className="envelope-front left-flap"></div>
          <div className="envelope-front right-flap"></div>
          <div className="envelope-front bottom-flap"></div>

          {/* The top flap that opens on X axis */}
          <div className="envelope-top-flap">
            <div className="envelope-top-flap-inner"></div>
          </div>

          <button
            type="button"
            className={`wax-seal ${isOpen ? 'broken' : ''}`}
            onClick={handleOpen}
            aria-label="Open Invitation"
          >
            <span>V&N</span>
          </button>
        </div>

        {!isOpen && (
          <p className="envelope-hint">Tap the seal to open</p>
        )}
      </div>
    </div>
  );
};

export default Envelope;
