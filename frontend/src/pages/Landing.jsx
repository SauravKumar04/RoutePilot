import { Link } from 'react-router-dom';
import { 
  Route, 
  Zap, 
  LineChart, 
  ChevronRight, 
  MapPin, 
  ArrowRight,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Landing = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-gray-200 overflow-hidden">
      
      <nav className="fixed top-0 left-0 right-0 bg-[#FAFAFA]/80 backdrop-blur-md z-50 border-b border-[#EAEAEA]">
        <div className="flex items-center justify-between px-6 py-4 max-w-[1100px] mx-auto">
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="flex items-center justify-center w-7 h-7 bg-gray-900 rounded-md mr-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:bg-gray-800 transition-colors">
              <MapIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
              RoutePilot AI
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <Link to="/dashboard" className="text-[13px] font-medium px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex items-center">
                Workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-[13px] font-medium px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-32">
        <div className="absolute inset-0 -z-10 h-[900px] w-full bg-[#FAFAFA] bg-[linear-gradient(to_right,#EAEAEA_1px,transparent_1px),linear-gradient(to_bottom,#EAEAEA_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

        <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <div className="flex flex-col items-start text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center rounded-full border border-[#EAEAEA] bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600 mb-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-gray-900 mr-2.5"></span>
              Intelligent route sequencing
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-[64px] font-bold tracking-tighter text-gray-900 mb-6 leading-[1.05]"
            >
              Logistics infrastructure for the modern web.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-[17px] md:text-[19px] text-gray-500 max-w-lg mb-10 font-medium leading-relaxed tracking-tight"
            >
              Input your geographical nodes. Our computational engine instantly parses thousands of permutations to generate the absolute mathematical minimum path.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4"
            >
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full h-12 px-8 bg-black text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center group">
                    Open Workspace
                    <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
              ) : (
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full h-12 px-8 bg-black text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center group">
                    Start Planning
                    <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
              )}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>
            
            <DotLottieReact
              src="https://lottie.host/11912b4c-76f8-43f1-b84b-fd611d5918eb/gv1R8IIhta.lottie"
              loop
              autoplay
              className="w-full h-full relative z-10"
            />
          </motion.div>

        </div>

        <div className="border-y border-[#EAEAEA] bg-white py-8">
          <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12">
            <span className="text-[12px] font-semibold tracking-widest text-gray-400 uppercase">Powered By</span>
            <div className="flex items-center space-x-8 opacity-60 grayscale">
              <span className="text-[15px] font-bold text-gray-800 tracking-tighter">OpenStreetMap</span>
              <span className="text-[15px] font-bold text-gray-800 tracking-tighter">OSRM Engine</span>
              <span className="text-[15px] font-bold text-gray-800 tracking-tighter">Leaflet.js</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-32">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              A complete routing toolkit.
            </h2>
            <p className="text-[16px] text-gray-500 font-medium max-w-xl leading-relaxed">
              Everything you need to orchestrate logistics, from geocoding to financial telemetry, built into a single, high-performance interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center mb-8 border border-[#EAEAEA]">
                <Route className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">Algorithmic Efficiency</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed font-medium max-w-md">
                  Our modified TSP engine parses complex spatial matrices locally, utilizing Nearest Neighbor and 2-Opt heuristics to compute flawless execution sequences in milliseconds.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center mb-8 border border-[#EAEAEA]">
                <Zap className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">Dynamic Re-routing</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                  Mutate your active matrix on the fly. The engine recompiles optimal paths instantly without page reloads.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center mb-8 border border-[#EAEAEA]">
                <MapPin className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">Precision Geocoding</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                  Convert unstructured text addresses into exact latitude and longitude coordinates seamlessly.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center mb-8 border border-[#EAEAEA]">
                <LineChart className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">Financial Telemetry</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed font-medium max-w-md">
                  Monitor exact fuel expenditure, distance compression, and timeline savings through highly accurate, user-localized financial logs and metric dashboards.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        <div className="bg-white border-t border-[#EAEAEA] py-24">
          <div className="max-w-[1100px] mx-auto px-6 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">
              Start optimizing today.
            </h2>
            <p className="text-[16px] text-gray-500 font-medium max-w-lg mb-10">
              Build your first routing matrix for free. No credit card required.
            </p>
            <Link to="/register">
              <button className="h-12 px-8 bg-black text-white text-[14px] font-medium rounded-xl hover:bg-gray-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center">
                Create Account <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
              </button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#FAFAFA] border-t border-[#EAEAEA] py-8">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <MapIcon className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
            <span className="text-[13px] font-bold tracking-tight text-gray-900">RoutePilot AI</span>
            <span className="text-[13px] text-gray-400 font-medium ml-2 hidden md:inline">
              © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link to="/dashboard" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Workspace
            </Link>
            <Link to="/planner" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Planner
            </Link>
            <div className="flex items-center space-x-2 md:pl-4 md:border-l border-[#EAEAEA]">
               <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
               <span className="text-[11px] font-medium text-gray-500">All systems operational</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;