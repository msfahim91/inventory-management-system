import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Users, Package, ShoppingBag, ShoppingCart,
  TrendingDown, UserCheck, UserX, Clock
} from 'lucide-react';

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-2xl ${bg}`}>
      <div className={color}>{icon}</div>
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, productsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/all-products'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/approve`);
      toast.success('User approved!');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">System Overview</h1>
        <p className="text-gray-500 mt-1">Monitor all users and system activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0}
          icon={<Users size={24} />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Active Users" value={stats?.activeUsers || 0}
          icon={<UserCheck size={24} />} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Pending Approval" value={stats?.pendingUsers || 0}
          icon={<Clock size={24} />} color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard title="Total Products" value={stats?.totalProducts || 0}
          icon={<Package size={24} />} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Sales Orders" value={stats?.totalSalesOrders || 0}
          icon={<ShoppingBag size={24} />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Purchase Orders" value={stats?.totalPurchaseOrders || 0}
          icon={<ShoppingCart size={24} />} color="text-pink-600" bg="bg-pink-50" />
        <StatCard title="Low Stock Items" value={stats?.lowStockProducts || 0}
          icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
        <StatCard title="Banned Users" value={
          users.filter(u => u.status === 'BANNED').length}
          icon={<UserX size={24} />} color="text-gray-600" bg="bg-gray-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">⏳ Pending Approvals</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {pendingUsers.length} pending
            </span>
          </div>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <UserCheck size={40} className="mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <div key={user.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-yellow-200 rounded-full flex items-center justify-center font-bold text-yellow-700 text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => approveUser(user.id)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">⚠️ Low Stock Alert</h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              {lowStockProducts.length} items
            </span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-50" />
              <p>All products well stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Owner: {product.user?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.quantity} left</p>
                    <p className="text-xs text-gray-400">min: {product.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">👥 All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Business</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-500' : 'bg-indigo-500'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.businessName || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;