import { useState, useEffect, useRef } from 'react';

export const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '15', '30', '45']) {
      const val = `${String(h).padStart(2, '0')}:${m}`;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push({ value: val, label: `${hour12}:${m} ${ampm}` });
    }
  }
  return slots;
})();

export const formatTimeStr = (timeStr, fallback = 'Select') => {
  if (!timeStr) return fallback;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return fallback;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${mStr} ${ampm}`;
};

const TimeSelect = ({
  value,
  onChange,
  label = 'Select Time',
  align = 'left',
  variant = 'default',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const triggerClass =
    variant === 'ghost'
      ? `bg-transparent text-[11px] font-semibold text-gray-900 outline-none border-none p-0 cursor-pointer focus:ring-0 ${className}`
      : `px-3 py-1.5 bg-[#FAFAFA] border border-[#EAEAEA] text-[12px] font-semibold text-gray-900 rounded-lg outline-none hover:bg-gray-50 focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm ${className}`;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={triggerClass}>
        {formatTimeStr(value, label)}
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-32 max-h-48 overflow-y-auto bg-white border border-[#EAEAEA] rounded-lg shadow-lg z-50 divide-y divide-[#F4F4F5]`}
        >
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => { onChange(slot.value); setIsOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 hover:text-black transition-colors font-semibold"
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSelect;
