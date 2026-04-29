import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Send, Loader2, Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/time';
import './PhotoWall.css';
import { sendEvent } from '../utils/analytics';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqMTfBAqY_G1V6bzmIgNzoIcUIv3cm4tF0BGsNb41pKYzOJTAPdmoW-mqpxziDIzXb/exec';
const IMGBB_API_KEY = '8b460f61dacb7fab7793104b49a91d19'; // Placeholder - User should provide this or I'll ask again

const PhotoWall = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For Lightbox
  const [showAll, setShowAll] = useState(false); // For Full Gallery Modal

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const photoData = data.filter(row => {
            const msg = (row.Message || row.message || row.MESSAGE || '').toString();
            return msg.includes('PHOTO:');
          }).map(row => {
            const fullMsg = (row.Message || row.message || row.MESSAGE || '').toString();
            const name = row.Name || row.name || row.NAME || 'Guest';
            const date = row.Date || row.date || row.DATE || '';
            const content = fullMsg.split('PHOTO:')[1] || fullMsg;
            const cleanContent = content.trim();
            const [url, ...captionParts] = cleanContent.split('|');
            const captionText = captionParts.join('|');

            return {
              id: `photo-${name}-${date}-${url}`.replace(/[^a-z0-9]/gi, ''),
              name: name,
              url: url ? url.trim() : '',
              caption: captionText ? captionText.trim() : '',
              date: date
            };
          }).filter(item => item.url && item.url.startsWith('http')).reverse();

          setPhotos(prev => {
            if (JSON.stringify(prev) === JSON.stringify(photoData)) return prev;
            return photoData;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch photos', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !name) return;

    setUploading(true);

    try {
      // 1. Upload to ImgBB
      const formData = new FormData();
      formData.append('image', selectedFile);

      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const imgbbData = await imgbbResponse.json();

      if (!imgbbData.success) {
        throw new Error('Image upload failed. Please check the API key.');
      }

      const imageUrl = imgbbData.data.url;

      // 2. Post to Google Sheets
      const sheetData = new URLSearchParams();
      sheetData.append('name', name);
      sheetData.append('message', `📸 PHOTO: ${imageUrl}|${caption}`);
      sheetData.append('date', new Date().toISOString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: sheetData
      });

      setSubmitted(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      sendEvent('photo_upload', { event_category: 'photo_wall', event_label: name });
      fetchPhotos();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="photo-wall-section" id="moments">
      <div className="section-header reveal">
        <h2 className="gold-text">Social Moments</h2>
        <p className="subtitle">Share your favorite captures!</p>
      </div>

      <div className="photo-wall-container">
        {/* Upload Card */}
        <div className="upload-card glass-card reveal">
          <form onSubmit={handleUpload}>
            <div className={`file-drop-zone ${previewUrl ? 'has-preview' : ''}`}>
              {previewUrl ? (
                <div className="preview-container">
                  <img src={previewUrl} alt="Preview" />
                  <button type="button" className="remove-file" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}>
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="file-label">
                  <Camera size={40} className="gold-text" />
                  <span>Choose a Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                </label>
              )}
            </div>

            <div className="upload-fields">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <button type="submit" className="btn-premium" disabled={uploading || !selectedFile} style={{ width: '100%' }}>
                {uploading ? <Loader2 className="spin" size={20} /> : <ImageIcon size={20} />}
                <span>Share a Memory</span>
              </button>
              {submitted && <p className="success-msg">Moment shared! ✨</p>}
            </div>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="photo-grid">
          {loading && photos.length === 0 ? (
            <div className="grid-loading">Developing photos...</div>
          ) : photos.length > 0 ? (
            <>
              {photos.slice(0, 6).map((item) => (
                <div key={item.id} className="photo-item glass-card" onClick={() => { setSelectedPhoto(item); sendEvent('photo_lightbox_open', { event_category: 'photo_wall', event_label: item.caption || item.name }); }}>
                  <div className="image-wrapper">
                    <img src={item.url} alt={item.caption} loading="lazy" />
                    <div className="photo-overlay">
                      <Maximize2 size={24} />
                    </div>
                  </div>
                  <div className="photo-info">
                    <p className="photo-caption">{item.caption || "A beautiful moment..."}</p>
                    <div className="photo-meta">
                      <span className="photo-author">by {item.name}</span>
                      <span className="photo-time">{formatRelativeTime(item.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="no-photos">
              <ImageIcon size={48} opacity={0.3} />
              <p>No moments shared yet. Be the first to post!</p>
            </div>
          )}
        </div>

        {photos.length > 6 && (
          <div className="view-all-container">
            <button className="btn-premium-ghost" onClick={() => { setShowAll(true); sendEvent('photo_gallery_open', { event_category: 'photo_wall', event_label: `Explore All ${photos.length} Moments` }); }}>
              <ImageIcon size={20} />
              <span>Explore All {photos.length} Moments</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Gallery Modal */}
      {showAll && (
        <div className="full-gallery-modal" onClick={() => setShowAll(false)}>
          <div className="modal-header">
            <h2 className="gold-text">All Shared Moments</h2>
            <button className="close-modal" onClick={() => setShowAll(false)}>
              <X size={30} />
            </button>
          </div>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="full-photo-grid">
              {photos.map((item) => (
                <div key={item.id} className="photo-item glass-card" onClick={() => setSelectedPhoto(item)}>
                  <div className="image-wrapper">
                    <img src={item.url} alt={item.caption} loading="lazy" />
                    <div className="photo-overlay">
                      <Maximize2 size={24} />
                    </div>
                  </div>
                  <div className="photo-info">
                    <p className="photo-caption">{item.caption || "A beautiful moment..."}</p>
                    <div className="photo-meta">
                      <span className="photo-author">by {item.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
          <button className="close-lightbox"><X size={30} /></button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} />
            <div className="lightbox-info">
              <h3>{selectedPhoto.name}</h3>
              <p>{selectedPhoto.caption}</p>
              <span>{formatRelativeTime(selectedPhoto.date)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoWall;
