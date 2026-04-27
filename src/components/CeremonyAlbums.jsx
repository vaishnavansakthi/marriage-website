import React from 'react';
import { BookOpen, ExternalLink, Download } from 'lucide-react';
import weddingAlbumImg from '../assets/family.jpeg';
import preWeddingAlbumImg from '../assets/couple.jpeg';
import weddingPdf from '../assets/divya vaishnavan10-4.pdf';
import preWeddingPdf from '../assets/Divya.pdf';
import './CeremonyAlbums.css';

const albums = [
  {
    title: "Flowering Ceremony",
    description: "Family album of flowering ceremony",
    image: weddingAlbumImg,
    pdf: weddingPdf,
    type: "Ceremony"
  },
  {
    title: "Flowering Ceremony",
    description: "Our love album of flowering ceremony",
    image: preWeddingAlbumImg,
    pdf: preWeddingPdf,
    type: "Candid"
  }
];

const CeremonyAlbums = () => {
  return (
    <section className="section albums-section" id="albums">
      <div className="section-header reveal">
        <h2 className="gold-text">Ceremony Albums</h2>
        <div className="divider"></div>
        <p className="subtitle">Flick through our digital albums to relive our precious moments.</p>
      </div>

      <div className="albums-container">
        {albums.map((album, index) => (
          <div key={index} className="album-card glass-card reveal">
            <div className="album-cover">
              <img src={album.image} alt={album.title} />
              <div className="album-badge">{album.type}</div>
              <div className="album-overlay">
                <BookOpen size={48} color="var(--gold-accent)" />
              </div>
            </div>
            <div className="album-info">
              <h3>{album.title}</h3>
              <p>{album.description}</p>
              <div className="album-actions">
                <a
                  href={album.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <ExternalLink size={18} />
                  <span>View Online</span>
                </a>
                <a
                  href={album.pdf}
                  download
                  className="btn-premium-ghost"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <Download size={18} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CeremonyAlbums;
