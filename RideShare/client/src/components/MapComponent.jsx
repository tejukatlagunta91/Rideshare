import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Simple in-memory cache for geocoding to prevent hitting Nominatim limits
const geocodeCache = {};

// Component to handle dynamic map bounds centering
const MapBounds = ({ depCoords, destCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (depCoords && destCoords) {
      const bounds = L.latLngBounds([depCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (depCoords) {
      map.setView(depCoords, 10);
    }
  }, [depCoords, destCoords, map]);

  return null;
};

const getCoords = async (locationName) => {
  if (!locationName) return null;
  const key = locationName.toLowerCase().trim();
  if (geocodeCache[key]) {
    return geocodeCache[key];
  }
  
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
    if (res.data && res.data.length > 0) {
      const coords = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
      geocodeCache[key] = coords;
      return coords;
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
};

const MapComponent = ({ departure, destination }) => {
  const [depCoords, setDepCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCoordinates = async () => {
      setLoading(true);
      setError('');
      
      const dep = await getCoords(departure);
      // Add a small delay between requests to be nice to Nominatim API
      await new Promise(resolve => setTimeout(resolve, 300));
      const dest = await getCoords(destination);

      if (isMounted) {
        if (dep) setDepCoords(dep);
        if (dest) setDestCoords(dest);
        
        if (dep && dest) {
          try {
            const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${dep[1]},${dep[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`);
            if (osrmRes.data && osrmRes.data.routes && osrmRes.data.routes.length > 0) {
              const route = osrmRes.data.routes[0];
              const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
              setRouteCoords(coords);
              setDistance((route.distance / 1000).toFixed(1)); // distance in km
            }
          } catch (routeErr) {
            console.error('Routing error:', routeErr);
          }
        }

        if (!dep && !dest) {
          setError('Could not find locations on the map.');
        }
        setLoading(false);
      }
    };

    if (departure || destination) {
      fetchCoordinates();
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [departure, destination]);

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '10px' }}>Loading Map...</div>;
  if (error) return <div style={{ color: 'var(--text-secondary)', padding: '10px' }}>{error}</div>;

  const defaultCenter = [40.7128, -74.0060]; // Fallback to NYC
  const center = depCoords || destCoords || defaultCenter;

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', marginTop: '15px', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={10} style={{ width: '100%', height: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {depCoords && (
          <Marker position={depCoords}>
            <Popup>Departure: {departure}</Popup>
          </Marker>
        )}
        {destCoords && (
          <Marker position={destCoords}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
        )}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#5a4bda" weight={4} opacity={0.8} />
        )}
        <MapBounds depCoords={depCoords} destCoords={destCoords} />
      </MapContainer>
      {distance && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          background: '#18181b', // dark solid background
          color: '#ffffff', // high contrast text
          padding: '10px 18px', 
          borderRadius: '12px', 
          zIndex: 400, 
          fontWeight: '700', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)', 
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📍</span> 
          <span>Distance: <span style={{ color: '#818cf8' }}>{distance} km</span></span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
