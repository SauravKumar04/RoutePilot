// frontend/src/pages/MyTrips.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchMyTrips } from '../api/tripApi'; 
import axiosClient from '../api/axiosClient';
import Loader from '../components/common/Loader';
import { Trash2, Plus, Search, ArrowRight, Route as RouteIcon } from 'lucide-react';
import { formatDistance } from '../utils/formatDistance';
import { motion, AnimatePresence } from 'framer-motion';

const generateMiniPath = (numPoints) => {
  if (numPoints <= 1) return "M 0 10 L 100 10";
  let path = "M 0 10";
  const step = 100 / (numPoints - 1);
  for (let i = 0; i < numPoints - 1; i++) {
    path += ` L ${(i + 1) * step} 10`;
  }
  return path;
};

const MyTrips = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchMyTrips,
    select: (res) => {
      if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['routeAnalytics'] });
    }
  });

  if (isLoading) return <Loader fullScreen={false} />;

  const filteredTrips = trips?.filter(trip => 
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans pb-32 animate-fade-in">
      
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            Trip Ledger
          </h1>
          <p className="text-[14px] text-gray-500 font-medium">
            Manage, search, and review your operational routing data.
          </p>
        </div>
        
        <div className="mt-6 md:mt-0">
          <button 
            onClick={() => navigate('/planner')} 
            className="w-full sm:w-auto inline-flex items-center justify-center text-[13px] font-medium px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> New Route
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {trips && trips.length > 0 && (
          <div className="relative w-full max-w-md mb-12">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved routes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] text-gray-900 focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-900/5 outline-none transition-all placeholder-gray-400"
            />
          </div>
        )}

        {(!trips || trips.length === 0) ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full h-[400px] bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center p-8 mt-4"
          >
            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mb-6">
              <RouteIcon className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-2">No routing matrices found</h3>
            <p className="text-[14px] text-gray-500 max-w-sm leading-relaxed mb-6">
              Your ledger is currently empty. Start drafting your first set of waypoints to generate an optimal route.
            </p>
            <button 
              onClick={() => navigate('/planner')} 
              className="text-[13px] font-medium text-gray-900 bg-white border border-gray-200 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center"
            >
              Start Drafting <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
            </button>
          </motion.div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-gray-500 font-medium">No routes match your search query "{searchQuery}"</p>
          </div>
        ) : (
          
          <div className="flex flex-col">
            <div className="hidden md:grid grid-cols-12 gap-6 px-4 pb-4 border-b border-gray-100 text-[10px] font-semibold tracking-widest uppercase text-gray-400">
              <div className="col-span-6">Route Details</div>
              <div className="col-span-3">Metrics</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <AnimatePresence>
              {filteredTrips.map((trip, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  key={trip._id} 
                  className="group flex flex-col md:grid md:grid-cols-12 gap-6 items-start md:items-center py-8 border-b border-gray-100 hover:bg-gray-50/50 transition-colors md:-mx-4 md:px-4 rounded-xl"
                >
                  
                  {/* Column 1: Title & Visual Rail */}
                  <div className="col-span-6 w-full min-w-0 pr-4">
                    <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight line-clamp-1 mb-1  transition-colors">
                      {trip.title}
                    </h3>
                    <div className="flex items-center text-[12px] font-medium text-gray-400 mb-6">
                      <span>{new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="mx-2 w-1 h-1 rounded-full bg-gray-200" />
                      <span className={`${trip.status === 'optimized' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {trip.status === 'optimized' ? 'Optimized' : 'Draft'}
                      </span>
                    </div>

                    {/* Micro Route Rail with City Names */}
                    {trip.locations && trip.locations.length >= 2 && (
                      <div className="relative w-full max-w-[320px] h-10 mt-2">
                        {/* Static Track Line */}
                        <div className="absolute left-0 right-0 h-[1.5px] bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
                        {/* Active Track Line (Hover) */}
                        <div className="absolute left-0 h-[1.5px] bg-gray-900 top-1/2 -translate-y-1/2 z-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300" style={{ width: '100%' }} />
                        
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                          {trip.locations.map((loc, i) => {
                            const isStart = i === 0;
                            const isEnd = i === trip.locations.length - 1;
                            return (
                              <div key={i} className="relative flex flex-col items-center">
                                {/* City Name */}
                                <div className="absolute bottom-3 whitespace-nowrap text-[10px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                                  {loc.name.split(',')[0]}
                                </div>
                                
                                {/* Node Dot */}
                                <div className={`w-1.5 h-1.5 rounded-full ring-2 ring-white relative z-10 ${isStart || isEnd ? 'bg-gray-900' : 'bg-gray-200 group-hover:bg-gray-400 transition-colors'}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Metrics */}
                  <div className="col-span-3 flex flex-row md:flex-col gap-6 md:gap-1 w-full mt-4 md:mt-0">
                    <div>
                      <span className="block md:hidden text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1">Stops</span>
                      <span className="text-[13px] font-medium text-gray-900">{trip.locations?.length || 0} Waypoints</span>
                    </div>
                    <div>
                      <span className="block md:hidden text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1">Distance</span>
                      <span className="text-[13px] font-medium text-gray-500">{formatDistance(trip.analytics?.totalDistance || 0)}</span>
                    </div>
                  </div>

                  {/* Column 3: Actions */}
                  <div className="col-span-3 flex items-center justify-end w-full mt-4 md:mt-0 gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => { if(window.confirm('Permanently delete this routing data?')) deleteMutation.mutate(trip._id) }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => navigate('/planner', { state: { tripToLoad: trip } })}
                      className="px-4 py-2 bg-gray-50 text-gray-900 text-[12px] font-medium rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm flex items-center"
                    >
                      Open Workspace <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrips;