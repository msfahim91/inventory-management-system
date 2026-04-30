import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/approve`);
      toast.success('User approved!');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const banUser = async (id) => {
    if (!window.confirm('Ban this user?')) return;
    try {
      await API.put(`/admin/users/${id}/ban`);
      toast.success('User banned!');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted!');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
      case 'BANNED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Banned</span>;
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-gray-500 text-sm">Approve, ban or delete users</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Business</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Joined</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.businessName || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.status === 'PENDING' && (
                      <button onClick={() => approveUser(user.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approve">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                      <button onClick={() => banUser(user.id)}
                        className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Ban">
                        <XCircle size={18} />
                      </button>
                    )}
                    {user.status === 'BANNED' && (
                      <button onClick={() => approveUser(user.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Unban">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {user.role !== 'ADMIN' && (
                      <button onClick={() => deleteUser(user.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-10 text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;