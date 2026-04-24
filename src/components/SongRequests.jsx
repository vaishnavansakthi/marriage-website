import React, { useState } from 'react';
import { Music, Send, User, Disc } from 'lucide-react';
import './SongRequests.css';

// Using the same script URL as Blessings
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz21SISuOeGFuRsWw-eqC0jFBZzS43FVyJn_Ox2I8nQRnhPW6bstuRSrlMj3rzsdfHp/exec';

const SongRequests = () => {
  const [name, setName] = useState('');
  const [song, setSong] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !song.trim() || sending) return;

    setSending(true);

    const newRequest = {
      name: name.trim(),
      message: `🎵 SONG REQUEST: ${song.trim()}`, // Prefixing to distinguish in Google Sheet if same script is used
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    try {
      const formData = new URLSearchParams();
      formData.append('name', newRequest.name);
      formData.append('message', newRequest.message);
      formData.append('date', newRequest.date);

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
    } catch (err) {
      console.log('Sheet save attempted');
    }

    setName('');
    setSong('');
    setSending(false);
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="section song-requests-section" id="playlist">
      <div className="section-header reveal">
        <h2 className="gold-text">Request a Song</h2>
        <div className="divider"></div>
        <p className="subtitle">Suggested a track you want to dance to at our reception!</p>
      </div>

      <div className="song-requests-container">
        <div className="song-request-card glass-card reveal">
          <div className="vinyl-animation">
            <Disc className="spinning-vinyl" size={60} color="var(--gold-accent)" />
            <div className="vinyl-center"></div>
          </div>
          
          <form className="song-request-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <User size={18} color="var(--gold-accent)" />
              </div>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="song-input"
                required
              />
            </div>
            <div className="form-group">
              <div className="input-icon">
                <Music size={18} color="var(--gold-accent)" />
              </div>
              <input
                type="text"
                placeholder="Song Name & Artist"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                className="song-input"
                required
              />
            </div>
            <button type="submit" className="song-submit-btn" disabled={sending}>
              <Send size={18} />
              <span>{sending ? 'Requesting...' : 'Add to Playlist'}</span>
            </button>

            {submitted && (
              <p className="success-msg">Got it! We'll try to play your song at the party! 💃✨</p>
            )}
          </form>
        </div>
      </div>

      {/* Floating Notes for atmosphere */}
      <div className="floating-notes">
        <Music className="note note-1" size={20} />
        <Music className="note note-2" size={24} />
        <Music className="note note-3" size={18} />
      </div>
    </section>
  );
};

export default SongRequests;
