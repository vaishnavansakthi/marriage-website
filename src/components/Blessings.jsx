import React, { useState, useEffect } from 'react';
import { Heart, Send, User } from 'lucide-react';
import './Blessings.css';

// Replace this with your actual Google Apps Script URL after setup
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz21SISuOeGFuRsWw-eqC0jFBZzS43FVyJn_Ox2I8nQRnhPW6bstuRSrlMj3rzsdfHp/exec';

const Blessings = () => {
  const [blessings, setBlessings] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wedding-blessings');
    if (saved) {
      setBlessings(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || sending) return;

    setSending(true);

    const newBlessing = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    // Save to Google Sheets
    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL') {
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
      } catch (err) {
        console.log('Sheet save attempted');
      }
    }

    // Also save locally for display
    const updated = [newBlessing, ...blessings];
    setBlessings(updated);
    localStorage.setItem('wedding-blessings', JSON.stringify(updated));
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
      </div>
    </section>
  );
};

export default Blessings;
