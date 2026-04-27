import React, { useState, useEffect } from 'react';
import { Heart, Send, User } from 'lucide-react';
import { formatRelativeTime } from '../utils/time';
import './Blessings.css';

// Replace this with your actual Google Apps Script URL after setup
// Updated to the new working script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqMTfBAqY_G1V6bzmIgNzoIcUIv3cm4tF0BGsNb41pKYzOJTAPdmoW-mqpxziDIzXb/exec';

const Blessings = () => {
  const [blessings, setBlessings] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch blessings from Google Sheets
  const fetchBlessings = async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter for regular blessings (not song requests)
          const validBlessings = data.filter(row => {
            const msg = row.Message || row.message || '';
            return msg && !msg.toString().startsWith('🎵 SONG REQUEST:');
          })
          .map(row => ({
            id: row.id || Math.random(),
            name: row.Name || row.name || 'Guest',
            message: row.Message || row.message || '',
            date: row.Date || row.date || 'Recently'
          }));
          setBlessings(validBlessings.reverse());
        }
      }
    } catch (err) {
      console.log('Failed to fetch blessings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlessings();
    // Poll every 1 second for near-instant updates (user requested)
    const interval = setInterval(fetchBlessings, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;

    setSending(true);

    const newBlessing = {
      name: name.trim(),
      message: message.trim(),
      date: new Date().toISOString()
    };

    try {
      const formData = new URLSearchParams();
      formData.append('name', newBlessing.name);
      formData.append('message', newBlessing.message);
      formData.append('date', newBlessing.date);

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      
      // Update local list immediately
      setBlessings(prev => [newBlessing, ...prev]);
    } catch (err) {
      console.log('Sheet save attempted');
    }
    setName('');
    setMessage('');
    setSending(false);
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="section blessings-section" id="blessings">
      <div className="section-header reveal">
        <h2 className="gold-text">Drop a Blessing</h2>
        <div className="divider"></div>
        <p className="subtitle">Share your love and wishes for our new journey together</p>
      </div>

      <div className="blessings-container">
        <form className="blessing-form glass-card reveal" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <User size={18} color="var(--gold-accent)" />
            </div>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="blessing-input"
              required
            />
          </div>
          <div className="form-group">
            <div className="input-icon textarea-icon">
              <Heart size={18} color="var(--gold-accent)" />
            </div>
            <textarea
              placeholder="Write your heartfelt wishes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="blessing-input blessing-textarea"
              rows={4}
              required
            />
          </div>
          <button type="submit" className="blessing-submit-btn" disabled={sending}>
            <Send size={18} />
            <span>{sending ? 'Sending...' : 'Send Blessing'}</span>
          </button>

          {submitted && (
            <p className="thank-you-msg">Thank you for your beautiful blessing! 💕</p>
          )}
        </form>

        <div className="blessings-display reveal">
          <div className="blessings-scroll">
            {loading ? (
              <div className="blessings-loading">Loading blessings...</div>
            ) : blessings.length > 0 ? (
              <div className="blessings-grid">
                {blessings.map((blessing) => (
                  <div key={blessing.id} className="blessing-card glass-card">
                    <p className="blessing-message">"{blessing.message}"</p>
                    <div className="blessing-footer">
                      <span className="blessing-name">— {blessing.name}</span>
                      <span className="blessing-date">{formatRelativeTime(blessing.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-blessings">No blessings yet. Share the first one!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blessings;
