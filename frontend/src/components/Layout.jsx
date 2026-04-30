import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, Truck,
  ShoppingCart, ShoppingBag, Bell, Users, LogOut
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/categories', icon: <Tag size={20} />, label: 'Categories' },
    { path: '/suppliers', icon: <Truck size={20} />, label: 'Suppliers' },
    { path: '/purchase-orders', icon: <ShoppingCart size={20} />, label: 'Purchase Orders' },
    { path: '/sales-orders', icon: <ShoppingBag size={20} />, label: 'Sales Orders' },
    { path: '/alerts', icon: <Bell size={20} />, label: 'Alerts' },
  ];

  if (isAdmin()) {
    navItems.push({
      path: '/admin/users',
      icon: <Users size={20} />,
      label: 'Manage Users'
    });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-5 border-b border-indigo-700">
          <h1 className="text-xl font-bold">📦 IMS</h1>
          <p className="text-xs text-indigo-300 mt-1">Inventory Management</p>
        </div>

        <div className="p-4 border-b border-indigo-700">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-indigo-300">{user?.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-indigo-200 hover:bg-indigo-800 w-full transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;