import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  icon: Icon = AlertTriangle,
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[#111]/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_16px_64px_rgba(0,0,0,0.08)] border border-[#EAEAEA] p-6 overflow-hidden"
          >
            <div className="flex flex-col">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-5 ${
                  isDestructive ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-[17px] font-semibold tracking-tight text-gray-900">
                {title}
              </h3>
              <p className="text-[14px] text-gray-500 font-medium mt-2 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-[#EAEAEA] text-[13px] font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-[13px] font-medium text-white rounded-xl transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] ${
                  isDestructive ? 'bg-[#E11D48] hover:bg-[#BE123C]' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;