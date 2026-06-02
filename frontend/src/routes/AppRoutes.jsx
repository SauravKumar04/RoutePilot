import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import TripPlanner from '../pages/TripPlanner';
import Analytics from '../pages/Analytics'; 
import NotFound from '../pages/NotFound';
import MyTrips from '../pages/MyTrips';
import Settings from '../pages/Settings';
import TripDetail from '../pages/TripDetail';

// Simple placeholder for Settings until custom configurations expand
const SettingsPlaceholder = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
    <p className="text-muted text-sm mt-1">Configure default fleet metrics, local currency tokens, and optimization constraints.</p>
    <div className="mt-6 border border-border rounded-xl p-6 bg-surface shadow-subtle max-w-xl">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Logistical Preferences</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Default Metric Unit</label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option>Kilometers (km)</option>
            <option>Miles (mi)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Average Fuel Price (per Liter)</label>
          <input type="text" defaultValue="₹104.50" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Connected Dashboard Parent Core */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<TripPlanner />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/analytics" element={<Analytics />} /> 
        <Route path="/settings" element={<Settings />} />
        <Route path="/trip-details/:id" element={<TripDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;