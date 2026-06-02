// frontend/src/components/trip/TripSummary.jsx
import { formatDistance } from '../../utils/formatDistance';
import { formatCurrency } from '../../utils/formatCurrency';

const TripSummary = ({ analytics, status }) => {
  // Check if the trip has actually been run through the engine
  const isOptimized = analytics && status === 'optimized';

  return (
    <div className="bg-white rounded-2xl ring-1 ring-inset ring-gray-900/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        
        {/* Block 1: Total Route */}
        <div className="p-4 sm:p-5 flex flex-col justify-center hover:bg-gray-50/50 transition-colors">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
            Total Route
          </p>
          <p className="text-lg font-bold text-gray-900 tracking-tight truncate">
            {isOptimized ? formatDistance(analytics.totalDistance) : '--'}
          </p>
        </div>
        
        {/* Block 2: Fuel Expense */}
        <div className="p-4 sm:p-5 flex flex-col justify-center hover:bg-gray-50/50 transition-colors">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
            Fuel Cost
          </p>
          <p className="text-lg font-bold text-gray-900 tracking-tight truncate">
            {isOptimized ? formatCurrency(analytics.estimatedFuelCost) : '--'}
          </p>
        </div>
        
        {/* Block 3: Optimization Savings (Highlighted) */}
        <div className={`p-4 sm:p-5 flex flex-col justify-center relative transition-colors ${isOptimized ? 'bg-emerald-50/40' : 'bg-gray-50/30'}`}>
          
          {/* Subtle accent border - turns green only when optimized */}
          <div className={`absolute inset-y-0 left-0 w-0.5 sm:inset-x-0 sm:inset-y-auto sm:top-0 sm:w-full sm:h-0.5 hidden sm:block transition-colors ${isOptimized ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
          
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 truncate transition-colors ${isOptimized ? 'text-emerald-500' : 'text-gray-400'}`}>
            Distance Saved
          </p>
          <p className={`text-lg font-bold tracking-tight truncate transition-colors ${isOptimized ? 'text-emerald-600' : 'text-gray-400'}`}>
            {isOptimized ? `-${formatDistance(analytics.optimizationSavings)}` : '--'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default TripSummary;