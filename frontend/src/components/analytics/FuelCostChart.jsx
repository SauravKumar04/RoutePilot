import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const FuelCostChart = ({ data }) => {
  return (
    <div className="w-full h-72 bg-white p-5 rounded-2xl border border-gray-100">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900">Fuel trend</h4>
        <p className="text-xs text-gray-500">Fuel spend versus fuel saved across routes.</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="trip" stroke="#9CA3AF" fontSize={11} tickLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar name="Fuel spent" dataKey="fuelSpent" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar
            name="Fuel saved"
            dataKey="fuelSaved"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FuelCostChart;