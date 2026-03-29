import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './JourneyMap.css';

const JourneyMap = () => {
  // Coordinates: [lat, lng]
  const locations = useMemo(() => [
    { name: 'Chennai', coords: [13.0827, 80.2707], desc: 'The Surprise', color: 'var(--gold-accent)' },
    { name: 'Madurai', coords: [9.9252, 78.1198], desc: 'The Engagement', color: '#ff1744' },
    { name: 'Bodinayakkanur', coords: [10.0033, 77.3670], desc: 'The Wedding', color: 'var(--gold-accent)' },
    { name: 'Bali', coords: [-8.65, 115.2167], desc: 'Trip', color: '#ff1744' },
  ], []);

  // main land route: only the India stops (exclude Bali so there's no land link to Bali)
  const route = locations.slice(0, 3).map(loc => loc.coords);
  const chennaiToBali = [locations[0].coords, locations[3].coords];

  const mapRef = useRef(null);
  const [planeActive, setPlaneActive] = useState(false);

  useEffect(() => {
    // when component mounts: zoom to Chennai then start plane animation
    const chennai = locations[0].coords;
    // wait for map to be ready
    if (mapRef.current && typeof mapRef.current.setView === 'function') {
      mapRef.current.setView(chennai, 8, { animate: true });
    }

    const t = setTimeout(() => setPlaneActive(true), 1400);
    return () => clearTimeout(t);
  }, [locations]);

  return (
    <section className="section journey-map-section" id="journey-map">
      <div className="section-header reveal">
        <h2 className="gold-text">Trace Our Journey</h2>
        <div className="divider"></div>
        <p className="subtitle">From the capital city to the temple town, our love found its way</p>
      </div>

      <div className="map-container reveal">
        <MapContainer
          center={[10.5, 79.5]}
          zoom={6}
          scrollWheelZoom={false}
          className="leaflet-map"
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={route} pathOptions={{ color: 'var(--gold-accent)', weight: 3 }} />

          {/* Direct flight route (Chennai -> Bali) */}
          <Polyline
            positions={chennaiToBali}
            pathOptions={{ color: 'rgba(212,175,55,0.8)', weight: 2, dashArray: '8 6' }}
            className="flight-path"
          />

          {locations.map((loc) => (
            <CircleMarker
              key={loc.name}
              center={loc.coords}
              radius={8}
              pathOptions={{ color: loc.color, fillColor: loc.color, fillOpacity: 0.9 }}
            >
              <Popup>
                <strong>{loc.name}</strong>
                <div>{loc.desc}</div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Animated car for Chennai -> Bodinayakanur (land travel) */}
          <AnimatedVehicle positions={route} duration={9000} />
          {/* Animated plane for Chennai -> Bali flight */}
          <AnimatedPlane positions={chennaiToBali} duration={14000} active={planeActive} onPosition={(latlng, progress) => {
            // follow the plane: zoom from 8 -> 5 as it travels
            if (!mapRef.current || typeof mapRef.current.setView !== 'function') return;
            const startZoom = 8;
            const endZoom = 5;
            const zoom = startZoom + (endZoom - startZoom) * progress;
            // use setView without animation for tight follow, avoid jitter
            mapRef.current.setView(latlng, zoom, { animate: false });
          }} />
        </MapContainer>

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

/* AnimatedPlane component: moves a DivIcon (plane emoji) along provided positions */
function AnimatedPlane({ positions, duration = 8000, active = true, onPosition = null }) {
  const markerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!positions || positions.length < 2) return;
    if (!active) return; // don't start animation until active

    // compute segment lengths (approx using haversine) and cumulative lengths
    function toRad(deg) { return deg * Math.PI / 180; }
    function haversine(a, b) {
      const R = 6371000; // meters
      const dLat = toRad(b[0] - a[0]);
      const dLon = toRad(b[1] - a[1]);
      const lat1 = toRad(a[0]);
      const lat2 = toRad(b[0]);
      const sinDLat = Math.sin(dLat/2);
      const sinDLon = Math.sin(dLon/2);
      const aa = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1)*Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
      return R * c;
    }

    const segLengths = [];
    let total = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const len = haversine(positions[i], positions[i+1]);
      segLengths.push(len);
      total += len;
    }

    let start = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = (elapsed % duration) / duration; // 0..1
      const distanceAlong = progress * total;

      // find segment
      let acc = 0;
      let segIndex = 0;
      while (segIndex < segLengths.length && acc + segLengths[segIndex] < distanceAlong) {
        acc += segLengths[segIndex];
        segIndex++;
      }
      if (segIndex >= segLengths.length) segIndex = segLengths.length - 1;

      const segStart = positions[segIndex];
      const segEnd = positions[segIndex+1];
      const segDist = segLengths[segIndex] || 1;
      const segT = (distanceAlong - acc) / segDist;

      const lat = lerp(segStart[0], segEnd[0], segT);
      const lng = lerp(segStart[1], segEnd[1], segT);

      // compute bearing for rotation
      const y = Math.sin(toRad(segEnd[1]-segStart[1])) * Math.cos(toRad(segEnd[0]));
      const x = Math.cos(toRad(segStart[0]))*Math.sin(toRad(segEnd[0])) - Math.sin(toRad(segStart[0]))*Math.cos(toRad(segEnd[0]))*Math.cos(toRad(segEnd[1]-segStart[1]));
      let bearing = Math.atan2(y, x) * 180 / Math.PI; // degrees
      bearing = (bearing + 360) % 360;

      if (markerRef.current && markerRef.current.setLatLng) {
        markerRef.current.setLatLng([lat, lng]);
        // report position so parent can follow
        if (typeof onPosition === 'function') onPosition([lat, lng], progress);
        // update icon with rotation
        const html = `<div class="plane-marker" style="transform: rotate(${bearing}deg)">✈️</div>`;
        const icon = L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
        if (markerRef.current.setIcon) markerRef.current.setIcon(icon);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [positions, duration, active, onPosition]);

  // initial icon
  const initHtml = `<div class="plane-marker">✈️</div>`;
  const initIcon = L.divIcon({ html: initHtml, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });

  return (
    // Marker is non-interactive; position will be updated by the animation loop
    <>{/* Fragment since Marker must be a child of MapContainer */}
      <LMarkerWrapper markerRef={markerRef} position={positions[0]} icon={initIcon} />
    </>
  );
}

// Small wrapper to expose the underlying Leaflet marker instance as ref-compatible
import { Marker as RMarker } from 'react-leaflet';
function LMarkerWrapper({ markerRef, position, icon }) {
  return <RMarker ref={markerRef} position={position} icon={icon} interactive={false} />;
}

/* AnimatedVehicle: similar to AnimatedPlane but uses a car emoji and vehicle styling */
function AnimatedVehicle({ positions, duration = 9000 }) {
  const markerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!positions || positions.length < 2) return;

    function toRad(deg) { return deg * Math.PI / 180; }
    function haversine(a, b) {
      const R = 6371000;
      const dLat = toRad(b[0] - a[0]);
      const dLon = toRad(b[1] - a[1]);
      const lat1 = toRad(a[0]);
      const lat2 = toRad(b[0]);
      const sinDLat = Math.sin(dLat/2);
      const sinDLon = Math.sin(dLon/2);
      const aa = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1)*Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
      return R * c;
    }

    const segLengths = [];
    let total = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const len = haversine(positions[i], positions[i+1]);
      segLengths.push(len);
      total += len;
    }

    let start = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = (elapsed % duration) / duration;
      const distanceAlong = progress * total;

      let acc = 0;
      let segIndex = 0;
      while (segIndex < segLengths.length && acc + segLengths[segIndex] < distanceAlong) {
        acc += segLengths[segIndex];
        segIndex++;
      }
      if (segIndex >= segLengths.length) segIndex = segLengths.length - 1;

      const segStart = positions[segIndex];
      const segEnd = positions[segIndex+1];
      const segDist = segLengths[segIndex] || 1;
      const segT = (distanceAlong - acc) / segDist;

      const lat = lerp(segStart[0], segEnd[0], segT);
      const lng = lerp(segStart[1], segEnd[1], segT);

      const y = Math.sin(toRad(segEnd[1]-segStart[1])) * Math.cos(toRad(segEnd[0]));
      const x = Math.cos(toRad(segStart[0]))*Math.sin(toRad(segEnd[0])) - Math.sin(toRad(segStart[0]))*Math.cos(toRad(segEnd[0]))*Math.cos(toRad(segEnd[1]-segStart[1]));
      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = (bearing + 360) % 360;

      if (markerRef.current && markerRef.current.setLatLng) {
        markerRef.current.setLatLng([lat, lng]);
        const html = `<div class="vehicle-marker" style="transform: rotate(${bearing}deg)">🚗</div>`;
        const icon = L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
        if (markerRef.current.setIcon) markerRef.current.setIcon(icon);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [positions, duration]);

  const initHtml = `<div class="vehicle-marker">🚗</div>`;
  const initIcon = L.divIcon({ html: initHtml, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });

  return <LMarkerWrapper markerRef={markerRef} position={positions[0]} icon={initIcon} />;
}
