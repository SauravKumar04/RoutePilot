// frontend/src/components/map/MapView.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

// Automatically fit the map bounds to show all markers
const MapBoundsFitter = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.coordinates.lat, loc.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
};

// Create a custom numbered HTML icon for the map
const createCustomIcon = (number, isStart) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${isStart ? '#111827' : '#3B82F6'}; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const MapView = ({ locations, routeGeometry }) => {
  const decodedPath = routeGeometry ? polyline.decode(routeGeometry) : [];
  const defaultCenter = [20.5937, 78.9629]; // Center of India

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        className="w-full h-full absolute inset-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        
        {decodedPath.length > 0 && (
          <Polyline positions={decodedPath} color="#3B82F6" weight={4} opacity={0.8} />
        )}

        {/* 🚨 NEW: Render the actual numbered locations on the map! */}
        {locations?.map((loc, idx) => (
          <Marker 
            key={idx} 
            position={[loc.coordinates.lat, loc.coordinates.lng]}
            icon={createCustomIcon(idx + 1, idx === 0)}
          >
            <Popup>
              <strong>Stop {idx + 1}: {loc.name}</strong><br/>
              <span style={{ fontSize: '11px', color: '#666' }}>{loc.address}</span>
            </Popup>
          </Marker>
        ))}

        <MapBoundsFitter locations={locations} />
      </MapContainer>
    </div>
  );
};

export default MapView;