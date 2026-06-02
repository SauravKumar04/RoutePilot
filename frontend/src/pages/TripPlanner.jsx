// frontend/src/pages/TripPlanner.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import LocationInput from '../components/trip/LocationInput';
import MapView from '../components/map/MapView';
import { Sparkles, Save, RotateCcw, CloudCheck, AlertCircle, Download, ArrowRight, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripPlanner = () => {
  const routerLocation = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const generateDefaultTitle = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Route Plan — ${today}`;
  };

  const [title, setTitle] = useState(generateDefaultTitle());
  const [locations, setLocations] = useState([]);
  const [savedTrip, setSavedTrip] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (routerLocation.state?.tripToLoad) {
      const trip = routerLocation.state.tripToLoad;
      setSavedTrip(trip);
      setTitle(trip.title);
      setLocations(trip.locations || []);
      setHasUnsavedChanges(false);
      window.history.replaceState({}, document.title);
    }
  }, [routerLocation.state]);

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const tripTitle = savedTrip?.title || `Route Plan — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const dataToSave = { ...payload, title: tripTitle };
      if (savedTrip?._id) return axiosClient.put(`/trips/${savedTrip._id}`, dataToSave);
      return axiosClient.post('/trips', dataToSave);
    },
    onSuccess: (res) => {
      const updatedTrip = res.data?.data || res.data;
      setSavedTrip(updatedTrip);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
    }
  });

  const optimizationMutation = useMutation({
    mutationFn: (tripId) => axiosClient.post(`/trips/${tripId}/optimize`),
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
    saveMutation.mutate({ locations });
  };

  const handleReset = () => {
    if (locations.length > 0 && window.confirm("Clear workspace? Unsaved changes will be lost.")) {
      setLocations([]);
      setSavedTrip(null);
      setHasUnsavedChanges(false);
    }
  };

  const handleExportCSV = () => {
    if (locations.length === 0) return;
    const headers = "Stop Number,Location Name,Full Address,Latitude,Longitude\n";
    const rows = locations.map((loc, i) => {
      const cleanName = loc.name.replace(/"/g, '""'); 
      const cleanAddress = loc.address.replace(/"/g, '""');
      return `${i + 1},"${cleanName}","${cleanAddress}",${loc.coordinates.lat},${loc.coordinates.lng}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Route_Itinerary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerOptimization = async () => {
    if (locations.length < 2) return;
    let tripIdToOptimize = savedTrip?._id;
    try {
      if (!tripIdToOptimize || hasUnsavedChanges) {
        const saveRes = await saveMutation.mutateAsync({ locations });
        const newTrip = saveRes.data?.data || saveRes.data;
        tripIdToOptimize = newTrip._id; 
      }
      optimizationMutation.mutate(tripIdToOptimize);
    } catch (error) {
      console.error("Optimization Pipeline Failed:", error);
      alert("Failed to sync with the server. Please check your connection.");
    }
  };

  const isProcessing = saveMutation.isPending || optimizationMutation.isPending;
  const isOptimized = savedTrip?.status === 'optimized';
  const hasLocations = locations.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans pb-32 animate-fade-in">
      
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            Plan a Route
          </h1>
          <p className="text-[14px] text-gray-500 font-medium">
            Add destinations and generate the most efficient journey.
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-6 md:mt-0">
          {hasUnsavedChanges && (
             <span className="hidden sm:flex items-center text-[11px] font-medium text-amber-600 mr-2">
               <AlertCircle className="w-3.5 h-3.5 mr-1" /> Unsaved
             </span>
          )}
          {(!hasUnsavedChanges && savedTrip?._id) && (
             <span className="hidden sm:flex items-center text-[11px] font-medium text-emerald-600 mr-2">
               <CloudCheck className="w-3.5 h-3.5 mr-1" /> Saved
             </span>
          )}

          <button 
            onClick={handleManualSave}
            disabled={!hasLocations || (!hasUnsavedChanges && savedTrip?._id)}
            className="text-[13px] font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors px-3 py-2"
          >
            Save Draft
          </button>
          
          <button 
            onClick={handleExportCSV}
            disabled={!hasLocations}
            className="text-[13px] font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors px-3 py-2"
          >
            Export CSV
          </button>

          <div className="w-px h-4 bg-gray-200 mx-1"></div>

          <button
            onClick={handleTriggerOptimization}
            disabled={locations.length < 2 || isProcessing}
            className="text-[13px] font-medium px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-all shadow-sm flex items-center"
          >
            {isProcessing ? 'Calculating...' : 'Optimize Route'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        <div className="lg:col-span-5 flex flex-col space-y-12">
          <div>
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">Route Builder</h2>
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
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-4">Route Resolution</h2>
                  <button 
                    onClick={() => navigate(`/trip-details/${savedTrip._id}`)}
                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-medium text-[14px] rounded-xl transition-all flex items-center justify-between px-6 group"
                  >
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-900 transition-colors" /> 
                      View Comprehensive Report
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-7 lg:sticky lg:top-12">
          <AnimatePresence mode="wait">
            {!hasLocations ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-[500px] bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mb-6">
                  <MapIcon className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">No locations added</h3>
                <p className="text-[14px] text-gray-500 max-w-sm leading-relaxed">
                  Start by adding your origin and destination. Your geographical visualization and optimized path will appear here.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-[500px] lg:h-[calc(100vh-12rem)] rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50 relative"
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                     <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 text-[13px] font-medium text-gray-600 flex items-center">
                       <Sparkles className="w-4 h-4 mr-2 animate-pulse" /> Optimizing Matrix...
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