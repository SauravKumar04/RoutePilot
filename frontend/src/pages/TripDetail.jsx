import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, 
  Share, 
  Download, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  DollarSign, 
  Compass 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/common/Loader';
import { useToastStore } from '../store/toastStore';

const calculateLegDistance = (loc1, loc2) => {
  if (!loc1?.coordinates || !loc2?.coordinates) return 0;
  const lat1 = loc1.coordinates.lat;
  const lon1 = loc1.coordinates.lng;
  const lat2 = loc2.coordinates.lat;
  const lon2 = loc2.coordinates.lng;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.3; 
};

const formatDuration = (totalSeconds) => {
  if (!totalSeconds) return '0m';
  const totalMinutes = Math.round(totalSeconds / 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const formatTo12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutesStr} ${ampm}`;
};

const PremiumStatCard = ({ label, value, icon: Icon, highlight = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col p-4 sm:p-5 rounded-2xl border ${
        highlight 
          ? 'bg-emerald-50/50 border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.02)]' 
          : 'bg-white border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase truncate ${highlight ? 'text-emerald-700' : 'text-gray-400'}`}>
          {label}
        </span>
        <div className={`p-1.5 rounded-lg border flex-shrink-0 ${highlight ? 'bg-emerald-100/50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <span className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-none break-all ${highlight ? 'text-emerald-800' : 'text-gray-900'}`}>
        {value}
      </span>
    </motion.div>
  );
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  
  const user = useAuthStore((state) => state.user);
  const preferredCurrency = user?.preferences?.currency || 'USD';
  const distanceUnit = user?.preferences?.distanceUnit || 'km';

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => axiosClient.get(`/trips/${id}`).then((res) => res.data?.data || res.data),
  });

  if (isLoading) return <Loader fullScreen={false} />;

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm font-medium bg-[#FAFAFA]">
        Route data unavailable or deleted.
      </div>
    );
  }

  const locations = trip.locations ? [...trip.locations] : [];
  if (trip.routeType === 'roundTrip' && locations.length > 1 && !trip.enableCapacityConstraint) {
    locations.push({ ...locations[0], isReturnLeg: true });
  }
  const enableCapacityConstraint = trip.enableCapacityConstraint || false;
  const enableTimeWindows = trip.enableTimeWindows || false;
  const numStops = locations.length;

  const totalDistance = trip.analytics?.totalDistance || 0;
  const originalDistance = trip.analytics?.originalDistance || 0;
  const distanceSaved = trip.analytics?.optimizationSavings || 0;
  const optimizationScore = originalDistance > 0 ? Math.round((distanceSaved / originalDistance) * 100) : 0;
  const totalShiftSeconds = trip.analytics?.totalDuration || 0; 
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: trip.title, text: `Review the optimized route plan for ${trip.title}`, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Report link copied to clipboard!', 'success');
    }
  };

  const handleOpenNavigation = () => {
    if (!locations || locations.length < 2) return;
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1);
    let url = `https://www.google.com/maps/dir/?api=1&travelmode=driving`;
    url += `&origin=${origin.coordinates.lat},${origin.coordinates.lng}`;
    url += `&destination=${destination.coordinates.lat},${destination.coordinates.lng}`;
    if (waypoints.length > 0) {
      const waypointsStr = waypoints.map((wp) => `${wp.coordinates.lat},${wp.coordinates.lng}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }
    window.open(url, '_blank');
  };

  const formattedDate = new Date(trip.updatedAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-gray-200/60 font-sans pb-24 antialiased overflow-x-hidden print:bg-white print:pb-0 animate-fade-in">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/75 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center text-[12px] font-semibold text-gray-400 hover:text-gray-900 transition-colors w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
              Workspace
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 truncate max-w-[300px] sm:max-w-[400px] lg:max-w-[600px]">
                {trip.title}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 whitespace-nowrap tracking-wide uppercase">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Optimized
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:flex md:items-center md:gap-2.5 md:w-auto">
            <button onClick={handleShare} className="inline-flex items-center justify-center h-9 px-2 sm:px-4 bg-white border border-gray-200/75 rounded-lg text-[11px] sm:text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98]">
              <Share className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" /> Share
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center justify-center h-9 px-2 sm:px-4 bg-white border border-gray-200/75 rounded-lg text-[11px] sm:text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98]">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" /> Export
            </button>
            <button onClick={handleOpenNavigation} className="inline-flex items-center justify-center h-9 px-2 sm:px-4 bg-black border border-transparent rounded-lg text-[11px] sm:text-[13px] font-bold text-white hover:bg-gray-800 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.12)] active:scale-[0.98]">
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-300" /> Navigate
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden print:block pt-8 pb-6 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{trip.title}</h1>
          <p className="text-sm text-gray-500">Optimized Route Plan • Generated {formattedDate}</p>
        </div>

        <section className="pt-8 md:pt-10 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumStatCard label="Total Shift" value={formatDuration(totalShiftSeconds)} icon={Clock} />
            <PremiumStatCard label="Total Stops" value={trip.locations?.length || 0} icon={Compass} />
            <PremiumStatCard label="Est. Fuel" value={formatCurrency(trip.analytics?.estimatedFuelCost || 0, preferredCurrency)} icon={DollarSign} />
            <PremiumStatCard label="Distance Saved" value={`-${formatDistance(distanceSaved, distanceUnit)}`} icon={Zap} highlight />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-12 print:block">
          
          {/* Timeline block */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] print:border-none print:shadow-none print:p-0">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-8">
              Chronological Itinerary
            </h2>

            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-6 w-px bg-gray-200 z-0" />

              {locations.map((loc, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === numStops - 1;
                const isReturn = loc.isReturnLeg;
                const isDepotReload = loc.isStartNode && idx > 0 && idx < numStops - 1;
                const stopServiceMins = loc.serviceTime || 0;
                let legDist = 0;
                
                if (!isEnd) {
                  legDist = calculateLegDistance(loc, locations[idx + 1]);
                }

                let nodeLabel = `Waypoint ${String(idx).padStart(2, '0')}`;
                if (isStart) {
                  nodeLabel = 'Origin';
                } else if (isDepotReload) {
                  nodeLabel = 'Depot Reload / Return';
                } else if (isReturn) {
                  nodeLabel = 'Return';
                } else if (isEnd) {
                  nodeLabel = 'Destination';
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.5) }}
                    key={idx}
                    className="relative pl-10 pb-8 group last:pb-0"
                  >
                    <div className={`absolute left-[5px] top-1.5 w-3 h-3 rounded-full ring-[5px] ring-white z-10 transition-colors duration-300 ${isStart || isEnd || isDepotReload ? 'bg-black' : 'bg-gray-300 group-hover:bg-gray-400'}`}>
                       {(isStart || isEnd || isDepotReload) && <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full"></div>}
                    </div>

                    <div className="pr-2 md:pr-0">
                      <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                        {nodeLabel}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                          {loc.name}
                        </h3>
                        {!isStart && !isReturn && !isDepotReload && stopServiceMins > 0 && (
                          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border border-gray-200 bg-[#FAFAFA] text-gray-600 w-fit">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" /> {stopServiceMins} min
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[13px] text-gray-500 leading-relaxed max-w-sm">
                        {loc.address}
                      </p>

                      {/* Schedule details */}
                      {enableTimeWindows && (loc.arrivalTime || loc.departureTime) && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {loc.arrivalTime && (
                            <span className="inline-flex items-center text-[11px] font-medium text-gray-500">
                              Arrive: <strong className="ml-1 text-gray-800 font-semibold">{formatTo12Hour(loc.arrivalTime)}</strong>
                            </span>
                          )}
                          {loc.arrivalTime && loc.departureTime && (
                            <span className="text-[10px] text-gray-300">•</span>
                          )}
                          {loc.departureTime && (
                            <span className="inline-flex items-center text-[11px] font-medium text-gray-500">
                              Depart: <strong className="ml-1 text-gray-800 font-semibold">{formatTo12Hour(loc.departureTime)}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Logistical constraint specs */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {enableCapacityConstraint && idx !== 0 && !loc.isStartNode && (Number(loc.demand) > 0) && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded">
                            Demand: {loc.demand} units
                          </span>
                        )}
                        {enableTimeWindows && idx !== 0 && !loc.isStartNode && (loc.timeWindowStart || loc.timeWindowEnd) && (
                          <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200/50 rounded px-2 py-0.5">
                            Window: {loc.timeWindowStart ? formatTo12Hour(loc.timeWindowStart) : 'Anytime'} – {loc.timeWindowEnd ? formatTo12Hour(loc.timeWindowEnd) : 'Anytime'}
                          </span>
                        )}
                        {loc.timeWindowViolated && loc.timeWindowEnd && (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded tracking-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
                            Late (Closed {formatTo12Hour(loc.timeWindowEnd)})
                          </span>
                        )}
                      </div>

                      {!isEnd && (
                        <div className="mt-5 mb-2 flex items-center relative">
                           <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-white px-2.5 py-0.5 rounded border border-[#EAEAEA] shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative z-10 hover:border-gray-300 transition-colors cursor-default">
                             {legDist.toFixed(1)} km
                           </span>
                           <div className="absolute left-[-28px] top-1/2 w-5 border-t border-dashed border-gray-200 -z-10" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right column optimization feedback */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Optimization Delta widget */}
            <div className="print:hidden bg-white p-6 sm:p-8 rounded-2xl border border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-6">
                Optimization Delta
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-end justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Original Route
                    </span>
                    <span className="text-[13px] font-semibold text-gray-500">
                      {formatDistance(originalDistance, distanceUnit)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gray-200 w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex items-end justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                      Optimized Route
                    </span>
                    <span className="text-[13px] font-semibold text-emerald-600">
                      {formatDistance(totalDistance, distanceUnit)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: '100%' }}
                      whileInView={{ width: `${100 - optimizationScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Executive brief */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EAEAEA] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-6">
                Executive Brief
              </h2>
              
              <div className="space-y-6">
                <p className="text-[13px] leading-relaxed text-gray-600 font-medium">
                  The routing engine eliminated overlapping paths to compress your itinerary, successfully reducing total travel distance by <strong className="text-gray-900 font-semibold">{optimizationScore}%</strong>.
                </p>

                <div className="bg-[#FAFAFA] rounded-xl p-4 grid grid-cols-2 gap-4 border border-[#EAEAEA]">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Before</span>
                    <span className="text-[13px] font-semibold text-gray-600">{formatDistance(originalDistance, distanceUnit)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">After</span>
                    <span className="text-[13px] font-semibold text-emerald-600">{formatDistance(totalDistance, distanceUnit)}</span>
                  </div>
                </div>

                <p className="text-[13px] leading-relaxed text-gray-600 font-medium">
                  Your final shift duration of <strong className="text-gray-900 font-semibold">{formatDuration(totalShiftSeconds)}</strong> seamlessly incorporates pure drive time plus {numStops - 1} required service stops.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default TripDetail;