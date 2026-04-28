import React, { useState, useEffect } from 'react';
import { Menu, X, Home, BookOpen, Clock, Heart, Camera, BookmarkPlus } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'story', label: 'Our Story', icon: BookOpen },
    { id: 'events', label: 'Events', icon: Clock },
    { id: 'moments', label: 'Moments', icon: Camera },
    { id: 'albums', label: 'Albums', icon: BookOpen },
    { id: 'playlist', label: 'Playlist', icon: Heart },
    { id: 'blessings', label: 'Blessings', icon: BookmarkPlus }
  ];

  // Handle scroll effect and active section lighting
  useEffect(() => {
    const handleScroll = () => {
      // Toggle background opacity based on scroll
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Highlight active section reading from center of screen
      const sections = navLinks.map(link => document.getElementById(link.id)).filter(Boolean);
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className={`navbar \${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">

          {/* Logo/Names */}
          <div className="navbar-brand" onClick={() => scrollTo('home')}>
            <span className="brand-v">V</span>
            <span className="brand-amp">&</span>
            <span className="brand-n">N</span>
          </div>

          {/* Desktop Menu */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`nav-link \${activeSection === link.id ? 'active' : ''}`}
              >
                <link.icon size={16} className="nav-icon" />
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={28} color="var(--gold-accent)" /> : <Menu size={28} color="var(--gold-accent)" />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu Dropdown / Overlay */}
      <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-links">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`mobile-nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              <link.icon size={20} className="nav-icon" />
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
