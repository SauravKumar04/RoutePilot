import { Link } from 'react-router-dom';
import {
  Route,
  LineChart,
  ArrowRight,
  Map as MapIcon,
  Package,
  Clock,
  BarChart3,
  Navigation,
  FileDown,
  LocateFixed,
  ShieldCheck,
  Zap,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const FEATURES = [
  {
    icon: Route,
    title: 'TSP Route Optimization',
    desc: 'Nearest Neighbor seeding + 2-Opt local search computes the shortest-distance visit order across all stops in milliseconds.',
    badge: 'Core Engine',
    span: 'md:col-span-2',
  },
  {
    icon: Package,
    title: 'Capacity Constraints',
    desc: 'Set per-stop demand units and vehicle load limits. Solver auto-partitions stops into depot-returning sub-routes when capacity is exceeded.',
    badge: 'CVRP',
    span: '',
  },
  {
    icon: Clock,
    title: 'Time Window Scheduling',
    desc: 'Assign delivery windows per stop. The engine simulates real arrival clocks, respects wait times, and flags late violations in red.',
    badge: 'VRPTW',
    span: '',
  },
  {
    icon: LineChart,
    title: 'Fuel & Cost Telemetry',
    desc: 'Original vs optimized distance compared on every run. Fuel expenditure calculated live from your vehicle efficiency and fuel price.',
    badge: 'Analytics',
    span: 'md:col-span-2',
  },
  {
    icon: BarChart3,
    title: 'Operations Dashboard',
    desc: 'Interactive distance and fuel charts across all routes. Track cumulative km saved, efficiency index, and fuel capital retained.',
    badge: 'Dashboard',
    span: '',
  },
  {
    icon: Navigation,
    title: 'Live Map & Navigation',
    desc: 'Routes drawn on an interactive Leaflet map with real OSRM driving geometry. One tap exports waypoints to Google Maps.',
    badge: 'Map',
    span: '',
  },
  {
    icon: FileDown,
    title: 'CSV Export',
    desc: 'Export full itinerary — name, address, coordinates, service time, demand, and time windows — as a structured CSV file instantly.',
    badge: 'Export',
    span: '',
  },
  {
    icon: LocateFixed,
    title: 'GPS Address Resolution',
    desc: 'Add your current location as a stop with one tap. Reverse-geocoding via OpenStreetMap resolves coordinates to a readable address.',
    badge: 'Geocoding',
    span: '',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Auth & Persistence',
    desc: 'Every route, constraint, and analytics datapoint is saved to your account via JWT auth. History always available and searchable.',
    badge: 'Security',
    span: '',
  },
];

const STATS = [
  { value: '2-Opt', label: 'Optimization algorithm' },
  { value: 'OSRM', label: 'Real driving distances' },
  { value: 'CVRP', label: 'Capacity routing model' },
  { value: 'VRPTW', label: 'Time window scheduling' },
];

const STEPS = [
  {
    num: '01',
    icon: MapPin,
    title: 'Add your stops',
    desc: 'Type any address or use GPS. Set service times, load demand, and time windows per stop. Toggle capacity or time window constraints.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'Optimize in one click',
    desc: 'Hit Optimize Route. The engine runs Nearest Neighbor + 2-Opt (or CVRP) against a real OSRM distance matrix and returns the best sequence.',
  },
  {
    num: '03',
    icon: Navigation,
    title: 'Review & navigate',
    desc: 'View the optimized route on an interactive map, read the full timetable, check savings, then export to CSV or open in Google Maps.',
  },
];

const WordReveal = ({ text, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ x: -48, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, badge, span, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-4%' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.055, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`${span} group bg-white rounded-2xl p-7 border border-[#EAEAEA] shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] hover:border-gray-300 transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-10 h-10 bg-[#F4F4F5] rounded-xl flex items-center justify-center border border-[#E8E8E8] group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
          <Icon className="w-[18px] h-[18px] text-gray-600 group-hover:text-white transition-colors duration-300" strokeWidth={1.75} />
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-[#F4F4F5] border border-[#E8E8E8] px-2 py-0.5 rounded-md">
          {badge}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed font-medium flex-1">{desc}</p>
    </motion.div>
  );
};

const StepCard = ({ step, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5%' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-white border border-[#EAEAEA] rounded-2xl p-7 flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-white" strokeWidth={1.75} />
        </div>
        <span className="text-[32px] font-bold tracking-tighter text-[#F0F0F0] select-none leading-none">
          {step.num}
        </span>
      </div>
      <h3 className="text-[16px] font-semibold text-gray-900 mb-2.5 tracking-tight">{step.title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
    </motion.div>
  );
};

const BigTextLine = ({ text, from = 'left', delay = 0, muted = false, outline = false, dark = false }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate the horizontal movement based on scroll progress
  // Left-to-right means moving from a negative offset (left) to a positive offset (right)
  // Right-to-left means moving from a positive offset to a negative offset
  const x = useTransform(scrollYProgress, [0, 1], from === 'left' ? [-120, 120] : [120, -120]);
  const inView = useInView(ref, { once: true, margin: '-5%' });

  let textClass = '';
  if (dark) {
    textClass = muted
      ? 'text-gray-800'
      : outline
      ? 'text-transparent'
      : 'text-white';
  } else {
    textClass = muted
      ? 'text-gray-200'
      : outline
      ? 'text-transparent'
      : 'text-gray-900';
  }

  const strokeColor = dark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.25)';

  return (
    <div ref={ref} className="w-full overflow-visible py-1">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ x }}
        className="will-change-transform"
      >
        <span
          className={`block font-black uppercase tracking-[-0.04em] leading-[0.85] whitespace-nowrap ${textClass}`}
          style={{
            fontSize: 'clamp(54px, 12.5vw, 175px)',
            WebkitTextStroke: outline ? `1.5px ${strokeColor}` : 'none',
          }}
        >
          {text}
        </span>
      </motion.div>
    </div>
  );
};

const HeroTextLine = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={inView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
};

const Landing = () => {
  const user = useAuthStore((state) => state.user);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-10%' });
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-gray-200 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FAFAFA]/80 backdrop-blur-md z-50 border-b border-[#EAEAEA]">
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-[1100px] mx-auto">
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="flex items-center justify-center w-7 h-7 bg-gray-900 rounded-md mr-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)] group-hover:bg-gray-700 transition-colors">
              <MapIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
              RoutePilot
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-5">
            {user ? (
              <Link
                to="/dashboard"
                className="text-[13px] font-semibold px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex items-center gap-1.5"
              >
                Dashboard <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-[13px] font-semibold px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#FAFAFA]"
        >
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#EAEAEA_1px,transparent_1px),linear-gradient(to_bottom,#EAEAEA_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-50" />

          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-28 pb-24 w-full"
          >
            <div className="w-full">
              <div className="mb-10 sm:mb-14 overflow-visible select-none">
                <BigTextLine text="ROUTE" from="left" delay={0} />
                <BigTextLine text="SMARTER." from="right" delay={0.1} outline />
                <BigTextLine text="SAVE" from="left" delay={0.2} />
                <BigTextLine text="MORE." from="right" delay={0.3} outline />
              </div>

              <div className="max-w-[540px]">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[17px] sm:text-[19px] text-gray-500 mb-10 font-medium leading-relaxed"
                >
                  Solve complex vehicle routing problems instantly — with real-time capacity limits, delivery time windows, fuel telemetry, and live map visualization.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {user ? (
                    <Link to="/dashboard">
                      <button className="h-12 px-7 bg-black text-white text-[14px] font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98] flex items-center justify-center gap-2 group w-full sm:w-auto">
                        Open Dashboard
                        <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register">
                        <button className="h-12 px-7 bg-black text-white text-[14px] font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98] flex items-center justify-center gap-2 group w-full sm:w-auto">
                          Start free — no card needed
                          <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                      <Link to="/login">
                        <button className="h-12 px-7 bg-white text-gray-800 text-[14px] font-medium rounded-xl border border-[#DDDDE3] hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center w-full sm:w-auto shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                          Sign in
                        </button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Powered by strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-16 sm:mt-20"
            >
              <span className="text-[11px] font-bold tracking-widest text-gray-300 uppercase">Powered by</span>
              {['OpenStreetMap', 'OSRM Engine', 'Leaflet.js', 'MongoDB'].map((t) => (
                <span key={t} className="text-[13px] font-bold text-gray-400 tracking-tight opacity-60">
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center gap-1.5"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-[1px] h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent"
              />
            </motion.div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div className="border-y border-[#EAEAEA] bg-white py-8">
          <div
            ref={statsRef}
            className="max-w-[1100px] mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col"
              >
                <span className="text-[20px] sm:text-[22px] font-bold tracking-tighter text-gray-900">{s.value}</span>
                <span className="text-[11px] sm:text-[12px] font-medium text-gray-400 mt-0.5">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Big scroll text ── */}
        <section className="max-w-[1100px] mx-auto px-5 sm:px-8 py-20 sm:py-28 overflow-visible">
          <div className="mb-6 select-none">
            <BigTextLine text="EVERYTHING" from="left" delay={0} />
            <BigTextLine text="IN ONE ENGINE." from="right" delay={0.1} outline />
          </div>
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[15px] sm:text-[16px] text-gray-500 font-medium max-w-xl leading-relaxed mt-6"
          >
            From geocoding to financial telemetry — all features built into one high-performance interface.
          </motion.p>
        </section>

        {/* ── Features grid ── */}
        <section className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-white border-t border-[#EAEAEA] py-20 sm:py-28 overflow-visible">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
            <div className="mb-12 sm:mb-16 select-none">
              <BigTextLine text="SIMPLE BY" from="left" delay={0} />
              <BigTextLine text="DESIGN." from="right" delay={0.1} outline />
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="text-[14px] sm:text-[15px] text-gray-500 font-medium max-w-md mt-4 leading-relaxed"
              >
                Three focused actions — from blank canvas to an optimized, navigable route plan.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STEPS.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gray-950 py-20 sm:py-28 overflow-visible">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
            <div className="w-full">
              <div className="mb-10 sm:mb-14 overflow-visible select-none">
                <BigTextLine text="START" from="left" delay={0} dark />
                <BigTextLine text="OPTIMIZING" from="right" delay={0.1} dark outline />
                <BigTextLine text="TODAY." from="left" delay={0.2} dark />
              </div>

              <div className="max-w-[540px]">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-[15px] text-gray-400 font-medium max-w-md mb-10 leading-relaxed"
                >
                  Build your first routing matrix free. Unlimited routes, full analytics, instant CSV export.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {user ? (
                    <Link to="/dashboard">
                      <button className="h-12 px-7 bg-white text-gray-900 text-[14px] font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] active:scale-[0.98] flex items-center gap-2 group w-full sm:w-auto justify-center">
                        Open Dashboard
                        <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register">
                        <button className="h-12 px-7 bg-white text-gray-900 text-[14px] font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] active:scale-[0.98] flex items-center gap-2 group w-full sm:w-auto justify-center">
                          Create free account
                          <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                      <Link to="/login">
                        <button className="h-12 px-7 bg-transparent text-gray-500 text-[14px] font-medium rounded-xl border border-gray-800 hover:border-gray-600 hover:text-gray-200 transition-all flex items-center justify-center w-full sm:w-auto">
                          Sign in
                        </button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-[#EAEAEA] py-8">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <MapIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-gray-900">RoutePilot</span>
            <span className="text-[12px] text-gray-400 font-medium hidden sm:inline">
              © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            {user && (
              <>
                <Link to="/dashboard" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link to="/planner" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Planner
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Sign up
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 sm:pl-6 sm:border-l border-[#EAEAEA]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;