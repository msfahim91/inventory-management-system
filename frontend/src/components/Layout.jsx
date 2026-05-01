import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, Truck,
  ShoppingCart, ShoppingBag, Bell, LogOut,
  Shield, ChevronRight
} from 'lucide-react';
import { useEffect } from 'react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, []);

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/categories', icon: <Tag size={20} />, label: 'Categories' },
    { path: '/suppliers', icon: <Truck size={20} />, label: 'Suppliers' },
    { path: '/purchase-orders', icon: <ShoppingCart size={20} />, label: 'Purchase Orders' },
    { path: '/sales-orders', icon: <ShoppingBag size={20} />, label: 'Sales Orders' },
    { path: '/alerts', icon: <Bell size={20} />, label: 'Alerts' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-indigo-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">IMS</h1>
              <p className="text-xs text-indigo-300">Inventory Management</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-indigo-300">{user?.businessName || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-indigo-700 space-y-1">
          {isAdmin() && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-200 hover:bg-indigo-800 hover:text-white w-full transition-all">
              <Shield size={18} />
              <span className="flex-1">Admin Panel</span>
              <ChevronRight size={16} />
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-200 hover:bg-indigo-800 hover:text-white w-full transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;