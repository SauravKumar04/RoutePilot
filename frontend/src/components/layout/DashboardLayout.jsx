// frontend/src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Map } from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Dark Overlay (closes sidebar when clicking outside) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* The Sidebar (Sliding on Mobile, Fixed on Desktop) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out w-64`}
      >
        <Sidebar onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full max-w-[100vw]">
        
        {/* Mobile Top Navigation Bar (Hidden on Desktop) */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">RoutePilot AI</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;