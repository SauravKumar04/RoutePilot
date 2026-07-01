import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map as MapIcon, LayoutDashboard, Route, PieChart, Settings, LogOut, FolderOpen, X, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ConfirmModal from '../common/ConfirmModal';

const Sidebar = ({ onCloseMobileMenu }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

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
              RoutePilot
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
        <div className="p-4 shrink-0 border-t border-[#EAEAEA] bg-[#FAFAFA] relative" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-white border border-[#EAEAEA] rounded-xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-[#F4F4F5] mb-1">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Account</p>
                <p className="text-[12px] text-gray-800 font-medium truncate mt-0.5">{user?.email}</p>
              </div>

              <Link
                to="/faq"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors mx-1"
              >
                <HelpCircle className="w-[16px] h-[16px] text-gray-400" strokeWidth={2} />
                Have doubts?
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-red-500 hover:bg-red-50/50 transition-colors mx-1 border-none bg-transparent cursor-pointer text-left"
              >
                <LogOut className="w-[16px] h-[16px]" strokeWidth={2} />
                Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="group flex items-center justify-between w-full px-3 py-2 bg-white hover:bg-gray-50 border border-[#EAEAEA] rounded-xl text-[13px] font-semibold text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center min-w-0">
              <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold mr-2.5 shrink-0">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <span className="truncate pr-1 text-left min-w-0">
                {user?.email || 'My Account'}
              </span>
            </div>
            <ChevronDown 
              className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${
                menuOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
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