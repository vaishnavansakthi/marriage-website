import React, { useState, useRef, useEffect } from 'react';
import { Music, Music2, Volume2, VolumeX } from 'lucide-react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  return (
    <div className="music-player-container playing">
      <div className="spotify-embed-wrapper glass-card reveal-up">
        <iframe
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/track/4yur1GSBfuS1VADyUYocqd?utm_source=generator"
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default MusicPlayer;
