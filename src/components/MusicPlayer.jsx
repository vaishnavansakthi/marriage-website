import React, { useState, useRef, useEffect } from 'react';
import { Music, Music2, Volume2, VolumeX } from 'lucide-react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Using a soft, romantic royalty-free instrumental track
  const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Attempt to play on first user interaction (required by browsers)
    const handleFirstInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log("Autoplay blocked:", err));
        
        // Remove listeners after first successful play attempt
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('scroll', handleFirstInteraction);
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [isPlaying]);

  return (
    <div className={`music-player-container ${isPlaying ? 'playing' : ''}`}>
      <audio ref={audioRef} src={audioUrl} loop />
      
      <button 
        className="music-toggle-btn glass-card" 
        onClick={togglePlay}
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        <div className="music-bars">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        
        <div className="icon-wrapper">
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </div>
        
        <span className="music-text">{isPlaying ? "Music On" : "Music Off"}</span>
      </button>
    </div>
  );
};

export default MusicPlayer;
