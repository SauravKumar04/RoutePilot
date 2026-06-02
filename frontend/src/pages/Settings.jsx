import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axiosClient from '../api/axiosClient';
import { CheckCircle, Globe, Gauge, Coins, MapPin, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getCurrencySymbol = (currencyCode) => {
  try {
    return (0)
      .toLocaleString(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, '')
      .trim();
  } catch (e) {
    return currencyCode;
  }
};

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currency: user?.preferences?.currency || 'USD',
    distanceUnit: user?.preferences?.distanceUnit || 'km',
    fuelPrice: user?.preferences?.fuelPrice || 1.5,
    averageFuelConsumption: user?.preferences?.averageFuelConsumption || 15,
  });

  const currencySymbol = getCurrencySymbol(formData.currency);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanData = {
      ...formData,
      fuelPrice: parseFloat(formData.fuelPrice) || 1.5,
      averageFuelConsumption: parseFloat(formData.averageFuelConsumption) || 15,
    };

    try {
      const res = await axiosClient.put('/auth/preferences', cleanData);

      updateUser({ preferences: res.data.preferences });
      setFormData(cleanData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings. Check your server console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans pb-32 animate-fade-in">
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-8 border-b border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-2">
          System Preferences
        </h1>
        <p className="text-[14px] text-gray-500 font-medium">
          Configure baseline logistics, local currencies, and global optimization constraints.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-4">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-4">
              <div className="flex items-center mb-2">
                <Globe className="w-4 h-4 mr-2 text-gray-900" strokeWidth={2} />
                <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                  Localization
                </h3>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed pr-4">
                Define the primary currency for cost calculations and the metric system
                used for geographical distancing.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2.5">
                  Currency Code
                </label>
                <div className="relative group">
                  <Coins className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-900 uppercase focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-2">
                  Standard 3-letter ISO (e.g., USD, INR)
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2.5">
                  Default Metric Unit
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => setFormData({ ...formData, distanceUnit: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-900 appearance-none focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-4">
              <div className="flex items-center mb-2">
                <Gauge className="w-4 h-4 mr-2 text-gray-900" strokeWidth={2} />
                <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                  Fleet Mechanics
                </h3>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed pr-4">
                Set baseline fuel costs and average vehicle consumption. These values drive
                the financial optimization metrics.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2.5">
                  Average Fuel Price
                </label>
                <div className="relative flex items-center group">
                  <span className="absolute left-4 font-semibold text-gray-400 text-[13px] group-focus-within:text-gray-900 transition-colors">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fuelPrice}
                    onChange={(e) => setFormData({ ...formData, fuelPrice: e.target.value })}
                    className="w-full pl-8 pr-16 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 outline-none transition-all shadow-sm"
                  />
                  <span className="absolute right-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase border-l border-gray-200/80 pl-3">
                    / Ltr
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2.5">
                  Vehicle Efficiency
                </label>
                <div className="relative flex items-center group">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.averageFuelConsumption}
                    onChange={(e) =>
                      setFormData({ ...formData, averageFuelConsumption: e.target.value })
                    }
                    className="w-full pl-4 pr-20 py-2.5 bg-gray-50/50 border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900 outline-none transition-all shadow-sm"
                  />
                  <span className="absolute right-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase border-l border-gray-200/80 pl-3">
                    {formData.distanceUnit} / L
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full sm:w-auto order-2 sm:order-1">
              <AnimatePresence>
                {showSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-[13px] text-emerald-700 flex items-center font-medium bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100 w-max"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" strokeWidth={2.5} />
                    Preferences successfully synchronized
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium order-1 sm:order-2 transition-colors shadow-sm"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" strokeWidth={2} /> Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Settings;