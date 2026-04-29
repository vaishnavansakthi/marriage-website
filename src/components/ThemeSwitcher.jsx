import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import './ThemeSwitcher.css';
import { sendEvent } from '../utils/analytics';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem('wedding-theme') || 'royal-gold');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('wedding-theme', theme);
  }, [theme]);

  const themes = [
    { id: 'royal-gold', name: 'Royal Gold', icon: <Sun size={18} /> },
    { id: 'midnight-rose', name: 'Midnight Rose', icon: <Moon size={18} /> },
  ];

  return (
    <div className={`theme-switcher-wrapper ${isOpen ? 'open' : ''}`}>
      <button 
        className="theme-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Theme"
      >
        <Palette size={24} />
      </button>

      <div className="theme-options">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-option ${theme === t.id ? 'active' : ''}`}
            onClick={() => {
              setTheme(t.id);
              setIsOpen(false);
              sendEvent('theme_switch', { event_category: 'theme', event_label: t.name });
            }}
          >
            <div className={`theme-preview ${t.id}`}></div>
            <span>{t.name}</span>
            {t.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
