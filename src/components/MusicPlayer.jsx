import React, { useState, useRef, useEffect } from 'react';
import { Music } from 'lucide-react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="music-player-container playing">
      <div
        className={`spotify-embed-wrapper glass-card reveal-up ${expanded ? 'expanded' : ''}`}
        aria-hidden={!expanded && window.innerWidth <= 420}
      >
        <iframe
          title="Spotify track player"
          className="spotify-iframe"
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/track/55OWBVrrcsWEqs56IG8YIw?utm_source=generator"
          width="100%"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>

      {/* Compact toggle button for very small screens */}
      <button
        className="music-toggle-button"
        onClick={() => setExpanded((s) => !s)}
        aria-label={expanded ? 'Close music player' : 'Open music player'}
      >
        <Music size={18} />
      </button>
    </div>
  );
};

export default MusicPlayer;
