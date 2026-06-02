// frontend/src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Map as MapIcon, Route, Zap, LineChart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const Landing = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="bg-gray-900 p-1.5 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <MapIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">RoutePilot AI</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <Link to="/dashboard" className="text-[13px] font-medium px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="text-[13px] font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                  Start Building
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Architecture */}
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-24 flex flex-col items-center text-center relative">
        
        {/* Subtle Background Grid (Stripe-inspired) */}
        <div className="absolute inset-0 -z-10 h-[100vh] w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center rounded-full border border-gray-200/80 bg-gray-50/50 px-3 py-1 text-[12px] font-medium text-gray-600 mb-8 tracking-wide"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          RoutePilot Engine v2.0 is now live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-6xl sm:text-7xl md:text-[88px] font-semibold tracking-tighter text-gray-900 mb-6 max-w-5xl mx-auto leading-[1.05]"
        >
          Logistics, <span className="text-gray-400">perfected.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed tracking-tight"
        >
          Input your geographical nodes, and our computational engine instantly generates the most mathematically efficient execution sequence.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          {user ? (
            <Link to="/dashboard">
              <button className="h-12 px-8 bg-gray-900 text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center group">
                Enter Workspace
                <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
              </button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <button className="h-12 px-6 bg-gray-900 text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center group">
                  Start planning for free
                  <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
                </button>
              </Link>
              <Link to="/login">
                <button className="h-12 px-6 bg-white text-gray-900 text-[14px] font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                  View documentation
                </button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Feature Layout */}
        <div className="mt-40 w-full grid grid-cols-1 md:grid-cols-3 gap-y-16 md:gap-x-12 text-left border-t border-gray-100 pt-20 relative">
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mb-6">
              <Route className="w-4 h-4 text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-2 tracking-tight">Algorithmic Efficiency</h3>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Our advanced TSP engine parses thousands of spatial permutations locally to compute the flawless operational route in milliseconds.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mb-6">
              <Zap className="w-4 h-4 text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-2 tracking-tight">Dynamic Re-routing</h3>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Seamlessly mutate your active matrix. Add, remove, or drag nodes on the fly while the engine recompiles the optimal path instantly.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mb-6">
              <LineChart className="w-4 h-4 text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-2 tracking-tight">Financial Telemetry</h3>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
              Monitor exact fuel expenditure, distance compression, and timeline savings through highly accurate, exportable financial logs.
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Landing;