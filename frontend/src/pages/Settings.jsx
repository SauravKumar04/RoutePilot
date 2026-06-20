import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axiosClient from '../api/axiosClient';
import { useMutation } from '@tanstack/react-query';
import { useToastStore } from '../store/toastStore';
import { Globe, CreditCard, Fuel, Ruler, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar', region: 'United States' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', region: 'India' },
  { code: 'EUR', symbol: '€', label: 'Euro', region: 'Europe' },
  { code: 'GBP', symbol: '£', label: 'British Pound', region: 'United Kingdom' },
];

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-600" />
    </div>
    <div>
      <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">{title}</h2>
      {description && (
        <p className="text-[13px] text-gray-500 mt-0.5 font-medium">{description}</p>
      )}
    </div>
  </div>
);

const FieldLabel = ({ children, hint }) => (
  <div className="mb-3">
    <label className="block text-[13px] font-semibold text-gray-900 tracking-tight">{children}</label>
    {hint && <p className="text-[12px] text-gray-400 mt-0.5 font-medium leading-relaxed">{hint}</p>}
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    currency: 'USD',
    distanceUnit: 'km',
    fuelPrice: 1.5,
    averageFuelConsumption: 15,
  });

  useEffect(() => {
    if (user?.preferences) {
      setFormData({
        currency: user.preferences.currency || 'USD',
        distanceUnit: user.preferences.distanceUnit || 'km',
        fuelPrice: user.preferences.fuelPrice || 1.5,
        averageFuelConsumption: user.preferences.averageFuelConsumption || 15,
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (prefs) => axiosClient.put('/auth/preferences', prefs),
    onSuccess: (res) => {
      const updated = res.data?.user || res.data;
      if (updateUser) updateUser(updated);
      setSaved(true);
      addToast('Configuration saved successfully', 'success');
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => {
      addToast(err.message || 'Failed to update preferences', 'error');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'fuelPrice' || name === 'averageFuelConsumption'
        ? parseFloat(value) || ''
        : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      currency: formData.currency,
      distanceUnit: formData.distanceUnit,
      fuelPrice: Number(formData.fuelPrice),
      averageFuelConsumption: Number(formData.averageFuelConsumption),
    });
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === formData.currency) || CURRENCIES[0];
  const isKm = formData.distanceUnit === 'km';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
      <header className="max-w-[760px] mx-auto px-6 pt-16 pb-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2">Account</p>
          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-1">Preferences</h1>
          <p className="text-[14px] text-gray-500 font-medium">
            Configure localization, vehicle logistics, and financial telemetry baselines.
          </p>
        </motion.div>
      </header>

      <main className="max-w-[760px] mx-auto px-6">
        <form onSubmit={handleSubmit}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Regional */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <SectionHeader
                icon={Globe}
                title="Regional & Localization"
                description="Currency and measurement system for all analytics output."
              />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <FieldLabel hint="Used across all financial telemetry estimations.">Currency</FieldLabel>
                  <div className="space-y-2">
                    {CURRENCIES.map((c) => (
                      <label
                        key={c.code}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                          formData.currency === c.code
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-[#EAEAEA] text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[15px] font-bold w-5 text-center ${
                              formData.currency === c.code ? 'text-white' : 'text-gray-500'
                            }`}
                          >
                            {c.symbol}
                          </span>
                          <div>
                            <p className={`text-[13px] font-semibold ${formData.currency === c.code ? 'text-white' : 'text-gray-900'}`}>
                              {c.label}
                            </p>
                            <p className={`text-[11px] font-medium ${formData.currency === c.code ? 'text-gray-300' : 'text-gray-400'}`}>
                              {c.region}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="currency"
                          value={c.code}
                          checked={formData.currency === c.code}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {formData.currency === c.code && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel hint="Define the unit of distance used across all matrix outputs.">
                    Measurement System
                  </FieldLabel>
                  <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                    {[
                      { value: 'km', label: 'Kilometers', sub: 'km' },
                      { value: 'mi', label: 'Miles', sub: 'mi' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, distanceUnit: opt.value }))}
                        className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                          formData.distanceUnit === opt.value
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-900 border border-transparent'
                        }`}
                      >
                        <Ruler className="w-4 h-4" />
                        {opt.label}
                        <span className="text-[10px] font-medium text-gray-400">{opt.sub}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Preview
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] text-gray-500 font-medium">100 km</span>
                        <span className="text-[13px] font-semibold text-gray-900">
                          {isKm ? '100.0 km' : '62.1 mi'}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] text-gray-500 font-medium">500 km</span>
                        <span className="text-[13px] font-semibold text-gray-900">
                          {isKm ? '500.0 km' : '310.7 mi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <SectionHeader
                icon={CreditCard}
                title="Financial Logistics"
                description="Baseline parameters used to calculate fuel cost and route expenditure."
              />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <FieldLabel hint={`Average cost per liter/gallon used to calculate fuel expenditure.`}>
                    Baseline Fuel Price
                  </FieldLabel>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 pointer-events-none">
                      <span className="text-[14px] font-semibold text-gray-500">
                        {selectedCurrency.symbol}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name="fuelPrice"
                      value={formData.fuelPrice}
                      onChange={handleChange}
                      className="w-full pl-10 pr-14 py-3 bg-white border border-[#EAEAEA] rounded-xl text-[14px] text-gray-900 font-medium focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 shadow-sm transition-all tabular-nums"
                    />
                    <div className="absolute right-4 pointer-events-none">
                      <span className="text-[12px] font-medium text-gray-400">
                        / {isKm ? 'L' : 'Gal'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <Fuel className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      Estimated cost per 100{isKm ? 'km' : 'mi'}:{' '}
                      <strong className="text-gray-900">
                        {selectedCurrency.symbol}
                        {(
                          (Number(formData.fuelPrice) / Number(formData.averageFuelConsumption)) *
                          100
                        ).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel hint={`How far your vehicle travels per liter${isKm ? '' : '/gallon'}.`}>
                    Vehicle Efficiency
                  </FieldLabel>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      name="averageFuelConsumption"
                      value={formData.averageFuelConsumption}
                      onChange={handleChange}
                      className="w-full pl-4 pr-20 py-3 bg-white border border-[#EAEAEA] rounded-xl text-[14px] text-gray-900 font-medium focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 shadow-sm transition-all tabular-nums"
                    />
                    <div className="absolute right-4 pointer-events-none">
                      <span className="text-[12px] font-medium text-gray-400">
                        {isKm ? 'km / L' : 'MPG'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-[#FAFAFA] rounded-xl border border-[#EAEAEA]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Per route of 100km
                    </p>
                    <div className="flex justify-between">
                      <span className="text-[12px] text-gray-500">Fuel used</span>
                      <span className="text-[12px] font-semibold text-gray-900">
                        {(100 / (Number(formData.averageFuelConsumption) || 1)).toFixed(1)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 pb-8">
              <p className="text-[12px] text-gray-400 font-medium text-center sm:text-left">
                Changes apply to all future route optimizations.
              </p>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto h-10 px-7 bg-black text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 min-w-[120px]"
              >
                {mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Saved
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </motion.div>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default Settings;