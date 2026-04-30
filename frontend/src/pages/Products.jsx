import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', sku: '',
    price: '', quantity: '', reorderLevel: '10',
    categoryId: ''
  });
  const [stockForm, setStockForm] = useState({
    quantity: '', type: 'STOCK_IN', reason: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
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
        name: form.name,
        description: form.description,
        sku: form.sku,
        price: form.price,
        quantity: form.quantity,
        reorderLevel: form.reorderLevel,
        category: form.categoryId ? { id: form.categoryId } : null
      };
      if (selectedProduct) {
        await API.put(`/products/${selectedProduct.id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted!');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/products/${selectedProduct.id}/stock`, stockForm);
      toast.success('Stock updated!');
      fetchData();
      setShowStockModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', sku: '',
      price: '', quantity: '', reorderLevel: '10', categoryId: '' });
    setSelectedProduct(null);
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name, description: product.description || '',
      sku: product.sku || '', price: product.price,
      quantity: product.quantity, reorderLevel: product.reorderLevel,
      categoryId: product.category?.id || ''
    });
    setShowModal(true);
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockForm({ quantity: '', type: 'STOCK_IN', reason: '' });
    setShowStockModal(true);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                    {product.category?.name || 'No Category'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">৳{product.price}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    product.quantity <= product.reorderLevel
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {product.quantity}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    (min: {product.reorderLevel})
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.quantity <= product.reorderLevel
                      ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {product.quantity === 0 ? 'Out of Stock' :
                      product.quantity <= product.reorderLevel ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openStockModal(product)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Update Stock">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => openEdit(product)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-10 text-gray-500">No products found</div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {selectedProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Product Name *"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
              <input type="text" placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="SKU"
                  value={form.sku}
                  onChange={(e) => setForm({...form, sku: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={form.categoryId}
                  onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price *"
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required />
                <input type="number" placeholder="Quantity *"
                  value={form.quantity}
                  onChange={(e) => setForm({...form, quantity: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required />
              </div>
              <input type="number" placeholder="Reorder Level (Alert threshold)"
                value={form.reorderLevel}
                onChange={(e) => setForm({...form, reorderLevel: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  {selectedProduct ? 'Update' : 'Create'}
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

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-1">Update Stock</h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedProduct?.name} — Current: {selectedProduct?.quantity}
            </p>
            <form onSubmit={handleStockUpdate} className="space-y-3">
              <select value={stockForm.type}
                onChange={(e) => setStockForm({...stockForm, type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="STOCK_IN">Stock In ➕ (Add)</option>
                <option value="STOCK_OUT">Stock Out ➖ (Remove)</option>
                <option value="ADJUSTMENT">Adjustment (Set exact)</option>
              </select>
              <input type="number" placeholder="Quantity *"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
              <input type="text" placeholder="Reason (optional)"
                value={stockForm.reason}
                onChange={(e) => setStockForm({...stockForm, reason: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Update Stock
                </button>
                <button type="button"
                  onClick={() => setShowStockModal(false)}
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

export default Products;