import React from 'react';
import { Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-hearts">
          <Heart size={16} className="heart-mini pulsing" />
          <Heart size={24} className="heart-main pulsing" />
          <Heart size={16} className="heart-mini pulsing" />
        </div>
        <p className="footer-copyright">
          © 2026 • Made with <Heart size={12} className="inline-heart" /> for a beautiful beginning
        </p>
      </div>
    </footer>
  );
};

export default Footer;
