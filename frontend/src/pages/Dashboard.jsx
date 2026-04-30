import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Package, ShoppingBag, ShoppingCart, Bell, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/recent-activities')
      ]);
      setStats(statsRes.data.data);
      setActivities(activitiesRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-gray-500">Here's your inventory overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package size={24} className="text-indigo-600" />}
          color="bg-indigo-100"
        />
        <StatCard
          title="Low Stock Products"
          value={stats?.lowStockProducts || 0}
          icon={<TrendingDown size={24} className="text-red-600" />}
          color="bg-red-100"
        />
        <StatCard
          title="Sales Orders"
          value={stats?.totalSalesOrders || 0}
          icon={<ShoppingBag size={24} className="text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="Purchase Orders"
          value={stats?.totalPurchaseOrders || 0}
          icon={<ShoppingCart size={24} className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.unreadAlerts || 0}
          icon={<Bell size={24} className="text-yellow-600" />}
          color="bg-yellow-100"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Stock Activities
        </h2>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activities</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.product?.name}
                  </p>
                  <p className="text-xs text-gray-500">{activity.reason}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    activity.type === 'STOCK_IN'
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.type === 'STOCK_IN' ? '+' : '-'}
                    {activity.quantity}
                  </span>
                  <p className="text-xs text-gray-500">{activity.type}</p>
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