import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    notes: '', items: [{ productId: '', quantity: '', unitPrice: '' }]
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        API.get('/sales-orders'),
        API.get('/products')
      ]);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        notes: form.notes,
        items: form.items.map(item => ({
          product: { id: item.productId },
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        }))
      };
      await API.post('/sales-orders', payload);
      toast.success('Sales order created!');
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/sales-orders/${id}/status`, { status });
      toast.success('Status updated!');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await API.delete(`/sales-orders/${id}`);
      toast.success('Order deleted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const addItem = () => {
    setForm({...form, items: [...form.items,
      { productId: '', quantity: '', unitPrice: '' }]});
  };

  const removeItem = (index) => {
    setForm({...form, items: form.items.filter((_, i) => i !== index)});
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({...form, items});
  };

  const resetForm = () => {
    setForm({ customerName: '', customerEmail: '',
      customerPhone: '', notes: '',
      items: [{ productId: '', quantity: '', unitPrice: '' }] });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={18} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order #</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {order.customerName || '-'}
                  </p>
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ৳{order.totalAmount}
                </td>
                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <button onClick={() => updateStatus(order.id, 'CONFIRMED')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                        Confirm
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(order.id, 'SHIPPED')}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                        Ship
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button onClick={() => updateStatus(order.id, 'DELIVERED')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                        Deliver
                      </button>
                    )}
                    {order.status === 'PENDING' && (
                      <button onClick={() => deleteOrder(order.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-10 text-gray-500">No orders found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New Sales Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Customer Name"
                  value={form.customerName}
                  onChange={(e) => setForm({...form, customerName: e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="Phone"
                  value={form.customerPhone}
                  onChange={(e) => setForm({...form, customerPhone: e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <input type="email" placeholder="Customer Email"
                value={form.customerEmail}
                onChange={(e) => setForm({...form, customerEmail: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Items *</label>
                  <button type="button" onClick={addItem}
                    className="text-xs text-indigo-600 hover:underline">
                    + Add Item
                  </button>
                </div>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <select value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required>
                      <option value="">Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.quantity})
                        </option>
                      ))}
                    </select>
                    <input type="number" placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required />
                    <div className="flex gap-1">
                      <input type="number" placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        className="border rounded-lg px-2 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 px-1">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <input type="text" placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Create Order
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

export default SalesOrders;