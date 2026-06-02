const StatsCard = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="bg-surface p-6 rounded-xl border border-border shadow-subtle flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
          {Icon ? <Icon className="w-5 h-5" /> : null}
        </div>
      </div>

      <div>
        <span className="text-3xl font-semibold tracking-tight text-gray-900">
          {value}
        </span>
      </div>

      {subtext && (
        <div className="mt-2 flex items-center text-sm">
          <span className={trend === 'up' ? 'text-green-600 font-medium' : 'text-gray-500'}>
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;