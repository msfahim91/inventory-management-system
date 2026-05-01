import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Trash2,
  Search, Filter, UserPlus
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: ''
  });

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(u => u.status === statusFilter);
    }
    setFiltered(result);
  }, [users, search, statusFilter]);

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
    } catch { toast.error('Failed'); }
  };

  const banUser = async (id) => {
    if (!window.confirm('Ban this user?')) return;
    try {
      await API.put(`/admin/users/${id}/ban`);
      toast.success('User banned!');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted!');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/create-admin', createForm);
      toast.success('Admin created!');
      fetchUsers();
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );

  const counts = {
    ALL: users.length,
    ACTIVE: users.filter(u => u.status === 'ACTIVE').length,
    PENDING: users.filter(u => u.status === 'PENDING').length,
    BANNED: users.filter(u => u.status === 'BANNED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-500 mt-1">Control user access and permissions</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors font-medium">
          <UserPlus size={18} /> New Admin
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {Object.entries(counts).map(([status, count]) => (
          <button key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === status
                ? 'bg-gray-900 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      user.role === 'ADMIN' ? 'bg-red-500' : 'bg-indigo-500'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.businessName || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.status === 'PENDING' && (
                      <button onClick={() => approveUser(user.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                      <button onClick={() => banUser(user.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Ban">
                        <XCircle size={18} />
                      </button>
                    )}
                    {user.status === 'BANNED' && (
                      <button onClick={() => approveUser(user.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Unban">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {user.role !== 'ADMIN' && (
                      <button onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-2 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Create New Admin</h2>
            <form onSubmit={createAdmin} className="space-y-4">
              <input type="text" placeholder="Full Name *"
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                required />
              <input type="email" placeholder="Email *"
                value={createForm.email}
                onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                required />
              <input type="password" placeholder="Password *"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                required />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors">
                  Create Admin
                </button>
                <button type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;