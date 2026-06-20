import { useToastStore } from '../../store/toastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-2 pointer-events-none w-full max-w-[280px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            layout
            className="w-full bg-white border border-gray-200/80 shadow-[0_8px_20px_rgba(0,0,0,0.06)] rounded-lg p-2.5 px-3 flex items-center justify-between gap-2.5 text-[12px] text-gray-900 font-medium pointer-events-auto"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon(toast.type)}
              <span className="truncate pr-1 leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
