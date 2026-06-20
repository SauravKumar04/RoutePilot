import { useState } from 'react';
import { MapPin, Plus, Trash2, Loader2, Clock, LocateFixed, GripVertical } from 'lucide-react';
import axios from 'axios';
import ConfirmModal from '../common/ConfirmModal';
import TimeSelect from '../common/TimeSelect';
import { useToastStore } from '../../store/toastStore';

const LocationInput = ({
  onAddLocation,
  locations,
  onRemoveLocation,
  onUpdateServiceTime,
  enableCapacityConstraint = false,
  enableTimeWindows = false,
  onUpdateDemand,
  onUpdateTimeWindow,
}) => {
  const [addressText, setAddressText] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const addToast = useToastStore((state) => state.addToast);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addressText.trim()) return;
    setIsGeocoding(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: addressText, format: 'json', limit: 1 },
      });
      if (response.data?.length > 0) {
        const match = response.data[0];
        onAddLocation({
          name: match.display_name.split(',')[0] || addressText,
          address: match.display_name,
          coordinates: { lat: parseFloat(match.lat), lng: parseFloat(match.lon) },
          isStartNode: locations.length === 0,
          serviceTime: 15,
          demand: 0,
          timeWindowStart: null,
          timeWindowEnd: null,
        });
        setAddressText('');
        addToast('Location added successfully', 'success');
      } else {
        addToast('Location not found. Try a different spelling.', 'error');
      }
    } catch {
      addToast('Geocoding failed. Check network.', 'error');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat: latitude, lon: longitude, format: 'json' },
          });
          if (response.data) {
            const match = response.data;
            const name =
              match.address?.city ||
              match.address?.town ||
              match.address?.village ||
              'Current Location';
            onAddLocation({
              name,
              address: match.display_name,
              coordinates: { lat: latitude, lng: longitude },
              isStartNode: locations.length === 0,
              serviceTime: 15,
              demand: 0,
              timeWindowStart: null,
              timeWindowEnd: null,
            });
            addToast('Current location resolved', 'success');
          }
        } catch {
          addToast('Failed to fetch address for current location.', 'error');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        addToast('Unable to retrieve your location. Check browser permissions.', 'error');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <>
      <div className="space-y-5">
        <form onSubmit={handleAdd} className="relative flex items-center">
          <MapPin className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search city, state, or zip..."
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            disabled={isGeocoding || isLocating}
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#EAEAEA] rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLocating || isGeocoding}
              title="Use current GPS location"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="submit"
              disabled={isGeocoding || isLocating || !addressText.trim()}
              className="px-3 py-1.5 bg-white border border-[#EAEAEA] rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all disabled:opacity-50 flex items-center"
            >
              {isGeocoding ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1" />
              )}
              Add
            </button>
          </div>
        </form>

        {locations.length > 0 && (
          <div className="border border-[#EAEAEA] rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] divide-y divide-[#EAEAEA]">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="group flex items-start justify-between p-3 hover:bg-[#FAFAFA] transition-colors duration-200"
              >
                <div className="flex flex-1 items-start space-x-3.5 min-w-0 pr-4 pt-0.5">
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hidden sm:block ml-1 mt-1">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                      loc.isStartNode
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 border border-[#EAEAEA]'
                    }`}
                  >
                    {idx === 0 ? 'O' : idx}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                      <div className="truncate">
                        <p className="font-semibold text-[13px] text-gray-900 tracking-tight truncate leading-snug">
                          {loc.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate leading-snug mt-0.5">
                          {loc.address}
                        </p>
                      </div>

                      {idx !== 0 && onUpdateServiceTime && (
                        <div className="relative flex items-center group/time w-[95px] shrink-0">
                          <Clock className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 group-focus-within/time:text-gray-900 transition-colors z-10" />
                          <input
                            type="number"
                            min="0"
                            value={loc.serviceTime ?? 15}
                            onChange={(e) => onUpdateServiceTime(idx, e.target.value)}
                            className="w-full pl-8 pr-6 py-1.5 bg-white border border-[#EAEAEA] text-[12px] font-medium text-gray-900 rounded-lg outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-right tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-2.5 text-[11px] font-medium text-gray-400 pointer-events-none z-10">
                            m
                          </span>
                        </div>
                      )}
                    </div>

                    {idx !== 0 && (enableCapacityConstraint || enableTimeWindows) && (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-[#F4F4F5] flex flex-wrap items-center gap-3">
                        {enableCapacityConstraint && onUpdateDemand && (
                          <div className="flex items-center space-x-1.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg px-2.5 py-1 shrink-0 focus-within:ring-1 focus-within:ring-black focus-within:border-black focus-within:bg-white transition-all shadow-sm">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">
                              Load
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={loc.demand ?? 0}
                              onChange={(e) => onUpdateDemand(idx, e.target.value)}
                              className="w-10 bg-transparent text-[11px] font-semibold text-gray-900 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[10px] text-gray-400 font-medium">units</span>
                          </div>
                        )}

                        {enableTimeWindows && onUpdateTimeWindow && (
                          <div className="flex items-center space-x-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-lg px-2.5 py-1 shrink-0 focus-within:ring-1 focus-within:ring-black focus-within:border-black focus-within:bg-white transition-all shadow-sm">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase select-none">
                              Window
                            </span>
                            <TimeSelect
                              value={loc.timeWindowStart || ''}
                              onChange={(val) => onUpdateTimeWindow(idx, 'timeWindowStart', val)}
                              label="Start"
                              variant="ghost"
                              className="cursor-pointer"
                            />
                            <span className="text-[10px] text-gray-400 font-semibold select-none">—</span>
                            <TimeSelect
                              value={loc.timeWindowEnd || ''}
                              onChange={(val) => onUpdateTimeWindow(idx, 'timeWindowEnd', val)}
                              label="End"
                              variant="ghost"
                              className="cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteIndex(idx)}
                  className="p-2 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ml-2 mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => onRemoveLocation(deleteIndex)}
        title="Remove waypoint"
        message="Are you sure you want to remove this geographical node? Your route will recalculate automatically."
        confirmText="Remove Node"
        isDestructive={true}
        icon={Trash2}
      />
    </>
  );
};

export default LocationInput;