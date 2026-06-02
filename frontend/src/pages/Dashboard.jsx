import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'framer-motion';
import { fetchMyTrips } from '../api/tripApi';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const preferredCurrency = user?.preferences?.currency || 'USD';

  const { data: serverStats, isLoading: statsLoading } = useQuery({
    queryKey: ['routeAnalytics'],
    queryFn: () => axiosClient.get('/analytics/summary'),
  });

  const { data: recentTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchMyTrips,
    select: (res) => {
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.filter((trip) => trip.status === 'optimized').slice(0, 1);
    },
  });

  if (statsLoading || tripsLoading) return <Loader fullScreen={false} />;

  const meta = serverStats?.data?.meta || {
    totalDistance: 0,
    totalLocations: 0,
    estimatedFuelCost: 0,
    totalSavedKm: 0,
    originalDistance: 0,
  };

  const latestTrip = recentTrips && recentTrips.length > 0 ? recentTrips[0] : null;
  const totalOriginal = meta.originalDistance || meta.totalDistance + meta.totalSavedKm;
  const efficiencyPercentage =
    totalOriginal > 0 ? ((meta.totalSavedKm / totalOriginal) * 100).toFixed(1) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] selection:bg-gray-200 font-sans animate-fade-in">
      <main className="max-w-[1040px] mx-auto px-6 pt-16 pb-32 flex flex-col space-y-16">
        
        <header>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[12px] font-semibold tracking-widest uppercase text-gray-500 mb-2"
          >
            Overview
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-[32px] font-semibold tracking-tight text-gray-900 leading-tight"
          >
            {user?.name?.split(' ')[0] || 'Planner'}'s Workspace
          </motion.h2>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white border border-[#EAEAEA] rounded-2xl p-8 md:p-12 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="md:col-span-7 flex flex-col"
          >
            <div className="flex items-center space-x-2 text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-4">
              <span>Distance Eliminated</span>
            </div>

            <div className="flex items-baseline">
              <span className="text-7xl sm:text-[96px] leading-[0.9] font-bold tracking-tighter text-gray-900 -ml-1">
                {meta.totalSavedKm.toFixed(0)}
              </span>
              <span className="text-2xl sm:text-3xl font-medium text-gray-400 ml-3 tracking-tight">
                km
              </span>
            </div>

            <p className="text-[14px] text-[#666] mt-6 leading-relaxed font-medium max-w-[340px]">
              Total travel distance successfully removed from your active routing footprint.
            </p>

            {meta.totalSavedKm > 0 && (
              <div className="inline-flex items-center space-x-2 mt-6 px-3 py-1.5 bg-[#F0FDF4] text-[12px] font-semibold text-[#166534] rounded-md w-max border border-[#DCFCE7]">
                <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{efficiencyPercentage}% more efficient</span>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="md:col-span-5 flex flex-col justify-center space-y-8 md:pl-12 md:border-l border-[#EAEAEA]"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-4">
              <span className="text-[13px] font-medium text-[#666] tracking-tight">
                Operational Distance
              </span>
              <span className="text-[18px] font-semibold tracking-tight text-gray-900">
                {formatDistance(meta.totalDistance)}
              </span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-4">
              <span className="text-[13px] font-medium text-[#666] tracking-tight">
                Locations Visited
              </span>
              <span className="text-[18px] font-semibold tracking-tight text-gray-900">
                {meta.totalLocations.toLocaleString()}
              </span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-4">
              <span className="text-[13px] font-medium text-[#666] tracking-tight">
                Fuel Expenditure
              </span>
              <span className="text-[18px] font-semibold tracking-tight text-[#166534]">
                {formatCurrency(meta.estimatedFuelCost, preferredCurrency)}
              </span>
            </motion.div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col">
            <h2 className="text-[12px] font-semibold tracking-widest uppercase text-gray-500 mb-6">
              Latest Route
            </h2>

            {!latestTrip ? (
              <div className="bg-[#FAFAFA] border border-dashed border-gray-300 rounded-2xl h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                 <p className="text-[13px] font-medium text-gray-500">No optimized routes in ledger.</p>
              </div>
            ) : (
              <Link to={`/trip-details/${latestTrip._id}`} className="group h-full block">
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 h-full shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        {new Date(latestTrip.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-8 group-hover:text-gray-600 transition-colors">
                      {latestTrip.title}
                    </h3>
                  </div>

                  <div className="pt-6 border-t border-[#EAEAEA] flex items-end justify-between">
                    <div>
                       <span className="block text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
                        Reduction
                      </span>
                      <span className="block text-2xl font-semibold tracking-tight text-[#166534]">
                        -{formatDistance(latestTrip.analytics?.optimizationSavings || 0)}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="flex flex-col">
            <h2 className="text-[12px] font-semibold tracking-widest uppercase text-gray-500 mb-6">
              Actions
            </h2>
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 h-full shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] flex flex-col justify-center">
              <h3 className="text-lg font-semibold tracking-tight text-gray-900 mb-2">
                New Route
              </h3>
              <p className="text-[14px] text-[#666] font-medium mb-8 leading-relaxed max-w-[280px]">
                Draft your destinations and calculate the optimal path instantly.
              </p>
              
              <Link to="/planner" className="mt-auto">
                <button className="w-full sm:w-auto h-10 px-6 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center group">
                  Start Planning
                  <ArrowRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default Dashboard;