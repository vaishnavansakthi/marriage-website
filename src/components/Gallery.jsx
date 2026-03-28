import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { url: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?auto=format&fit=crop&q=80&w=1200', title: 'The Engagement' },
    { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', title: 'Casual Moments' },
    { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200', title: 'A Beautiful Day' },
    { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', title: 'Celebrations' },
    { url: 'https://images.unsplash.com/photo-1510076857177-74436148895 \?auto=format&fit=crop&q=80&w=1200', title: 'Together' },
    { url: 'https://images.unsplash.com/photo-1465495910483-045744026500?auto=format&fit=crop&q=80&w=1200', title: 'Love & Joy' }
  ];

  const openLightbox = (index) => {
    setSelectedImg(images[index]);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImg(null);
    document.body.style.overflow = 'unset';
  };

  const nextImg = () => {
    const next = (currentIndex + 1) % images.length;
    setSelectedImg(images[next]);
    setCurrentIndex(next);
  };

  const prevImg = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setSelectedImg(images[prev]);
    setCurrentIndex(prev);
  };

  return (
    <section className="section gallery-section" id="gallery">
      <div className="section-header reveal">
        <h2 className="gold-text">Our Memories</h2>
        <div className="divider"></div>
        <p className="subtitle">Capturing the beautiful moments of our journey together</p>
      </div>

      <div className="gallery-grid container reveal">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="gallery-item glass-card"
            onClick={() => openLightbox(index)}
          >
            <img src={img.url} alt={img.title} loading="lazy" />
            <div className="gallery-overlay">
              <Maximize2 size={24} color="#fff" />
              <span>{img.title}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImg && (
        <div className="lightbox-overlay active" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={32} />
          </button>
          
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImg(); }}>
            <ChevronLeft size={48} />
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg.url} alt={selectedImg.title} />
            <p className="lightbox-caption">{selectedImg.title}</p>
          </div>
          
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImg(); }}>
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
