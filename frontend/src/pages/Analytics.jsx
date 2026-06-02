import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DistanceChart from '../components/analytics/DistanceChart';
import FuelCostChart from '../components/analytics/FuelCostChart';
import Loader from '../components/common/Loader';
import { ArrowDownRight, Fuel, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDistance } from '../utils/formatDistance';
import { formatCurrency } from '../utils/formatCurrency';

const Analytics = () => {
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
        <p className="text-muted text-sm mt-1">
          Audit team routing operations, logistical margins, and carbon efficiency vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-surface border border-border rounded-xl shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Mileage Extinguished
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-0.5">
              {formatDistance(meta.totalSavedKm)}
            </p>
          </div>
        </div>

        <div className="p-5 bg-surface border border-border rounded-xl shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net Fuel Capital Retained
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-0.5">
              {formatCurrency(meta.netCapitalSaved)}
            </p>
          </div>
        </div>

        <div className="p-5 bg-surface border border-border rounded-xl shadow-subtle flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Algorithmic Efficiency Factor
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-0.5">
              {meta.efficiencyIndex}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistanceChart data={distanceData} />
        <FuelCostChart data={fuelData} />
      </div>
    </div>
  );
};

export default Analytics;