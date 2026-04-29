import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video, MessageCircle, Send, Share2, Eye, Wifi,
  WifiOff, Clock, Calendar, Radio, Heart, Check,
  Bell, Monitor, Smartphone
} from 'lucide-react';
import { sendEvent } from '../utils/analytics';
import './LiveStream.css';

// ── Configuration ──
// 🧪 TEST MODE: Set to 'live', 'ended', or false to disable
// Remove or set to false before going to production!
const TEST_MODE = 'live'; // 'live' | 'ended' | 'upcoming' | false

// Replace with your actual YouTube Live stream ID when available
const YOUTUBE_STREAM_ID = '';
const WEDDING_DATE = new Date('June 7, 2026 08:00:00').getTime();
const WEDDING_END = new Date('June 7, 2026 09:30:00').getTime();

const QUICK_REACTIONS = ['❤️', '🎉', '💍', '🥂', '✨', '🙏', '🌸', '💐'];

// Google Apps Script endpoint (shared with Blessings/SongRequests)
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxqMTfBAqY_G1V6bzmIgNzoIcUIv3cm4tF0BGsNb41pKYzOJTAPdmoW-mqpxziDIzXb/exec';

const getStreamStatus = () => {
  if (TEST_MODE) return TEST_MODE; // 🧪 Remove for production
  const now = Date.now();
  if (now < WEDDING_DATE) return 'upcoming';
  if (now >= WEDDING_DATE && now <= WEDDING_END) return 'live';
  return 'ended';
};

const LiveStream = () => {
  const [status, setStatus] = useState(getStreamStatus);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatName, setChatName] = useState(() => localStorage.getItem('ls_chat_name') || '');
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem('ls_chat_name'));
  const [sending, setSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const chatEndRef = useRef(null);
  const reactionIdRef = useRef(0);

  // ── Countdown Timer ──
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const distance = WEDDING_DATE - now;
      const currentStatus = getStreamStatus();
      setStatus(currentStatus);

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch chat messages ──
  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const liveMessages = data
        .filter((row) => {
          const msg = row.Message || row.message || '';
          return msg.toString().startsWith('📺 LIVE CHAT:');
        })
        .map((row) => {
          const fullMsg = (row.Message || row.message || '').toString();
          return {
            id: `${row.Name || row.name}-${fullMsg}-${row.Date || row.date}`.replace(/\s+/g, ''),
            name: row.Name || row.name || 'Guest',
            text: fullMsg.replace('📺 LIVE CHAT: ', ''),
            date: row.Date || row.date || '',
          };
        })
        .slice(-50); // Keep last 50 messages

      setChatMessages((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(liveMessages)) return prev;
        return liveMessages;
      });
    } catch {
      // Fail silently
    }
  }, []);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 8000);
    return () => clearInterval(interval);
  }, [fetchChat]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Set chat name ──
  const handleSetName = (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    localStorage.setItem('ls_chat_name', trimmed);
    setChatName(trimmed);
    setNameSet(true);
    setChatInput('');
    sendEvent('livestream_name_set', { event_category: 'livestream', event_label: trimmed });
  };

  // ── Send chat message ──
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || sending) return;

    setSending(true);

    const payload = {
      name: chatName,
      message: `📺 LIVE CHAT: ${text}`,
      date: new Date().toISOString(),
    };

    try {
      const formData = new URLSearchParams();
      formData.append('name', payload.name);
      formData.append('message', payload.message);
      formData.append('date', payload.date);

      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formData });

      // Optimistic update
      setChatMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, name: chatName, text, date: payload.date },
      ]);
    } catch {
      // Fail silently
    }

    setChatInput('');
    setSending(false);
    sendEvent('livestream_chat_sent', { event_category: 'livestream', event_label: text.slice(0, 40) });
  };

  // ── Reaction ──
  const handleReaction = (emoji) => {
    reactionIdRef.current += 1;
    const id = reactionIdRef.current;
    const left = 20 + Math.random() * 60;

    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);

    sendEvent('livestream_reaction', { event_category: 'livestream', event_label: emoji });
  };

  // ── Share ──
  const handleShare = async () => {
    const url = window.location.href.split('#')[0] + '#livestream';
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Watch Vaishnavan & Nagadivya\'s Wedding Live',
          text: 'Join us live for the wedding ceremony! 💍',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch {
      // User cancelled share
    }
    sendEvent('livestream_share', { event_category: 'livestream', event_label: 'share_link' });
  };

  // ── Get initials ──
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const statusLabel =
    status === 'live' ? 'Live Now' : status === 'upcoming' ? 'Stream Starts Soon' : 'Stream Ended';

  return (
    <section className="section livestream-section" id="livestream">
      {/* Signal Waves Decoration */}
      <div className="signal-waves" aria-hidden="true">
        <div className="signal-wave" />
        <div className="signal-wave" />
        <div className="signal-wave" />
      </div>

      <div className="section-header reveal">
        <h2 className="gold-text">Wedding Day Live</h2>
        <div className="divider" />
        <p className="subtitle">
          Can't make it in person? Watch our sacred ceremony live from anywhere in the world.
        </p>
      </div>

      <div className="livestream-container">
        {/* Status Banner */}
        <div className={`livestream-status-banner status-${status}`}>
          {status === 'live' ? (
            <span className="live-dot" />
          ) : (
            <span className={`status-dot ${status}`} />
          )}
          <span>{statusLabel}</span>
        </div>

        {/* Main Grid: Player + Chat */}
        <div className="livestream-main reveal">
          {/* ── Video Player ── */}
          <div className={`livestream-player-card ${status === 'live' ? 'is-live' : ''}`}>
            <div className="video-wrapper">
              {status === 'live' && YOUTUBE_STREAM_ID ? (
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_STREAM_ID}?autoplay=1&mute=1&rel=0`}
                  title="Wedding Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : status === 'ended' && YOUTUBE_STREAM_ID ? (
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_STREAM_ID}?rel=0`}
                  title="Wedding Ceremony Replay"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="video-placeholder">
                  <div className="video-placeholder-icon">
                    <div className="ring" />
                    <div className="ring" />
                    <div className="ring" />
                    {status === 'upcoming' ? (
                      <Video size={32} color="var(--gold-accent)" />
                    ) : status === 'live' ? (
                      <Radio size={32} color="#ff1744" />
                    ) : (
                      <Video size={32} color="var(--text-muted)" />
                    )}
                  </div>
                  <h3>
                    {status === 'upcoming'
                      ? 'Stream starting soon...'
                      : status === 'live'
                        ? 'Setting up the stream...'
                        : 'Ceremony has concluded'}
                  </h3>
                  <p>
                    {status === 'upcoming'
                      ? 'The live stream will begin on June 7, 2026 at 8:00 AM IST. Stay tuned!'
                      : status === 'live'
                        ? 'The stream link will appear here shortly.'
                        : 'Thank you for watching! The recording will be available soon.'}
                  </p>
                </div>
              )}
            </div>

            {/* Player Info Bar */}
            <div className="player-info-bar">
              <div className="player-info-left">
                {status === 'live' ? (
                  <div className="viewer-count">
                    <Eye size={14} className="eye-icon" />
                    <span>Watching live</span>
                  </div>
                ) : (
                  <div className="viewer-count">
                    {status === 'upcoming' ? (
                      <Wifi size={14} className="eye-icon" />
                    ) : (
                      <WifiOff size={14} className="eye-icon" />
                    )}
                    <span>
                      {status === 'upcoming'
                        ? 'June 7, 2026 · 8:00 AM IST'
                        : 'Stream ended'}
                    </span>
                  </div>
                )}
              </div>
              <div className="player-info-right">
                <button
                  className={`share-btn ${linkCopied ? 'copied' : ''}`}
                  onClick={handleShare}
                >
                  {linkCopied ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{linkCopied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Countdown (only when upcoming) */}
            {status === 'upcoming' && (
              <div className="livestream-countdown">
                <div className="ls-time-block">
                  <span className="ls-time-value">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="ls-time-label">Days</span>
                </div>
                <div className="ls-time-block">
                  <span className="ls-time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="ls-time-label">Hours</span>
                </div>
                <div className="ls-time-block">
                  <span className="ls-time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="ls-time-label">Minutes</span>
                </div>
                <div className="ls-time-block">
                  <span className="ls-time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="ls-time-label">Seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Chat Panel ── */}
          <div className="livestream-chat-card">
            <div className="chat-header">
              <h4>
                <MessageCircle size={16} />
                Live Chat
              </h4>
              <span className="chat-msg-count">{chatMessages.length} messages</span>
            </div>

            {/* Messages Area */}
            {chatMessages.length > 0 ? (
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="chat-message">
                    <div className="chat-avatar">{getInitials(msg.name)}</div>
                    <div className="chat-bubble">
                      <div className="chat-bubble-name">{msg.name}</div>
                      <div className="chat-bubble-text">{msg.text}</div>
                      <div className="chat-bubble-time">{formatTime(msg.date)}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="chat-empty">
                <MessageCircle size={32} opacity={0.3} />
                <p>
                  No messages yet.
                  <br />
                  Be the first to send your love! 💛
                </p>
              </div>
            )}

            {/* Quick Reactions */}
            <div className="reactions-bar">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-btn"
                  onClick={() => handleReaction(emoji)}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            {!nameSet ? (
              <form className="chat-input-area" onSubmit={handleSetName}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Enter your name to chat..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  maxLength={30}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!chatInput.trim()}
                  aria-label="Set name"
                >
                  <Check size={18} />
                </button>
              </form>
            ) : (
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder={`Message as ${chatName}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  maxLength={200}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!chatInput.trim() || sending}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="livestream-info-grid reveal">
          <div className="ls-info-card">
            <div className="ls-info-icon">
              <Calendar size={20} />
            </div>
            <div className="ls-info-content">
              <h4>When to Tune In</h4>
              <p>June 7, 2026 at 8:00 AM IST. The stream will go live 5 minutes before the ceremony.</p>
            </div>
          </div>

          <div className="ls-info-card">
            <div className="ls-info-icon">
              <Monitor size={20} />
            </div>
            <div className="ls-info-content">
              <h4>How to Watch</h4>
              <p>Works on any device — phone, tablet, or laptop. No app needed, just open this page!</p>
            </div>
          </div>

          <div className="ls-info-card">
            <div className="ls-info-icon">
              <Bell size={20} />
            </div>
            <div className="ls-info-content">
              <h4>Get Notified</h4>
              <p>Share this page link so your friends and family don't miss the special moment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Reactions */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          className="floating-reaction"
          style={{ left: `${r.left}%`, bottom: '20%' }}
        >
          {r.emoji}
        </div>
      ))}
    </section>
  );
};

export default LiveStream;
