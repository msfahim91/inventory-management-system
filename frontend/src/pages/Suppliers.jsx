import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', contactPerson: ''
  });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSupplier) {
        await API.put(`/suppliers/${selectedSupplier.id}`, form);
        toast.success('Supplier updated!');
      } else {
        await API.post('/suppliers', form);
        toast.success('Supplier created!');
      }
      fetchSuppliers();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await API.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted!');
      fetchSuppliers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', address: '', contactPerson: '' });
    setSelectedSupplier(null);
  };

  const openEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setForm({
      name: supplier.name, email: supplier.email || '',
      phone: supplier.phone || '', address: supplier.address || '',
      contactPerson: supplier.contactPerson || ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Address</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{supplier.name}</p>
                  <p className="text-sm text-gray-500">{supplier.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {supplier.contactPerson || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {supplier.phone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {supplier.address || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(supplier)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && (
          <div className="text-center py-10 text-gray-500">No suppliers found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Supplier Name *"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
              <input type="email" placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Contact Person"
                value={form.contactPerson}
                onChange={(e) => setForm({...form, contactPerson: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  {selectedSupplier ? 'Update' : 'Create'}
                </button>
                <button type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
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

export default Suppliers;