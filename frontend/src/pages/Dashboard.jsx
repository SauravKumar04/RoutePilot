// frontend/src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';
import { ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'framer-motion';
import { fetchMyTrips } from '../api/tripApi';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  const { data: serverStats, isLoading: statsLoading } = useQuery({
    queryKey: ['routeAnalytics'],
    queryFn: () => axiosClient.get('/analytics/summary').then(res => res.data),
  });

  const { data: recentTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchMyTrips,
    select: (res) => {
      let data = [];
      if (res?.data?.data && Array.isArray(res.data.data)) data = res.data.data;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res)) data = res;
      
      return data.filter(trip => trip.status === 'optimized').slice(0, 1);
    }
  });

  if (statsLoading || tripsLoading) return <Loader fullScreen={false} />;

  const meta = serverStats?.meta || { totalDistance: 0, totalLocations: 0, estimatedFuelCost: 0, totalSavedKm: 0, originalDistance: 0 };
  const latestTrip = recentTrips && recentTrips.length > 0 ? recentTrips[0] : null;
  
  const formatLocalDistance = (amount) => formatDistance(amount);
  const formatLocalCurrency = (amount) => formatCurrency(amount);

  const totalOriginal = meta.originalDistance || meta.totalDistance + meta.totalSavedKm;
  const efficiencyPercentage = totalOriginal > 0 ? ((meta.totalSavedKm / totalOriginal) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans animate-fade-in">
      
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-32 flex flex-col space-y-24">
        
        {/* 1. Greeting & Hero Architecture */}
        <section className="flex flex-col space-y-16">
          <header>
            <h1 className="text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
              Overview
            </h1>
            <h2 className="text-3xl sm:text-[34px] font-semibold tracking-tight text-gray-900 leading-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Planner'}.
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 items-start">
            
            {/* Primary Story: Total Efficiency */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="md:col-span-7 flex flex-col"
            >
              <div className="flex items-center space-x-2 text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-4">
                <span>Distance Eliminated</span>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-7xl sm:text-[100px] leading-none font-semibold tracking-tighter text-gray-900 -ml-1">
                  {meta.totalSavedKm.toFixed(0)}
                </span>
                <span className="text-2xl sm:text-3xl font-medium text-gray-400 ml-2 tracking-tight">km</span>
              </div>
              
              <p className="text-[15px] text-gray-500 mt-6 leading-relaxed font-medium max-w-[340px]">
                Your algorithmic optimizations have removed <span className="text-gray-900 font-semibold">{formatLocalDistance(meta.totalSavedKm)}</span> of unnecessary travel from your fleet's total footprint.
              </p>

              {meta.totalSavedKm > 0 && (
                <div className="flex items-center space-x-2 mt-4 text-[13px] font-medium text-emerald-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>{efficiencyPercentage}% more efficient than unoptimized routing.</span>
                </div>
              )}
            </motion.div>

            {/* Secondary Operational Metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-5 flex flex-col justify-center space-y-8 md:pl-10 md:border-l border-gray-100"
            >
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                <span className="text-[13px] font-medium text-gray-500 tracking-tight">Operational Distance</span>
                <span className="text-xl font-semibold tracking-tight text-gray-900">{formatLocalDistance(meta.totalDistance)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                <span className="text-[13px] font-medium text-gray-500 tracking-tight">Locations Visited</span>
                <span className="text-xl font-semibold tracking-tight text-gray-900">{meta.totalLocations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                <span className="text-[13px] font-medium text-gray-500 tracking-tight">Fuel Expenditure</span>
                <span className="text-xl font-semibold tracking-tight text-gray-900">{formatLocalCurrency(meta.estimatedFuelCost)}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Recent Optimization Story */}
        <section className="border-t border-gray-100 pt-16">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-10">Latest Optimization</h2>
          
          {!latestTrip ? (
            <p className="text-[13px] font-medium text-gray-400">No optimized routes found in your ledger.</p>
          ) : (
            <Link to={`/trip-details/${latestTrip._id}`} className="group block">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
                
                {/* Left: The Route Visualization */}
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {latestTrip.title}
                  </h3>
                  <p className="text-[12px] font-medium text-gray-400 mb-10">
                    Generated {new Date(latestTrip.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* Elegant Trip Detail-style Journey Rail */}
                  {latestTrip.locations && latestTrip.locations.length >= 2 && (
                    <div className="relative w-full max-w-lg h-12 mb-6">
                      {/* Background Rail */}
                      <div className="absolute left-0 right-0 h-[1.5px] bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
                      {/* Foreground Active Rail */}
                      <div className="absolute left-0 h-[1.5px] bg-gray-900 top-1/2 -translate-y-1/2 z-0 transition-opacity group-hover:opacity-70" style={{ width: '100%' }} />
                      
                      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                        {latestTrip.locations.map((loc, idx) => {
                          const isStart = idx === 0;
                          const isEnd = idx === latestTrip.locations.length - 1;
                          return (
                            <div key={idx} className="relative flex flex-col items-center">
                              {/* Location Name (Top) */}
                              <div className="absolute bottom-4 whitespace-nowrap text-[12px] font-semibold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                {loc.name.split(',')[0]}
                              </div>

                              {/* Node */}
                              <div className={`w-2 h-2 rounded-full ring-4 ring-white relative z-10 ${isStart || isEnd ? 'bg-gray-900' : 'bg-gray-200 group-hover:bg-gray-400 transition-colors'}`} />
                              
                              {/* Meta Status (Bottom) */}
                              <div className="absolute top-4 whitespace-nowrap text-[9px] font-medium tracking-widest uppercase text-gray-400">
                                {isStart ? 'Origin' : isEnd ? 'Terminal' : `0${idx + 1}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: The Savings Outcome */}
                <div className="md:text-right shrink-0 mt-8 md:mt-0">
                  <span className="block text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
                    Distance Eliminated
                  </span>
                  <span className="block text-3xl font-semibold tracking-tight text-gray-900">
                    -{formatDistance(latestTrip.analytics?.optimizationSavings || 0)}
                  </span>
                </div>

              </div>
            </Link>
          )}
        </section>

        {/* 3. Integrated Action Block */}
        <section className="bg-gray-50/50 rounded-2xl p-10 md:p-12 border border-gray-100 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center mb-6">
            <Sparkles className="w-4 h-4 text-gray-900" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 mb-3">
            Ready to plan your next route?
          </h2>
          <p className="text-[14px] text-gray-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
            Input your next set of waypoints and let the engine determine the most mathematically efficient sequence.
          </p>
          <Link to="/planner">
            <button className="inline-flex items-center text-[13px] font-medium px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm group">
              Start Planning <ArrowRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </Link>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;