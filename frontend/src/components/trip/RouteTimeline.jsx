// frontend/src/components/trip/RouteTimeline.jsx
import { MapPin, Navigation } from 'lucide-react';

const RouteTimeline = ({ locations }) => {
  if (!locations || locations.length === 0) return null;

  return (
    // 🚨 Removed height constraints. Let it flow naturally!
    <div className="relative pl-5 py-2 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-px before:bg-gray-200">
      {locations.map((loc, idx) => {
        const isStart = idx === 0;
        return (
          <div key={loc._id || idx} className="relative flex items-start group">
            <div className="absolute -left-[26px] mt-0.5 bg-white rounded-full ring-4 ring-white z-10">
              <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isStart ? 'bg-gray-900' : 'bg-gray-100 border border-gray-200'}`}>
                {isStart ? (
                  <Navigation className="w-3 h-3 text-white fill-white" />
                ) : (
                  <MapPin className="w-3 h-3 text-gray-500" />
                )}
              </div>
            </div>
            
            <div className="pl-3 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block truncate">
                {isStart ? 'Origin Point' : `Waypoint ${idx}`}
              </span>
              <h4 className="font-semibold text-[13px] text-gray-900 mt-1 leading-tight truncate">{loc.name}</h4>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed truncate max-w-[240px] sm:max-w-xs">
                {loc.address || 'Geocoded Coordinates Valid'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RouteTimeline;