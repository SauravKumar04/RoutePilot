import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map as MapIcon, LayoutDashboard, Route, PieChart, Settings, LogOut, FolderOpen, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ConfirmModal from '../common/ConfirmModal';

const Sidebar = ({ onCloseMobileMenu }) => {
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Trip Planner', path: '/planner', icon: Route },
    { name: 'My Trips', path: '/trips', icon: FolderOpen },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <div className="w-64 bg-[#FAFAFA] border-r border-[#EAEAEA] h-full flex flex-col shadow-2xl lg:shadow-none selection:bg-gray-200">
        
        {/* Brand Header */}
        <div className="h-[72px] flex items-center justify-between px-6 shrink-0">
          <Link to="/" className="flex items-center group cursor-pointer" onClick={onCloseMobileMenu}>
            <div className="flex items-center justify-center w-7 h-7 bg-gray-900 rounded-md mr-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:bg-gray-800 transition-colors">
              <MapIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
              RoutePilot AI
            </span>
          </Link>
          
          <button 
            onClick={onCloseMobileMenu}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-2 mb-3">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Workspace</span>
          </div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onCloseMobileMenu}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#EAEAEA]'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-transparent hover:border-[#EAEAEA]/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`w-[16px] h-[16px] mr-3 transition-colors duration-200 ${
                      isActive 
                        ? 'text-gray-900' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 shrink-0 border-t border-[#EAEAEA] bg-[#FAFAFA]">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="group flex items-center w-full px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-transparent hover:border-[#EAEAEA]/50 transition-all duration-200"
          >
            <LogOut className="w-[16px] h-[16px] mr-3 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Sign out of workspace"
        message="Are you sure you want to sign out? You will need to re-authenticate to access your routing matrices."
        confirmText="Sign out"
        isDestructive={false}
        icon={LogOut}
      />
    </>
  );
};

export default Sidebar;