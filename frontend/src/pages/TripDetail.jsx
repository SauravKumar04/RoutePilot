// frontend/src/pages/TripDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { ArrowLeft, Share, Download, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';

// 1. Math Utility: Calculate distance between two coordinates
const calculateLegDistance = (loc1, loc2) => {
  if (!loc1?.coordinates || !loc2?.coordinates) return '--';
  const lat1 = loc1.coordinates.lat;
  const lon1 = loc1.coordinates.lng;
  const lat2 = loc2.coordinates.lat;
  const lon2 = loc2.coordinates.lng;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1.3; // 1.3 represents the average road curvature factor

  return distance.toFixed(1);
};

// 2. SVG Utility: Generate smooth continuous path
const generateSmoothPath = (numPoints) => {
  if (numPoints <= 1) return "M 0 50 L 100 50";
  let path = "M 0 50";
  const step = 100 / (numPoints - 1);
  for (let i = 0; i < numPoints - 1; i++) {
    const x1 = i * step;
    const x2 = (i + 1) * step;
    const y1 = i % 2 === 0 ? 50 : 35;
    const y2 = (i + 1) % 2 === 0 ? 50 : 35;
    path += ` C ${x1 + step / 2} ${y1}, ${x1 + step / 2} ${y2}, ${x2} ${y2}`;
  }
  return path;
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => axiosClient.get(`/trips/${id}`).then(res => res.data?.data || res.data)
  });

  if (isLoading) return <Loader fullScreen={false} />;
  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Route data unavailable.</div>;

  const locations = trip.locations || [];
  const numStops = locations.length;
  const pathString = generateSmoothPath(numStops);

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

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans pb-32 animate-fade-in print:pb-0">
      
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 print:pt-4">
        <div>
          <button 
            onClick={() => navigate('/planner')} 
            className="group flex items-center text-[13px] font-medium text-gray-400 hover:text-gray-900 mb-6 transition-colors print:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Planner
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            {trip.title}
          </h1>
          <p className="text-[13px] text-gray-500 font-medium">
            Generated {new Date(trip.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0 print:hidden">
          <button onClick={handleShare} className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center">
            <Share className="w-4 h-4 mr-2" strokeWidth={2} /> Share
          </button>
          <button onClick={handleExport} className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" strokeWidth={2} /> Export
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* Route Hero Section (Journey Rail) */}
        <section className="pt-16 pb-12 border-b border-gray-100">
          <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-16">
            <div className="flex items-center justify-between min-w-max w-full relative py-12">
              
              <div className="absolute left-[60px] right-[60px] h-[1px] bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
              <motion.div 
                className="absolute left-[60px] h-[1.5px] bg-gray-900 top-1/2 -translate-y-1/2 z-0 origin-left"
                initial={{ width: 0 }}
                animate={{ width: 'calc(100% - 120px)' }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />

              {locations.map((loc, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === numStops - 1;
                
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center justify-center min-w-[120px]">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                      className="absolute bottom-6 whitespace-nowrap text-[13px] font-semibold text-gray-900 tracking-tight"
                    >
                      {loc.name.split(',')[0]}
                    </motion.div>

                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + (idx * 0.1), duration: 0.4 }}
                      className="w-2 h-2 rounded-full bg-gray-900 ring-4 ring-white"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                      className="absolute top-6 whitespace-nowrap text-[10px] font-medium tracking-widest uppercase text-gray-400"
                    >
                      {isStart ? 'Origin' : isEnd ? 'Terminal' : `0${idx + 1}`}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <EditorialStat label="Total Distance" value={formatDistance(totalDistance)} />
            <EditorialStat label="Total Stops" value={numStops} />
            <EditorialStat label="Est. Fuel Cost" value={formatCurrency(trip.analytics?.estimatedFuelCost || 0)} />
            <EditorialStat label="Net Savings" value={`-${formatDistance(distanceSaved)}`} highlight />
          </div>
        </section>

        {/* Journey Timeline & Insights Split */}
        <section className="py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 border-b border-gray-100 print:block">
          
          {/* Left: Journey Timeline with Inline Leg Distances */}
          <div className="lg:col-span-7 relative print:mb-16">
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-12">Journey Itinerary</h2>
            
            <div className="space-y-0 relative">
              {/* Single Continuous Background Line */}
              <div className="absolute left-[3px] top-2 bottom-6 w-[1.5px] bg-gray-100 z-0" />

              {locations.map((loc, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === numStops - 1;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    key={idx} 
                    className="relative pl-10 pb-8"
                  >
                    {/* Node Anchor */}
                    <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-white z-10 ${isStart || isEnd ? 'bg-gray-900' : 'bg-gray-300'}`} />
                    
                    {/* Location Info */}
                    <p className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1.5">
                      {isStart ? 'Origin' : isEnd ? 'Destination' : `Stop 0${idx}`}
                    </p>
                    <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight leading-tight">{loc.name}</h3>
                    <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-sm">{loc.address}</p>

                    {/* 🚨 Leg Distance Indicator (Inline & Elegant) */}
                    {!isEnd && (
                      <div className="mt-6 mb-2 flex items-center">
                        <span className="inline-flex items-center text-[11px] font-mono font-medium text-gray-500 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200/60 shadow-sm relative z-10">
                          <ArrowDown className="w-3.5 h-3.5 mr-2 text-gray-400" strokeWidth={2} />
                          {calculateLegDistance(loc, locations[idx+1])} km
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Insights & Comparison */}
          <div className="lg:col-span-5 space-y-16">
            
            <div>
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-8">Optimization Metrics</h2>
              <div className="space-y-8">
                <EditorialStat label="Distance Eliminated" value={formatDistance(distanceSaved)} />
                <EditorialStat label="Original Baseline" value={formatDistance(originalDistance)} />
                <EditorialStat label="Algorithmic Efficiency" value={`${optimizationScore}%`} />
              </div>
            </div>

            <div className="print:hidden">
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">Path Reduction</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="w-16 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Original</span>
                  <div className="flex-1 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-300 w-full" />
                  </div>
                  <span className="w-16 text-right text-[12px] font-mono font-medium text-gray-400">{formatDistance(originalDistance)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-16 text-[10px] font-semibold text-gray-900 uppercase tracking-widest">Optimized</span>
                  <div className="flex-1 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      whileInView={{ width: `${100 - optimizationScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gray-900" 
                    />
                  </div>
                  <span className="w-16 text-right text-[12px] font-mono font-semibold text-gray-900">{formatDistance(totalDistance)}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-20">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-6">Executive Summary</h2>
          <p className="text-[15px] sm:text-[17px] leading-relaxed text-gray-600 max-w-2xl font-medium tracking-tight">
            By analyzing spatial coordinates and eliminating chronological routing overlaps, the engine has successfully compressed this itinerary. 
            The optimized sequence removes <span className="text-gray-900 font-semibold">{formatDistance(distanceSaved)}</span> of unnecessary travel distance, 
            directly reducing fuel expenditure while maintaining the requirement to visit all {numStops} localized waypoints.
          </p>
        </section>

      </main>
    </div>
  );
};

const EditorialStat = ({ label, value, highlight = false }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
      {label}
    </span>
    <span className={`text-2xl sm:text-3xl font-semibold tracking-tight ${highlight ? 'text-gray-900' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

export default TripDetail;