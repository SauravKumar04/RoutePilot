import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  ChevronDown, 
  Map as MapIcon, 
  Mail, 
  MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA = [
  {
    category: "General",
    q: "What is RoutePilot?",
    a: "RoutePilot is an enterprise-grade intelligent logistics optimization platform. Designed for modern supply chain operations, it helps dispatchers, fleet managers, and individual operators instantly compute optimal route itineraries. The application minimizes driving distance, carbon footprint, and operational costs while strictly adhering to vehicle load capacities and delivery time windows."
  },
  {
    category: "General",
    q: "How do I import my custom delivery lists?",
    a: "RoutePilot supports native CSV file ingestion. When creating a new trip, you can upload a spreadsheet of your stops. The planner automatically parses standard column headers (such as Name, Address, Latitude, Longitude, Demand, and Time Windows) to populate your workspace stops. If exact coordinates are missing, Nominatim geocoding automatically resolves the text addresses."
  },
  {
    category: "General",
    q: "Can I save route templates for future reuse?",
    a: "Yes. Once you configure and optimize a route matrix, you can name and save the trip. This registers the chronological stop sequence and configuration inside our database, allowing you to quickly reload the template from your dashboard, swap stops, adjust demand parameters, and execute re-optimization with one click."
  },
  {
    category: "Routing Engine",
    q: "How does the route optimization engine solve routes?",
    a: "We implement a high-performance two-stage routing pipeline. In the first stage, RoutePilot queries local highway network geometries using OSRM (Open Source Routing Machine) to build a precise travel duration and distance matrix. In the second stage, it runs a metaheuristic solver (combining Nearest Neighbor construction with 2-Opt local search refinement) to iteratively untangle overlapping paths and output the absolute shortest route sequence."
  },
  {
    category: "Routing Engine",
    q: "What are Capacity Constraints (CVRP)?",
    a: "The Capacitated Vehicle Routing Problem (CVRP) module boundaries allow you to specify a maximum weight, volume, or package capacity limit for your delivery vehicle. When optimization runs, if the combined payload demands of all stops exceed your vehicle limit, the engine automatically clusters the stops into multiple separate routes, inserting required returns to the starting depot to reload."
  },
  {
    category: "Routing Engine",
    q: "How do Delivery Time Windows work?",
    a: "You can specify a strict start and end time window (e.g., 08:00 to 10:30) for any stop. The engine computes cumulative driving durations and service times to project the exact arrival time. If the projected arrival violates a stop's window constraint, the system generates a visual warning badge showing the latency mismatch, letting you re-sequence manually or run re-optimization."
  },
  {
    category: "Telemetry & Costs",
    q: "How is Fuel Telemetry calculated?",
    a: "Our telemetry layer performs real-time financial modeling based on optimization output distance. By combining your vehicle's fuel economy index (e.g., L/100km or MPG) with local fuel cost parameters configured in your settings, we calculate the exact estimated fuel volume consumed. This feeds directly into savings summaries and dashboard carbon charts."
  },
  {
    category: "Telemetry & Costs",
    q: "How does carbon footprint estimation work?",
    a: "We translate fuel consumption into carbon footprint parameters. Using standard environmental conversion constants (e.g., approximately 2.31 kg of CO2 per liter of gasoline consumed), the analytics engine computes your total carbon output. We then calculate carbon offset savings by comparing the optimized route matrix against the non-optimized input sequence."
  },
  {
    category: "Map & Coordinates",
    q: "What happens if a geocoded address is slightly off?",
    a: "Nominatim queries are highly accurate, but in cases where a delivery drop-off is in a private driveway or rear alley, you can drag the marker directly on our interactive Leaflet map interface. The coordinate payload updates in real time, and clicking re-optimize immediately adapts the path geometry to the new pin location."
  },
  {
    category: "Map & Coordinates",
    q: "Can I use current GPS coordinates as a depot?",
    a: "Yes. When defining your start node (depot) or any stop, you can click the locate icon. If browser location permissions are granted, RoutePilot retrieves your high-precision device GPS coordinates, resolves the address, and registers it as the starting hub."
  },
  {
    category: "Data & Export",
    q: "How can drivers access optimized routes?",
    a: "Dispatchers can share optimized plans in three ways: download the sequenced stops list as a clean CSV spreadsheet, share a secure read-only URL containing the interactive map and timeline, or export coordinates directly to drivers' mobile devices to launch navigation in Google Maps, Apple Maps, or Waze."
  }
];

const FAQItem = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border-b border-[#EAEAEA] py-5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
      >
        <span className="text-[15px] sm:text-[16px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors tracking-tight">
          {faq.q}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-transform duration-300 shrink-0 ml-4 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium leading-relaxed mt-3.5 pr-6">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = FAQ_DATA.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] font-sans selection:bg-gray-200 overflow-x-hidden flex flex-col justify-between">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FAFAFA]/80 backdrop-blur-md z-50 border-b border-[#EAEAEA]">
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 max-w-[900px] mx-auto">
          <Link to="/" className="flex items-center group cursor-pointer">
            <div className="flex items-center justify-center w-7 h-7 bg-gray-900 rounded-md mr-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.12)] group-hover:bg-gray-700 transition-colors">
              <MapIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
              RoutePilot
            </span>
          </Link>

          <Link
            to="/"
            className="text-[13px] font-semibold px-3.5 py-1.5 bg-[#F4F4F5] text-gray-700 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center gap-1.5 border border-[#EAEAEA]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[720px] w-full mx-auto px-5 pt-28 pb-20 flex-1">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
            FAQ Section
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-4">
            Answers to your questions
          </h1>
          <p className="text-[14px] text-gray-400 font-medium mt-2 max-w-md mx-auto">
            Everything you need to know about RoutePilot's geocoding, VRPTW capacity constraints, and telemetry calculations.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions, categories, or keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenIndex(null);
            }}
            className="w-full h-11 pl-11 pr-4 bg-white border border-[#EAEAEA] rounded-xl text-[13px] font-medium placeholder-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        {/* FAQ List */}
        <div className="bg-white border border-[#EAEAEA] rounded-2xl px-6 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-[13px] font-medium flex flex-col items-center">
              <HelpCircle className="w-8 h-8 text-gray-300 mb-3" />
              No results found matching your search.
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h4 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-gray-300" /> Still have questions?
            </h4>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
              If you can't find an answer here, our team is always ready to assist.
            </p>
          </div>
          <a
            href="mailto:support@routepilot.ai"
            className="h-9 px-4 bg-white text-gray-900 text-[12px] font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" /> Contact Support
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-[#EAEAEA] py-6 text-center">
        <span className="text-[11px] text-gray-400 font-medium">
          RoutePilot FAQ Module — Powered by OSRM & Leaflet
        </span>
      </footer>
    </div>
  );
};

export default FAQ;
