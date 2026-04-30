import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data.data || []);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/alerts/${id}/read`);
      fetchAlerts();
    } catch {
      toast.error('Failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/alerts/read-all');
      toast.success('All marked as read!');
      fetchAlerts();
    } catch {
      toast.error('Failed');
    }
  };

  const deleteAlert = async (id) => {
    try {
      await API.delete(`/alerts/${id}`);
      toast.success('Alert deleted!');
      fetchAlerts();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-red-500">{unreadCount} unread alerts</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <CheckCheck size={18} /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id}
            className={`bg-white rounded-xl shadow p-4 flex items-center justify-between ${
              !alert.read ? 'border-l-4 border-red-500' : ''
            }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                alert.type === 'OUT_OF_STOCK'
                  ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <Bell size={18} className={
                  alert.type === 'OUT_OF_STOCK'
                    ? 'text-red-600' : 'text-yellow-600'
                } />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  !alert.read ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {alert.message}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!alert.read && (
                <button onClick={() => markAsRead(alert.id)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Mark as read">
                  <Check size={16} />
                </button>
              )}
              <button onClick={() => deleteAlert(alert.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No alerts found 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;