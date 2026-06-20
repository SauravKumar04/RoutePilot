import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchMyTrips } from '../api/tripApi';
import axiosClient from '../api/axiosClient';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import { Trash2, Search, ArrowRight, Route as RouteIcon, MapPin, Repeat } from 'lucide-react';
import { formatDistance } from '../utils/formatDistance';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';

const MyTrips = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [tripToDelete, setTripToDelete] = useState(null);
  const addToast = useToastStore((state) => state.addToast);
  const distanceUnit = useAuthStore((state) => state.user?.preferences?.distanceUnit || 'km');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchMyTrips,
    select: (res) => {
      if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
      addToast('Route deleted permanently', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to delete route', 'error');
    }
  });

  if (isLoading) return <Loader fullScreen={false} />;

  const filteredTrips =
    trips?.filter((trip) =>
      trip.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] text-[#111] selection:bg-gray-200 font-sans pb-32 animate-fade-in">
        <header className="max-w-[1040px] mx-auto px-6 pt-16 pb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAEAEA]">
          <div>
            <h1 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-gray-900 mb-2">
              Trip Ledger
            </h1>
            <p className="text-[14px] text-[#666] font-medium">
              Manage, search, and review your operational routing data.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <button
              onClick={() => navigate('/planner')}
              className="w-full sm:w-auto h-10 px-6 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center"
            >
              New Route
            </button>
          </div>
        </header>

        <main className="max-w-[1040px] mx-auto px-6 py-12">
          {trips && trips.length > 0 && (
            <div className="relative w-full max-w-md mb-10 group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved routes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAEAEA] rounded-xl text-[13px] text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] outline-none transition-all placeholder-gray-400"
              />
            </div>
          )}

          {!trips || trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-[400px] bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8 mt-4"
            >
              <RouteIcon className="w-6 h-6 text-gray-300 mb-4" strokeWidth={1.5} />
              <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5">
                No routing matrices found
              </h3>
              <p className="text-[13px] text-[#666] max-w-[260px] leading-relaxed font-medium mb-8">
                Your ledger is currently empty. Start drafting your first set of waypoints to generate an optimal route.
              </p>
              <button
                onClick={() => navigate('/planner')}
                className="h-9 px-5 bg-white border border-[#EAEAEA] text-[13px] font-medium text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center"
              >
                Start Drafting
              </button>
            </motion.div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[13px] text-[#666] font-medium">
                No routes match your search query "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <AnimatePresence>
                {filteredTrips.map((trip, idx) => {
                  const hasValidLocations = trip.locations && trip.locations.length >= 2;
                  const originName = hasValidLocations ? trip.locations[0].name.split(',')[0] : '';
                  const isRoundTrip = trip.routeType === 'roundTrip';
                  const destinationName = hasValidLocations 
                    ? (isRoundTrip ? originName : trip.locations[trip.locations.length - 1].name.split(',')[0])
                    : '';
                  const intermediateStops = hasValidLocations ? (isRoundTrip ? trip.locations.length - 1 : trip.locations.length - 2) : 0;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      key={trip._id}
                      className="group bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-6 md:items-center">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight truncate">
                              {trip.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight uppercase ${trip.status === 'optimized' ? 'bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]' : 'bg-[#F4F4F5] text-gray-500 border border-[#EAEAEA]'}`}>
                              {trip.status === 'optimized' ? 'Optimized' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-[12px] font-medium text-gray-400">
                            {new Date(trip.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>

                          {hasValidLocations && (
                            <div className="mt-5 flex items-center w-full max-w-sm">
                              <div className="flex items-center gap-2 max-w-[40%]">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-[12px] font-medium text-gray-900 truncate">{originName}</span>
                              </div>
                              
                              <div className="flex-1 mx-4 relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-dashed border-gray-300"></div>
                                </div>
                                {intermediateStops > 0 && (
                                  <span className="relative z-10 bg-white px-2 text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                                    {intermediateStops} stops
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 max-w-[40%]">
                                {isRoundTrip ? (
                                  <Repeat className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />
                                )}
                                <span className="text-[12px] font-medium text-gray-900 truncate">{destinationName}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row md:flex-col gap-8 md:gap-1 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-[#EAEAEA] pt-4 md:pt-0">
                          <div>
                            <span className="block text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5">
                              Distance
                            </span>
                            <span className="text-[14px] font-semibold text-gray-900">
                              {formatDistance(trip.analytics?.totalDistance || 0, distanceUnit)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5 mt-0 md:mt-3">
                              Waypoints
                            </span>
                            <span className="text-[14px] font-semibold text-gray-900">
                              {trip.locations?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[#EAEAEA]">
                        <button
                          onClick={() => setTripToDelete(trip._id)}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate('/planner', { state: { tripToLoad: trip } })}
                          className="h-9 px-4 bg-white text-gray-900 text-[12px] font-medium rounded-lg border border-[#EAEAEA] hover:border-gray-300 hover:bg-gray-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center group/btn"
                        >
                          Workspace
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-gray-400 group-hover/btn:text-gray-900 transition-colors" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={() => deleteMutation.mutate(tripToDelete)}
        title="Delete routing data"
        message="Are you sure you want to permanently delete this route? This action cannot be undone and the mathematical data will be lost."
        confirmText="Delete Route"
        isDestructive={true}
        icon={Trash2}
      />
    </>
  );
};

export default MyTrips;