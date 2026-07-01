import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/common/Loader';
import { 
  ArrowRight, 
  TrendingDown, 
  Zap, 
  MapPin, 
  Settings, 
  Plus, 
  Compass 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import { fetchMyTrips } from '../api/tripApi';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const preferredCurrency = user?.preferences?.currency || 'USD';
  const distanceUnit = user?.preferences?.distanceUnit || 'km';

  const { data: serverStats, isLoading: statsLoading } = useQuery({
    queryKey: ['routeAnalytics'],
    queryFn: () => axiosClient.get('/analytics/summary'),
  });

  const { data: recentTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchMyTrips,
    select: (res) => {
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.filter((trip) => trip.status === 'optimized').slice(0, 3);
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

  const totalOriginal = meta.originalDistance || meta.totalDistance + meta.totalSavedKm;
  const efficiencyPercentage =
    totalOriginal > 0 ? ((meta.totalSavedKm / totalOriginal) * 100).toFixed(1) : 0;

  const isMi = distanceUnit === 'mi';
  const displaySavedDistance = isMi ? meta.totalSavedKm * 0.621371 : meta.totalSavedKm;
  const displaySavedUnit = isMi ? 'mi' : 'km';

  const sparklinePoints = [30, 45, 35, 60, 40, 75, meta.totalSavedKm > 0 ? 90 : 30];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] selection:bg-gray-200 font-sans animate-fade-in">
      <main className="max-w-[1040px] mx-auto px-6 pt-16 pb-32 flex flex-col space-y-10">
        
        {/* Upper Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-gray-100 border border-gray-200/80 px-2 py-0.5 rounded">
                Workspace
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold tracking-wider text-emerald-700 uppercase">Live</span>
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Planner'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/planner">
              <button className="h-10 px-4 bg-black text-white text-[13px] font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center gap-1.5 group">
                <Plus className="w-4 h-4" /> New Route
              </button>
            </Link>
            <Link to="/settings">
              <button className="h-10 px-4 bg-white border border-[#DDDDE3] text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <Settings className="w-4 h-4 text-gray-400" /> Settings
              </button>
            </Link>
          </div>
        </header>

        {/* Stripe-style Section Tabs */}
        <div className="border-b border-[#EAEAEA] pb-px">
          <nav className="flex space-x-6 text-[13px] font-semibold">
            <span className="border-b-2 border-black pb-3 text-black px-1 cursor-pointer">
              Overview
            </span>
            <Link to="/planner" className="text-gray-400 hover:text-gray-900 pb-3 px-1 transition-colors">
              Planner
            </Link>
            <Link to="/settings" className="text-gray-400 hover:text-gray-900 pb-3 px-1 transition-colors">
              Preferences
            </Link>
          </nav>
        </div>

        {/* Overview Stats Layout */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Distance Saved (Featured Card) */}
          <div className="md:col-span-2 bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_12px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-12 -mt-12 blur-3xl" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                  Carbon & Distance Saved
                </span>
                {meta.totalSavedKm > 0 && (
                  <span className="text-[10px] font-bold tracking-tight uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    +{efficiencyPercentage}% Efficient
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline mt-2">
                <span className="text-6xl sm:text-7xl font-bold tracking-tighter text-gray-900">
                  {displaySavedDistance.toFixed(0)}
                </span>
                <span className="text-xl font-medium text-gray-400 ml-2 tracking-tight">{displaySavedUnit}</span>
              </div>
              <p className="text-[13px] text-gray-500 font-medium mt-3 max-w-[380px]">
                Total distance eliminated from routes through optimal seed ordering and local 2-Opt search.
              </p>
            </div>

            {/* Micro sparkline visualization */}
            <div className="mt-8 flex items-end justify-between gap-2.5">
              <div className="flex items-end gap-1 h-12 w-full max-w-[280px]">
                {sparklinePoints.map((val, idx) => (
                  <div 
                    key={idx} 
                    className={`w-full rounded-sm transition-all duration-300 ${
                      idx === sparklinePoints.length - 1 
                        ? 'bg-emerald-500 h-full' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center text-[12px] font-semibold text-emerald-600">
                <TrendingDown className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                <span>Optimized Footprint</span>
              </div>
            </div>
          </div>

          {/* Card 2: Secondary Stats */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_12px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 block">
                Resources & Scope
              </span>
              
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-[#F4F4F5] pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-gray-400" />
                    <span className="text-[13px] font-medium text-gray-500 tracking-tight">Active Distance</span>
                  </div>
                  <span className="text-[16px] font-semibold tracking-tight text-gray-900">
                    {formatDistance(meta.totalDistance, distanceUnit)}
                  </span>
                </div>
                
                <div className="flex justify-between items-baseline border-b border-[#F4F4F5] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-[13px] font-medium text-gray-500 tracking-tight">Locations Solved</span>
                  </div>
                  <span className="text-[16px] font-semibold tracking-tight text-gray-900">
                    {meta.totalLocations.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pb-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-[13px] font-medium text-gray-500 tracking-tight">Fuel Telemetry</span>
                  </div>
                  <span className="text-[16px] font-bold tracking-tight text-[#166534]">
                    {formatCurrency(meta.estimatedFuelCost, preferredCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F4F4F5]">
              <Link 
                to="/planner" 
                className="text-[12px] font-semibold text-black hover:text-gray-600 transition-colors inline-flex items-center gap-1 group"
              >
                Go to Planner <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Ledger & Actions Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card A: Recent Routes Ledger (2 Cols) */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
              Recent Optimized Routes
            </h2>

            {!recentTrips || recentTrips.length === 0 ? (
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 flex flex-col items-center justify-center text-center flex-1 min-h-[220px] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900">No optimized routes</h3>
                <p className="text-[12px] text-gray-500 mt-1 max-w-[240px]">
                  Draft a route in the planner to compute the optimal matrix and sequence.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-[#EAEAEA] flex-1">
                {recentTrips.map((trip) => (
                  <Link 
                    key={trip._id} 
                    to={`/trip-details/${trip._id}`} 
                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200/60 group-hover:bg-white transition-colors">
                        <Compass className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-semibold text-gray-900 truncate tracking-tight group-hover:text-black">
                          {trip.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(trip.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] text-gray-400 font-medium">
                            {trip.locations?.length || 0} stops
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right hidden sm:block">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Savings
                        </span>
                        <span className="block text-[13px] font-semibold text-emerald-600 mt-0.5">
                          -{formatDistance(trip.analytics?.optimizationSavings || 0, distanceUnit)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {trip.enableCapacityConstraint && (
                          <span className="text-[9px] font-bold tracking-tight uppercase text-gray-500 bg-gray-50 border border-gray-200/80 px-1.5 py-0.5 rounded">
                            CVRP
                          </span>
                        )}
                        {trip.enableTimeWindows && (
                          <span className="text-[9px] font-bold tracking-tight uppercase text-gray-500 bg-gray-50 border border-gray-200/80 px-1.5 py-0.5 rounded">
                            VRPTW
                          </span>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Card B: Quick Actions Console (1 Col) */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
              Quick Console
            </h2>

            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex-1 min-h-[220px]">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5">
                  Vehicle Constraint Matrix
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                  Verify capacity scheduling and deliver window limits on stops instantly.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <Link to="/planner" className="block">
                  <button className="w-full h-9 px-4 bg-black text-white text-[12px] font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    Create Route <Plus className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <Link to="/settings" className="block">
                  <button className="w-full h-9 px-4 bg-white border border-[#DDDDE3] text-gray-700 text-[12px] font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center">
                    Workspace Preferences
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default Dashboard;