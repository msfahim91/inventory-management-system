import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  Package, ShoppingBag, ShoppingCart,
  Bell, TrendingDown, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const StatCard = ({ title, value, icon, color, bg, trend, trendValue }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bg}`}>
        <div className={color}>{icon}</div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/recent-activities')
      ]);
      setStats(statsRes.data.data);
      setActivities(activitiesRes.data.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Chart data from activities
  const chartData = activities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
    const existing = acc.find(d => d.date === date);
    if (existing) {
      if (activity.type === 'STOCK_IN') existing.stockIn += activity.quantity;
      else existing.stockOut += activity.quantity;
    } else {
      acc.push({
        date,
        stockIn: activity.type === 'STOCK_IN' ? activity.quantity : 0,
        stockOut: activity.type === 'STOCK_OUT' ? activity.quantity : 0,
      });
    }
    return acc;
  }, []).slice(-7);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4"></div>
            <div className="w-16 h-8 bg-gray-100 rounded mb-2"></div>
            <div className="w-24 h-4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Good {new Date().getHours() < 12 ? 'Morning' :
                  new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-indigo-700 font-medium">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Products" value={stats?.totalProducts || 0}
          icon={<Package size={22} />} color="text-indigo-600" bg="bg-indigo-50"
          trend="up" trendValue="Active" />
        <StatCard title="Low Stock Alert" value={stats?.lowStockProducts || 0}
          icon={<TrendingDown size={22} />} color="text-red-600" bg="bg-red-50"
          trend={stats?.lowStockProducts > 0 ? 'down' : null}
          trendValue="Needs attention" />
        <StatCard title="Sales Orders" value={stats?.totalSalesOrders || 0}
          icon={<ShoppingBag size={22} />} color="text-green-600" bg="bg-green-50"
          trend="up" trendValue="Total" />
        <StatCard title="Purchase Orders" value={stats?.totalPurchaseOrders || 0}
          icon={<ShoppingCart size={22} />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Unread Alerts" value={stats?.unreadAlerts || 0}
          icon={<Bell size={22} />} color="text-yellow-600" bg="bg-yellow-50"
          trend={stats?.unreadAlerts > 0 ? 'down' : null}
          trendValue="Unread" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Stock Movement</h2>
          <p className="text-sm text-gray-500 mb-6">Last 7 days activity</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="stockIn" name="Stock In"
                  stroke="#6366f1" fill="url(#colorIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="stockOut" name="Stock Out"
                  stroke="#ef4444" fill="url(#colorOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">
              <div className="text-center">
                <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No stock activity yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Orders Overview</h2>
          <p className="text-sm text-gray-500 mb-6">Sales vs Purchase orders</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Orders', Sales: stats?.totalSalesOrders || 0,
                Purchase: stats?.totalPurchaseOrders || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Purchase" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
            <p className="text-sm text-gray-500">Latest stock movements</p>
          </div>
          <Clock size={18} className="text-gray-400" />
        </div>
        {activities.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={40} className="mx-auto mb-2 opacity-30" />
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-xl ${
                  activity.type === 'STOCK_IN'
                    ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {activity.type === 'STOCK_IN'
                    ? <TrendingUp size={16} className="text-green-600" />
                    : <TrendingDown size={16} className="text-red-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.product?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.reason || activity.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    activity.type === 'STOCK_IN'
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.type === 'STOCK_IN' ? '+' : '-'}{activity.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;