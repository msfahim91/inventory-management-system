import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package,
  ShoppingBag, LogOut, Shield
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Manage Users' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'All Products' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'All Orders' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">IMS Control Center</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-red-400">Administrator</p>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-all">
            <LayoutDashboard size={18} />
            Switch to User View
          </NavLink>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-500" />
            <span className="text-sm font-medium text-gray-600">Admin Control Panel</span>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            ADMIN
          </span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;