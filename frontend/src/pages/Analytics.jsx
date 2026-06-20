import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DistanceChart from '../components/analytics/DistanceChart';
import FuelCostChart from '../components/analytics/FuelCostChart';
import Loader from '../components/common/Loader';
import { ArrowDownRight, Fuel, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuthStore } from '../store/authStore';

const Analytics = () => {
  const user = useAuthStore((state) => state.user);
  const distanceUnit = user?.preferences?.distanceUnit || 'km';
  const { data: analyticsPayload, isLoading, isError } = useQuery({
    queryKey: ['routeAnalytics'],
    queryFn: () => axiosClient.get('/analytics/summary'),
  });

  if (isLoading) return <Loader fullScreen={false} />;

  if (isError || !analyticsPayload || !analyticsPayload.data || !analyticsPayload.data.meta) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">No Analytics Data Available</h2>
        <p className="text-muted text-sm mt-2 max-w-md">
          Your dashboard is empty. Go to the Trip Planner and optimize a route to generate your
          first set of performance metrics.
        </p>
      </div>
    );
  }

  const { distanceData, fuelData, meta } = analyticsPayload.data;

  return (
    <div className="max-w-[1040px] mx-auto pt-8 pb-24 flex flex-col space-y-12 animate-fade-in">
      <header>
        <h1 className="text-[12px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
          Operations Telemetry
        </h1>
        <h2 className="text-3xl sm:text-[32px] font-semibold tracking-tight text-gray-900 leading-tight">
          System Analytics
        </h2>
        <p className="text-[14px] text-[#666] mt-2 font-medium">
          Audit team routing operations, logistical margins, and carbon efficiency vectors.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Mileage Extinguished
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatDistance(meta.totalSavedKm, distanceUnit)}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Fuel Capital Retained
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(meta.netCapitalSaved)}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#EAEAEA] rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_0_rgba(0,0,0,0.06)] flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Efficiency Factor
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {meta.efficiencyIndex}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DistanceChart data={distanceData} />
        <FuelCostChart data={fuelData} />
      </div>
    </div>
  );
};

export default Analytics;