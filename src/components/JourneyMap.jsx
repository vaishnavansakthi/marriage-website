import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import './JourneyMap.css';

const JourneyMap = () => {
  return (
    <section className="section journey-map-section" id="journey-map">
      <div className="section-header reveal">
        <h2 className="gold-text">Trace Our Journey</h2>
        <div className="divider"></div>
        <p className="subtitle">From the capital city to the temple town, our love found its way</p>
      </div>

      <div className="map-container reveal">
        <svg viewBox="0 0 400 500" className="india-svg">
          {/* Stylized South India / Tamil Nadu Shape (Simulated) */}
          <path 
            className="tn-outline"
            d="M150,50 L250,50 L300,150 L320,300 L280,450 L180,480 L100,400 L80,250 L100,100 Z"
            fill="rgba(212, 175, 55, 0.05)"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="2"
          />

          {/* Animated Path Line */}
          <path
            className="journey-path"
            d="M300,120 Q250,250 220,350 Q180,380 140,380"
            fill="none"
            stroke="var(--gold-accent)"
            strokeWidth="3"
            strokeDasharray="500"
            strokeDashoffset="500"
          />

          {/* Flight route from Chennai to Bali with animated plane emoji */}
          <path
            id="flight-route"
            className="flight-route"
            d="M300,120 C305,200 320,300 330,420"
            fill="none"
            stroke="rgba(212,175,55,0.6)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          {/* Plane emoji moving along the flight-route */}
          <text className="plane-emoji">✈️
            <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path="M300,120 C305,200 320,300 330,420" />
          </text>

          {/* Location Pins */}
          
          {/* Chennai - Top Right */}
          <g className="map-pin chennai">
            <circle cx="300" cy="120" r="15" className="pin-pulse" />
            <circle cx="300" cy="120" r="5" fill="var(--gold-accent)" />
            <foreignObject x="315" y="105" width="120" height="50">
              <div className="pin-label">
                <strong>Chennai</strong>
                <span>The Surprise</span>
              </div>
            </foreignObject>
          </g>

          {/* Madurai - Center Bottom */}
          <g className="map-pin madurai">
            <circle cx="220" cy="350" r="15" className="pin-pulse" />
            <circle cx="220" cy="350" r="5" fill="#ff1744" />
            <foreignObject x="235" y="335" width="120" height="50">
              <div className="pin-label highlight">
                <strong>Madurai</strong>
                <span>The Engagement</span>
              </div>
            </foreignObject>
          </g>

          {/* Bodinayakanur - Bottom Left */}
          <g className="map-pin bodi">
            <circle cx="140" cy="380" r="15" className="pin-pulse" />
            <circle cx="140" cy="380" r="5" fill="var(--gold-accent)" />
            <foreignObject x="155" y="365" width="150" height="50">
              <div className="pin-label">
                <strong>Bodinayakanur</strong>
                <span>The Wedding</span>
              </div>
            </foreignObject>
          </g>

          {/* Bali - Honeymoon (represented off-map to the bottom-right) */}
          <g className="map-pin bali">
            {/* use a heart glyph so it matches the legend */}
            <text x="330" y="420" className="bali-heart" textAnchor="middle" dominantBaseline="central">❤</text>
            <foreignObject x="180" y="395" width="140" height="60">
              <div className="pin-label text-right">
                <strong>Bali</strong>
                <span>Trip</span>
              </div>
            </foreignObject>
          </g>
        </svg>

        <div className="journey-legend">
          <div className="legend-item">
            <div className="dot gold"></div>
            <span>Where it all began</span>
          </div>
          <div className="legend-item">
            <div className="dot red"></div>
            <span>Where we said Yes</span>
          </div>
          <div className="legend-item">
            <Heart size={16} className="legend-heart" />
            <span>Our Trip Destination (Bali)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyMap;
