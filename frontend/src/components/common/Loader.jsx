import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

const Loader = ({ fullScreen = false, text = 'Loading' }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center"
    >
      <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-black/10" />
          <span className="absolute inset-0 rounded-full border-2 border-t-[#10B981] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>

        <div className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-black/70" />
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-black/55">
            {text}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex w-full items-center justify-center py-20">{content}</div>;
};

export default Loader;