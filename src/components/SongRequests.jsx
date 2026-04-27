import React, { useState, useEffect, useCallback } from 'react';
import { Music, Send, User, Disc, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils/time';
import './SongRequests.css';

// Using the same script URL as Blessings
// Updated to the new working script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqMTfBAqY_G1V6bzmIgNzoIcUIv3cm4tF0BGsNb41pKYzOJTAPdmoW-mqpxziDIzXb/exec';

const SongRequests = () => {
  const [name, setName] = useState('');
  const [song, setSong] = useState('');
  const [movie, setMovie] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setFetchError(null);
      // Simplified fetch to bypass preflight CORS issues
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      // Filter for song requests (message starting with 🎵 SONG REQUEST:)
      // Note: Handling both Title Case and lowercase field names from Google Sheet
      const songRequests = data.filter(row => {
        const msg = row.Message || row.message || '';
        return msg.toString().startsWith('🎵 SONG REQUEST:');
      })
      .map(row => {
        const fullMsg = (row.Message || row.message || '').toString();
        // Try to parse "SONG - MOVIE" format if it exists
        const content = fullMsg.replace('🎵 SONG REQUEST: ', '');
        const parts = content.split(' - ');
        return {
          name: row.Name || row.name || 'Guest',
          song: parts[0] || 'Unknown Song',
          movie: parts[1] || '',
          date: row.Date || row.date || 'Recently'
        };
      });
      setRequests(songRequests.reverse()); 
    } catch (err) {
      console.error('Fetch Error:', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // Poll every 10 seconds for new requests (user requested)
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !song.trim() || sending) return;

    setSending(true);

    const newRequest = {
      name: name.trim(),
      message: `🎵 SONG REQUEST: ${song.trim()}${movie.trim() ? ` - ${movie.trim()}` : ''}`, 
      date: new Date().toISOString()
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
      
      // Refresh local list immediately
      const localNewRequest = {
        name: newRequest.name,
        song: song.trim(),
        movie: movie.trim(),
        date: newRequest.date
      };
      setRequests(prev => [localNewRequest, ...prev]);
      
    } catch (err) {
      console.log('Sheet save attempted');
    }

    setName('');
    setSong('');
    setMovie('');
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
                placeholder="Song Name"
                value={song}
                onChange={(e) => setSong(e.target.value)}
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
                placeholder="Movie / Artist Name"
                value={movie}
                onChange={(e) => setMovie(e.target.value)}
                className="song-input"
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

        <div className="recent-requests-container reveal">
          <h3 className="gold-text">Recent Requests</h3>
          <div className="requests-list-wrapper">
            {loading ? (
              <div className="requests-loading">
                <RefreshCw className="spin" size={24} />
                <p>Loading playlist...</p>
              </div>
            ) : fetchError ? (
              <div className="requests-error">
                <p>Error loading requests: {fetchError}</p>
                <button onClick={fetchRequests} className="retry-btn">Retry</button>
              </div>
            ) : requests.length > 0 ? (
              <div className="requests-list">
                {requests.map((req, index) => (
                  <div key={index} className="request-item glass-card">
                    <div className="request-info">
                      <span className="req-song">{req.song}</span>
                      {req.movie && <span className="req-movie">{req.movie}</span>}
                      <span className="req-name">Requested by {req.name}</span>
                    </div>
                    <span className="req-date">{formatRelativeTime(req.date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-requests">No requests yet. Be the first to add one!</p>
            )}
          </div>
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
