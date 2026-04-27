import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Send, Loader2, Heart, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './GuestMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Heart Marker Icon
const heartIcon = new L.DivIcon({
  className: 'custom-heart-marker',
  html: `<div class="heart-marker-inner"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqMTfBAqY_G1V6bzmIgNzoIcUIv3cm4tF0BGsNb41pKYzOJTAPdmoW-mqpxziDIzXb/exec';

const GuestMap = () => {
  const [pins, setPins] = useState([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Auto-centering component
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    if (center) map.setView(center, zoom);
    return null;
  };

  const fetchPins = useCallback(async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const mapPins = data.filter(row => {
            const msg = (row.Message || row.message || '').toString();
            return msg.startsWith('📍 PIN:');
          }).map(row => {
            const fullMsg = (row.Message || row.message || '').toString();
            const name = row.Name || row.name || 'Guest';
            const date = row.Date || row.date || '';
            const [cityName, lat, lng] = fullMsg.replace('📍 PIN: ', '').split('|');
            
            return {
              id: `${name}-${date}`.replace(/\s+/g, ''),
              name,
              city: cityName,
              position: [parseFloat(lat), parseFloat(lng)]
            };
          }).filter(pin => !isNaN(pin.position[0]) && !isNaN(pin.position[1]));

          const latestFirst = mapPins.reverse();

          setPins(prev => {
            if (JSON.stringify(prev) === JSON.stringify(latestFirst)) return prev;
            return latestFirst;
          });
        }
      }
    } catch (err) {
      console.log('Failed to fetch pins');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
    const interval = setInterval(fetchPins, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchPins]);

  const handleAddPin = async (e) => {
    e.preventDefault();
    if (!name || !city) return;

    setLoading(true);
    setError('');

    try {
      // 1. Geocode the city using Nominatim
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
      const geoData = await geoResponse.json();

      if (geoData.length === 0) {
        throw new Error('Could not find this city. Please try a different name.');
      }

      const { lat, lon, display_name } = geoData[0];
      const shortCity = display_name.split(',')[0];

      // 2. Post to Google Sheets
      const formData = new URLSearchParams();
      formData.append('name', name);
      formData.append('message', `📍 PIN: ${shortCity}|${lat}|${lon}`);
      formData.append('date', new Date().toISOString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      setSubmitted(true);
      setName('');
      setCity('');
      fetchPins();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPins = pins.filter(pin => 
    pin.name.toLowerCase().includes(mapSearchTerm.toLowerCase()) ||
    pin.city.toLowerCase().includes(mapSearchTerm.toLowerCase())
  );

  const focusOnPin = (pin) => {
    setMapCenter(pin.position);
    setMapZoom(8);
  };

  return (
    <section className="guest-map-section" id="guest-map">
      <div className="section-header reveal">
        <h2 className="gold-text">Global Love</h2>
        <p className="subtitle">See where our loved ones are traveling from</p>
      </div>

      <div className="guest-map-container glass-card">
        <div className="map-wrapper">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={false}
            className="leaflet-container-dark"
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {pins.map((pin) => (
              <Marker key={pin.id} position={pin.position} icon={heartIcon}>
                <Popup className="custom-popup">
                  <div className="popup-content">
                    <strong>{pin.name}</strong>
                    <span>from {pin.city}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-controls">
          <div className="add-pin-form">
            <h3>Add Your Location</h3>
            <form onSubmit={handleAddPin}>
              <div className="map-input-group">
                <Search size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="map-input-group">
                <MapPin size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Your City (e.g., Chennai, London)" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button type="submit" className="map-submit-btn" disabled={loading}>
                {loading ? <Loader2 className="spin" size={20} /> : <Heart size={20} />}
                <span>Drop a Pin</span>
              </button>
              {error && <p className="map-error">{error}</p>}
              {submitted && <p className="map-success">Pinned with love! ❤️</p>}
            </form>
          </div>

          <div className="recent-pinnings">
            <div className="pinnings-header">
              <h4>Guest Pins</h4>
              <div className="pinnings-search">
                <Search size={14} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Find a guest..." 
                  value={mapSearchTerm}
                  onChange={(e) => setMapSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="pinnings-list scrollable-list">
              {fetching ? (
                <div className="map-loading">Tracking love...</div>
              ) : filteredPins.length > 0 ? (
                filteredPins.map(pin => (
                  <div key={pin.id} className="pin-item" onClick={() => focusOnPin(pin)}>
                    <Heart size={14} className="gold-text" />
                    <span><strong>{pin.name}</strong> from {pin.city}</span>
                  </div>
                ))
              ) : (
                <p className="no-pins">
                  {mapSearchTerm ? `No results for "${mapSearchTerm}"` : "No pins yet. Be the first!"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestMap;
