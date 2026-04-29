import React, { useState, useEffect } from 'react';
import { Heart, Send, User, MessageSquare, Search } from 'lucide-react';
import { formatRelativeTime } from '../utils/time';
import './Blessings.css';
import { sendEvent } from '../utils/analytics';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch blessings from Google Sheets
  const fetchBlessings = async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter and map with stable unique IDs (name + message)
          const validBlessings = data.filter(row => {
            const msg = (row.Message || row.message || '').toString();
            return msg && 
                   !msg.startsWith('🎵 SONG REQUEST:') && 
                   !msg.includes('PHOTO:') && 
                   !msg.includes('PIN:');
          })
          .map(row => {
            const name = row.Name || row.name || 'Guest';
            const msg = row.Message || row.message || '';
            const date = row.Date || row.date || '';
            return {
              // Creating a stable ID from the content to prevent re-renders
              id: `${name}-${msg}-${date}`.replace(/\s+/g, ''),
              name,
              message: msg,
              date
            };
          });

          // Only update if the number of items changed or the latest one is different
          const newBlessings = validBlessings.reverse();
          setBlessings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newBlessings)) return prev;
            return newBlessings;
          });
        }
      }
    } catch (err) {
      console.log('Failed to fetch blessings');
    } finally {
      setLoading(false);
    }
  };

  // Filter blessings based on search term
  const filteredBlessings = blessings.filter(blessing => 
    blessing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blessing.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchBlessings();
    // Reduced to 10 seconds to prevent Google Script 500 errors
    const interval = setInterval(fetchBlessings, 10000);
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
    sendEvent('blessing_submitted', { event_category: 'blessings', event_label: name.trim() });

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
          <button type="submit" className="btn-premium" disabled={sending} style={{ width: '100%' }}>
            <Send size={18} />
            <span>{sending ? 'Sending...' : 'Share Your Blessing'}</span>
          </button>

          {submitted && (
            <p className="thank-you-msg">Thank you for your beautiful blessing! 💕</p>
          )}
        </form>

        <div className="blessings-display reveal">
          <h3 className="gold-text">Blessings Wall</h3>
          
          {blessings.length > 0 && (
            <div className="search-box-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by name or message..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className="blessings-scroll">
            {loading && blessings.length === 0 ? (
              <div className="blessings-loading">Whispering prayers...</div>
            ) : filteredBlessings.length > 0 ? (
              <div className="blessings-grid">
                {filteredBlessings.map((blessing) => (
                  <div key={blessing.id} className="blessing-card glass-card">
                    <p className="blessing-message">"{blessing.message}"</p>
                    <div className="blessing-footer">
                      <span className="blessing-name">— {blessing.name}</span>
                      <span className="blessing-date">{formatRelativeTime(blessing.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : blessings.length > 0 ? (
              <div className="no-results">
                <Search size={24} opacity={0.5} />
                <p>No blessings found for "{searchTerm}"</p>
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
