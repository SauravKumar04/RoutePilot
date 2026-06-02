import { Polyline } from 'react-leaflet';
import { useMemo } from 'react';
import { decodeRouteGeometry } from '../../utils/decodePolyline';

const RoutePolyline = ({ encodedGeometry }) => {
  const positions = useMemo(() => {
    return decodeRouteGeometry(encodedGeometry);
  }, [encodedGeometry]);

  if (!positions.length) return null;

  return (
    <>
      {/* Outer subtle shadow/border for the route line */}
      <Polyline 
        positions={positions} 
        pathOptions={{ color: '#000000', weight: 6, opacity: 0.1 }} 
      />
      {/* Inner primary route line */}
      <Polyline 
        positions={positions} 
        pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.9, lineCap: 'round' }} 
      />
    </>
  );
};

export default RoutePolyline;