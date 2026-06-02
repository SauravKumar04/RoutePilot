// frontend/src/components/trip/LocationInput.jsx
import { useState } from 'react';
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const LocationInput = ({ onAddLocation, locations, onRemoveLocation }) => {
  const [addressText, setAddressText] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addressText.trim()) return;
    setIsGeocoding(true);

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: addressText, format: 'json', limit: 1 }
      });

      if (response.data && response.data.length > 0) {
        const match = response.data[0];
        onAddLocation({
          name: match.display_name.split(',')[0] || addressText,
          address: match.display_name,
          coordinates: { lat: parseFloat(match.lat), lng: parseFloat(match.lon) },
          isStartNode: locations.length === 0,
        });
        setAddressText('');
      } else {
        alert("Location not found. Try a different spelling.");
      }
    } catch (err) {
      alert("Geocoding failed. Check network.");
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleAdd} className="relative flex items-center">
        <MapPin className="absolute left-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search city, state, or zip..."
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          disabled={isGeocoding}
          className="w-full pl-10 pr-20 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 outline-none transition-all shadow-sm"
        />
        <div className="absolute right-1.5 flex items-center">
          <button 
            type="submit" 
            disabled={isGeocoding || !addressText.trim()}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50 flex items-center"
          >
            {isGeocoding ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
            Add
          </button>
        </div>
      </form>

      {/* 🚨 Removed height constraints. Let it flow naturally! */}
      {locations.length > 0 && (
        <div className="ring-1 ring-inset ring-gray-900/5 rounded-xl bg-white shadow-sm divide-y divide-gray-100/80">
          {locations.map((loc, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors duration-200">
              <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${loc.isStartNode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {idx + 1}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-[13px] text-gray-900 tracking-tight truncate leading-snug">{loc.name}</p>
                  <p className="text-[11px] text-gray-500 truncate leading-snug mt-0.5">{loc.address}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveLocation(idx)}
                className="p-2 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;