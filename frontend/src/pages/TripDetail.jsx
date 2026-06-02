import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Share, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';

const calculateLegDistance = (loc1, loc2) => {
  if (!loc1?.coordinates || !loc2?.coordinates) return '--';

  const lat1 = loc1.coordinates.lat;
  const lon1 = loc1.coordinates.lng;
  const lat2 = loc2.coordinates.lat;
  const lon2 = loc2.coordinates.lng;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1.3;

  return distance.toFixed(1);
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const preferredCurrency = user?.preferences?.currency || 'USD';

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => axiosClient.get(`/trips/${id}`).then((res) => res.data?.data || res.data),
  });

  if (isLoading) return <Loader fullScreen={false} />;

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium bg-[#FAFAFA]">
        Route data unavailable or deleted.
      </div>
    );
  }

  const locations = trip.locations ? [...trip.locations] : [];
  if (trip.routeType === 'roundTrip' && locations.length > 1) {
    locations.push({ ...locations[0], isReturnLeg: true });
  }
  const numStops = locations.length;

  const totalDistance = trip.analytics?.totalDistance || 0;
  const originalDistance = trip.analytics?.originalDistance || 0;
  const distanceSaved = trip.analytics?.optimizationSavings || 0;
  const optimizationScore = originalDistance > 0 ? Math.round((distanceSaved / originalDistance) * 100) : 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: `Review the optimized route plan for ${trip.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-blue-100 font-sans pb-32 animate-fade-in print:pb-0 print:bg-white">
      <header className="max-w-[960px] mx-auto px-6 pt-16 pb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200/60 print:pt-4">
        <div>
          <button
            onClick={() => navigate('/planner')}
            className="group flex items-center text-[13px] font-semibold text-gray-400 hover:text-gray-900 mb-8 transition-colors print:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Return to Workspace
          </button>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="text-4xl sm:text-[42px] font-semibold tracking-tight text-gray-900 mb-3 leading-none"
          >
            {trip.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[14px] text-gray-500 font-medium tracking-tight"
          >
            Resolution generated on {new Date(trip.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </motion.p>
        </div>

        <div className="flex items-center gap-3 mt-8 md:mt-0 print:hidden">
          <button onClick={handleShare} className="h-10 px-4 bg-white border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center group">
            <Share className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100" /> Share
          </button>
          <button onClick={() => window.print()} className="h-10 px-4 bg-gray-900 border border-transparent rounded-xl text-[13px] font-semibold text-white hover:bg-gray-800 transition-all shadow-sm flex items-center group">
            <Download className="w-4 h-4 mr-2 opacity-80 group-hover:opacity-100" /> Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-6">
        <section className="pt-12 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <EditorialStat label="Total Distance" value={formatDistance(totalDistance)} />
            <EditorialStat label="Total Stops" value={trip.locations?.length || 0} />
            <EditorialStat label="Est. Fuel Cost" value={formatCurrency(trip.analytics?.estimatedFuelCost || 0, preferredCurrency)} />
            <EditorialStat label="Net Savings" value={`-${formatDistance(distanceSaved)}`} highlight />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 pb-20 print:block">
          <div className="lg:col-span-7 relative print:mb-16">
            <h2 className="text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-10">
              Chronological Itinerary
            </h2>

            <div className="relative">
              <div className="absolute left-[7px] top-3 bottom-8 w-[1px] bg-gradient-to-b from-gray-300 via-gray-200 to-transparent z-0" />

              {locations.map((loc, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === numStops - 1;
                const isReturn = loc.isReturnLeg;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-10%' }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    key={idx}
                    className="relative pl-10 pb-10 group"
                  >
                    <div className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full ring-[4px] ring-[#FAFAFA] z-10 flex items-center justify-center transition-transform group-hover:scale-110 ${isStart || isEnd ? 'bg-gray-900' : 'bg-gray-300'}`}>
                       {isStart || isEnd ? <div className="w-1.5 h-1.5 bg-white rounded-full"></div> : null}
                    </div>

                    <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5">
                      {isStart ? 'Origin Point' : isReturn ? 'Return to Origin' : isEnd ? 'Final Destination' : `Waypoint 0${idx}`}
                    </p>
                    <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight leading-snug">
                      {loc.name}
                    </h3>
                    <p className="text-[14px] text-gray-500 mt-1 leading-relaxed max-w-sm font-medium">
                      {loc.address}
                    </p>

                    {!isEnd && (
                      <div className="mt-5 mb-1 flex items-center relative">
                         <span className="inline-flex items-center text-[12px] font-mono font-medium text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative z-10 group-hover:border-gray-300 transition-colors">
                           {calculateLegDistance(loc, locations[idx + 1])} km
                         </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-16">
            <div className="print:hidden bg-white p-8 rounded-3xl ring-1 ring-gray-900/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <h2 className="text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-8">
                Optimization Delta
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-16 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Original
                  </span>
                  <div className="flex-1 h-[3px] bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gray-300 w-full" />
                  </div>
                  <span className="w-16 text-right text-[13px] font-mono font-medium text-gray-400">
                    {formatDistance(originalDistance)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-16 text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                    Optimized
                  </span>
                  <div className="flex-1 h-[3px] bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: '100%' }}
                      whileInView={{ width: `${100 - optimizationScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <span className="w-16 text-right text-[13px] font-mono font-bold text-emerald-600">
                    {formatDistance(totalDistance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl ring-1 ring-gray-900/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
               <h2 className="text-[12px] font-semibold tracking-widest uppercase text-gray-400 mb-6">
                Executive Brief
              </h2>
              <p className="text-[14px] leading-relaxed text-gray-600 font-medium tracking-tight">
                By processing spatial coordinate permutations and eliminating chronological overlaps, the routing engine successfully compressed this itinerary. 
                <br/><br/>
                The sequence removes <strong className="text-gray-900 font-semibold">{formatDistance(distanceSaved)}</strong> of unnecessary travel, reducing direct fuel expenditure while satisfying the requirement to visit all {trip.locations?.length || 0} localized waypoints.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const EditorialStat = ({ label, value, highlight = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`flex flex-col p-6 rounded-2xl bg-white border ${highlight ? 'border-emerald-200/60 shadow-[0_4px_12px_rgba(16,185,129,0.08)] bg-emerald-50/30' : 'border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'}`}
  >
    <span className={`text-[11px] font-semibold tracking-widest uppercase mb-3 ${highlight ? 'text-emerald-600' : 'text-gray-500'}`}>
      {label}
    </span>
    <span className={`text-[28px] sm:text-[32px] font-bold tracking-tight leading-none ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>
      {value}
    </span>
  </motion.div>
);

export default TripDetail;