import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import LocationInput from '../components/trip/LocationInput';
import MapView from '../components/map/MapView';
import {
  Sparkles,
  CloudCheck,
  AlertCircle,
  ArrowRight,
  Map as MapIcon,
  Repeat,
  ArrowRightCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripPlanner = () => {
  const routerLocation = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const generateDefaultTitle = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `Route Plan — ${today}`;
  };

  const [title, setTitle] = useState(generateDefaultTitle());
  const [locations, setLocations] = useState([]);
  const [routeType, setRouteType] = useState('oneWay'); 
  const [savedTrip, setSavedTrip] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (routerLocation.state?.tripToLoad) {
      const trip = routerLocation.state.tripToLoad;
      setSavedTrip(trip);
      setTitle(trip.title);
      setLocations(trip.locations || []);
      setRouteType(trip.routeType || 'oneWay'); 
      setHasUnsavedChanges(false);
      window.history.replaceState({}, document.title);
    }
  }, [routerLocation.state]);

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const tripTitle = savedTrip?.title || `Route Plan — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const dataToSave = { ...payload, title: tripTitle, routeType };

      if (savedTrip?._id) {
        return axiosClient.put(`/trips/${savedTrip._id}`, dataToSave);
      }
      return axiosClient.post('/trips', dataToSave);
    },
    onSuccess: (res) => {
      const updatedTrip = res.data?.data || res.data;
      setSavedTrip(updatedTrip);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
    },
  });

  const optimizationMutation = useMutation({
    mutationFn: (payload) => axiosClient.post(`/trips/${payload.tripId}/optimize`, { routeType: payload.routeType }),
    onSuccess: (res) => {
      const optimizedTrip = res.data?.data || res.data;
      setSavedTrip(optimizedTrip);
      setLocations(optimizedTrip.locations);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const handleAddLocation = (newLoc) => {
    setLocations([...locations, newLoc]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveLocation = (index) => {
    setLocations(locations.filter((_, idx) => idx !== index));
    setHasUnsavedChanges(true);
  };

  const handleManualSave = () => {
    if (locations.length === 0) return;
    saveMutation.mutate({ locations, routeType }); 
  };

  const handleExportCSV = () => {
    if (locations.length === 0) return;

    const headers = 'Stop Number,Location Name,Full Address,Latitude,Longitude\n';
    const rows = locations
      .map((loc, i) => {
        const cleanName = loc.name.replace(/"/g, '""');
        const cleanAddress = loc.address.replace(/"/g, '""');
        return `${i + 1},"${cleanName}","${cleanAddress}",${loc.coordinates.lat},${loc.coordinates.lng}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Route_Itinerary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerOptimization = async () => {
    if (locations.length < 2) return;

    let tripIdToOptimize = savedTrip?._id;

    try {
      if (!tripIdToOptimize || hasUnsavedChanges) {
        const saveRes = await saveMutation.mutateAsync({ locations, routeType });
        const newTrip = saveRes.data?.data || saveRes.data;
        tripIdToOptimize = newTrip._id;
      }

      optimizationMutation.mutate({ tripId: tripIdToOptimize, routeType });
    } catch (error) {
      console.error('Optimization Pipeline Failed:', error);
      alert('Failed to sync with the server. Please check your connection.');
    }
  };

  const isProcessing = saveMutation.isPending || optimizationMutation.isPending;
  const isOptimized = savedTrip?.status === 'optimized';
  const hasLocations = locations.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] selection:bg-gray-200 font-sans pb-32 animate-fade-in">
      <header className="max-w-[1040px] mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-gray-900 mb-2">
            Workspace
          </h1>
          <p className="text-[14px] text-[#666] font-medium">
            Draft destinations and generate the optimal operational sequence.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6 md:mt-0">
          {hasUnsavedChanges && (
            <span className="hidden sm:flex items-center text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md mr-2 tracking-tight">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} /> Unsaved
            </span>
          )}

          {!hasUnsavedChanges && savedTrip?._id && (
            <span className="hidden sm:flex items-center text-[12px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-1 rounded-md mr-2 tracking-tight">
              <CloudCheck className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} /> Synced
            </span>
          )}

          <button
            onClick={handleManualSave}
            disabled={!hasLocations || (!hasUnsavedChanges && savedTrip?._id)}
            className="text-[13px] font-medium text-[#666] hover:text-gray-900 hover:bg-gray-100/80 disabled:hover:bg-transparent disabled:opacity-40 transition-colors px-3 py-2 rounded-md"
          >
            Save Draft
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!hasLocations}
            className="text-[13px] font-medium text-[#666] hover:text-gray-900 hover:bg-gray-100/80 disabled:hover:bg-transparent disabled:opacity-40 transition-colors px-3 py-2 rounded-md"
          >
            Export CSV
          </button>

          <div className="w-px h-5 bg-[#EAEAEA] mx-1" />

          <button
            onClick={handleTriggerOptimization}
            disabled={locations.length < 2 || isProcessing}
            className="h-9 px-5 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center ml-1"
          >
            {isProcessing ? (
              <span className="flex items-center">
                 <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" /> Processing
              </span>
            ) : 'Optimize Route'}
          </button>
        </div>
      </header>

      <main className="max-w-[1040px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Builder */}
        <div className="lg:col-span-5 flex flex-col space-y-10">
          
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">
                Data Entry
              </h2>
            </div>
            
            <div className="flex bg-[#F4F4F5] p-1 rounded-lg w-max mb-8 border border-[#EAEAEA]">
              <button
                onClick={() => { setRouteType('oneWay'); setHasUnsavedChanges(true); }}
                className={`flex items-center px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-200 ${
                  routeType === 'oneWay'
                    ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ArrowRightCircle className={`w-3.5 h-3.5 mr-1.5 ${routeType === 'oneWay' ? 'text-gray-900' : 'text-gray-400'}`} />
                One-Way
              </button>
              <button
                onClick={() => { setRouteType('roundTrip'); setHasUnsavedChanges(true); }}
                className={`flex items-center px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-200 ${
                  routeType === 'roundTrip'
                    ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Repeat className={`w-3.5 h-3.5 mr-1.5 ${routeType === 'roundTrip' ? 'text-gray-900' : 'text-gray-400'}`} />
                Round Trip
              </button>
            </div>

            <LocationInput
              locations={locations}
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
            />
          </div>

          <AnimatePresence>
            {isOptimized && !hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="pt-8 border-t border-[#EAEAEA]">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-4">
                    Resolution
                  </h2>
                  <button
                    onClick={() => navigate(`/trip-details/${savedTrip._id}`)}
                    className="w-full h-14 bg-white border border-[#EAEAEA] hover:border-gray-300 text-gray-900 font-medium text-[13px] rounded-xl transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between px-6 group"
                  >
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      View Post-Op Report
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Map / Visualization */}
        <div className="lg:col-span-7 lg:sticky lg:top-12">
          <AnimatePresence mode="wait">
            {!hasLocations ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-[500px] bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8"
              >
                <MapIcon className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5">
                  Matrix Uninitialized
                </h3>
                <p className="text-[13px] text-[#666] max-w-[260px] leading-relaxed font-medium">
                  Add geographical nodes to the builder. The path visualization will compile here.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-[500px] lg:h-[calc(100vh-12rem)] bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 relative"
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex items-center justify-center transition-all duration-300">
                    <div className="px-5 py-2.5 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#EAEAEA] text-[12px] font-semibold tracking-wide text-gray-900 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse text-gray-500" /> Computing Path
                    </div>
                  </div>
                )}
                <MapView locations={locations} routeGeometry={savedTrip?.routeGeometry} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default TripPlanner;