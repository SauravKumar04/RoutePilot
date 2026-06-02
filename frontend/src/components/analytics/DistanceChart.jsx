import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DistanceChart = ({ data }) => {
  return (
    <div className="w-full h-72 bg-white p-5 rounded-2xl border border-gray-100">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900">Distance trend</h4>
        <p className="text-xs text-gray-500">Original route versus optimized route.</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUnoptimized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#111827" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#111827" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="trip" stroke="#9CA3AF" fontSize={11} tickLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            name="Original"
            dataKey="original"
            stroke="#9CA3AF"
            fillOpacity={1}
            fill="url(#colorUnoptimized)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            name="Optimized"
            dataKey="optimized"
            stroke="#111827"
            fillOpacity={1}
            fill="url(#colorOptimized)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistanceChart;