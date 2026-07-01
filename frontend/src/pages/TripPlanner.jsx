import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import LocationInput from '../components/trip/LocationInput';
import MapView from '../components/map/MapView';
import TimeSelect from '../components/common/TimeSelect';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import {
  Sparkles,
  CloudCheck,
  AlertCircle,
  ArrowRight,
  Map as MapIcon,
  Repeat,
  ArrowRightCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripPlanner = () => {
  const routerLocation = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);


  const [locations, setLocations] = useState([]);
  const [routeType, setRouteType] = useState('oneWay');
  const [savedTrip, setSavedTrip] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [enableCapacityConstraint, setEnableCapacityConstraint] = useState(false);
  const [vehicleCapacity, setVehicleCapacity] = useState(100);
  const [enableTimeWindows, setEnableTimeWindows] = useState(false);
  const [departureTime, setDepartureTime] = useState('08:00');

  useEffect(() => {
    if (routerLocation.state?.tripToLoad) {
      const trip = routerLocation.state.tripToLoad;
      const uniqueLocs = (trip.locations || []).filter((loc, idx) => idx === 0 || !loc.isStartNode);
      
      setTimeout(() => {
        setSavedTrip(trip);
        setLocations(uniqueLocs);
        setRouteType(trip.routeType || 'oneWay');
        setEnableCapacityConstraint(trip.enableCapacityConstraint || false);
        setVehicleCapacity(trip.vehicleCapacity || user?.preferences?.vehicleCapacity || 100);
        setEnableTimeWindows(trip.enableTimeWindows || false);
        setDepartureTime(trip.departureTime || user?.preferences?.departureTime || '08:00');
        setHasUnsavedChanges(false);
      }, 0);

      window.history.replaceState({}, document.title);
    }
  }, [routerLocation.state, user]);

  const buildPayload = () => ({
    locations,
    routeType,
    enableCapacityConstraint,
    vehicleCapacity: Number(vehicleCapacity),
    enableTimeWindows,
    departureTime,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const tripTitle =
        savedTrip?.title ||
        `Route Plan — ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`;
      const data = { ...payload, title: tripTitle };
      return savedTrip?._id
        ? axiosClient.put(`/trips/${savedTrip._id}`, data)
        : axiosClient.post('/trips', data);
    },
    onSuccess: (res) => {
      const trip = res.data?.data || res.data;
      setSavedTrip(trip);
      const uniqueLocs = (trip.locations || []).filter((loc, idx) => idx === 0 || !loc.isStartNode);
      setLocations(uniqueLocs);
      setRouteType(trip.routeType || 'oneWay');
      setEnableCapacityConstraint(trip.enableCapacityConstraint || false);
      setVehicleCapacity(trip.vehicleCapacity || 100);
      setEnableTimeWindows(trip.enableTimeWindows || false);
      setDepartureTime(trip.departureTime || '08:00');
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
      addToast('Draft saved successfully', 'success');
    },
  });

  const optimizationMutation = useMutation({
    mutationFn: (payload) =>
      axiosClient.post(`/trips/${payload.tripId}/optimize`, { routeType: payload.routeType }),
    onSuccess: (res) => {
      const trip = res.data?.data || res.data;
      setSavedTrip(trip);
      const uniqueLocs = (trip.locations || []).filter((loc, idx) => idx === 0 || !loc.isStartNode);
      setLocations(uniqueLocs);
      setRouteType(trip.routeType || 'oneWay');
      setEnableCapacityConstraint(trip.enableCapacityConstraint || false);
      setVehicleCapacity(trip.vehicleCapacity || 100);
      setEnableTimeWindows(trip.enableTimeWindows || false);
      setDepartureTime(trip.departureTime || '08:00');
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      addToast('Route optimized successfully', 'success');
    },
  });

  const handleAddLocation = (loc) => { setLocations((p) => [...p, loc]); setHasUnsavedChanges(true); };
  const handleRemoveLocation = (idx) => { setLocations((p) => p.filter((_, i) => i !== idx)); setHasUnsavedChanges(true); };
  const handleUpdateServiceTime = (idx, val) => {
    setLocations((p) => { const n = [...p]; n[idx].serviceTime = Number(val); return n; });
    setHasUnsavedChanges(true);
  };
  const handleUpdateDemand = (idx, val) => {
    setLocations((p) => { const n = [...p]; n[idx].demand = Number(val); return n; });
    setHasUnsavedChanges(true);
  };
  const handleUpdateTimeWindow = (idx, field, val) => {
    setLocations((p) => { const n = [...p]; n[idx][field] = val || null; return n; });
    setHasUnsavedChanges(true);
  };

  const handleManualSave = () => {
    if (locations.length === 0) return;
    saveMutation.mutate(buildPayload());
  };

  const handleExportCSV = () => {
    if (locations.length === 0) return;
    const headers =
      'Stop Number,Location Name,Full Address,Latitude,Longitude,Service Time (mins),Load Demand,Time Window Start,Time Window End\n';
    const rows = locations
      .map((loc, i) => {
        const n = loc.name.replace(/"/g, '""');
        const a = loc.address.replace(/"/g, '""');
        return `${i + 1},"${n}","${a}",${loc.coordinates.lat},${loc.coordinates.lng},${loc.serviceTime || 0},${loc.demand || 0},"${loc.timeWindowStart || ''}","${loc.timeWindowEnd || ''}"`;
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
    let tripId = savedTrip?._id;
    try {
      if (!tripId || hasUnsavedChanges) {
        const res = await saveMutation.mutateAsync(buildPayload());
        const trip = res.data?.data || res.data;
        tripId = trip._id;
      }
      optimizationMutation.mutate({ tripId, routeType });
    } catch {
      addToast('Failed to sync with the server.', 'error');
    }
  };

  const isProcessing = saveMutation.isPending || optimizationMutation.isPending;
  const isOptimized = savedTrip?.status === 'optimized';
  const hasLocations = locations.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans pb-32 animate-fade-in">
      <header className="max-w-[1040px] mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-gray-900 mb-2">
            Workspace
          </h1>
          <p className="text-[14px] text-[#666] font-medium">
            Draft destinations and generate the optimal operational sequence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
          {hasUnsavedChanges && (
            <span className="flex items-center text-[11px] sm:text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-md tracking-tight">
              <AlertCircle className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Unsaved
            </span>
          )}
          {!hasUnsavedChanges && savedTrip?._id && (
            <span className="flex items-center text-[11px] sm:text-[12px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-1 rounded-md tracking-tight">
              <CloudCheck className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Synced
            </span>
          )}

          <button
            onClick={handleManualSave}
            disabled={!hasLocations || (!hasUnsavedChanges && savedTrip?._id)}
            className="text-[12px] sm:text-[13px] font-semibold px-3 py-1.5 bg-white border border-[#EAEAEA] text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-45 hover:text-gray-900 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            Save Draft
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!hasLocations}
            className="text-[12px] sm:text-[13px] font-semibold px-3 py-1.5 bg-white border border-[#EAEAEA] text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-45 hover:text-gray-900 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            Export CSV
          </button>

          <div className="hidden md:block w-px h-5 bg-[#EAEAEA] mx-1" />

          <button
            onClick={handleTriggerOptimization}
            disabled={locations.length < 2 || isProcessing}
            className="h-9 px-4 sm:px-5 bg-black text-white text-[12px] sm:text-[13px] font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center ml-auto md:ml-0"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Processing
              </span>
            ) : (
              'Optimize Route'
            )}
          </button>
        </div>
      </header>

      <main className="max-w-[1040px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
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
              onUpdateServiceTime={handleUpdateServiceTime}
              enableCapacityConstraint={enableCapacityConstraint}
              enableTimeWindows={enableTimeWindows}
              onUpdateDemand={handleUpdateDemand}
              onUpdateTimeWindow={handleUpdateTimeWindow}
            />
          </div>

          <div>
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-5">
              Logistical Constraints
            </h2>

            <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.015),0_1px_1px_rgba(0,0,0,0.02)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[13px] font-semibold text-gray-800 tracking-tight">
                      Vehicle Capacity Constraint
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium leading-normal">
                      Limit vehicle loads and force depot returns.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableCapacityConstraint}
                    onClick={() => { setEnableCapacityConstraint((p) => !p); setHasUnsavedChanges(true); }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${
                      enableCapacityConstraint ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                        enableCapacityConstraint ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {enableCapacityConstraint && (
                  <div className="flex items-center justify-between pl-1 pt-1.5">
                    <span className="text-[12px] text-gray-500 font-medium">Max Capacity Units</span>
                    <input
                      type="number"
                      min="1"
                      value={vehicleCapacity}
                      onChange={(e) => { setVehicleCapacity(Number(e.target.value)); setHasUnsavedChanges(true); }}
                      className="w-24 px-2.5 py-1.5 bg-[#FAFAFA] border border-[#EAEAEA] text-[12px] font-semibold text-gray-900 rounded-lg outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all text-right shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="h-px bg-[#F4F4F5]" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[13px] font-semibold text-gray-800 tracking-tight">
                      Scheduling Time Windows
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium leading-normal">
                      Validate specific arrival time intervals.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableTimeWindows}
                    onClick={() => { setEnableTimeWindows((p) => !p); setHasUnsavedChanges(true); }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none ${
                      enableTimeWindows ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                        enableTimeWindows ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {enableTimeWindows && (
                  <div className="flex items-center justify-between pl-1 pt-1.5">
                    <span className="text-[12px] text-gray-500 font-medium">Depot Departure Time</span>
                    <TimeSelect
                      value={departureTime}
                      onChange={(val) => { setDepartureTime(val); setHasUnsavedChanges(true); }}
                      align="right"
                      className="w-28 text-center cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
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
                <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5">Matrix Uninitialized</h3>
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
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex items-center justify-center">
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