import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Package, TrendingDown } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stockFilter === 'LOW') {
      result = result.filter(p => p.quantity <= p.reorderLevel && p.quantity > 0);
    } else if (stockFilter === 'OUT') {
      result = result.filter(p => p.quantity === 0);
    } else if (stockFilter === 'OK') {
      result = result.filter(p => p.quantity > p.reorderLevel);
    }
    setFiltered(result);
  }, [products, search, stockFilter]);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/admin/all-products');
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
    </div>
  );

  const counts = {
    ALL: products.length,
    OK: products.filter(p => p.quantity > p.reorderLevel).length,
    LOW: products.filter(p => p.quantity <= p.reorderLevel && p.quantity > 0).length,
    OUT: products.filter(p => p.quantity === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
        <p className="text-gray-500 mt-1">Monitor inventory across all users</p>
      </div>

      {/* Stock Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'All', color: 'bg-gray-900 text-white' },
          { key: 'OK', label: '✅ In Stock', color: 'bg-green-500 text-white' },
          { key: 'LOW', label: '⚠️ Low Stock', color: 'bg-yellow-500 text-white' },
          { key: 'OUT', label: '❌ Out of Stock', color: 'bg-red-500 text-white' },
        ].map(({ key, label, color }) => (
          <button key={key}
            onClick={() => setStockFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              stockFilter === key
                ? color + ' shadow'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, owner, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Package size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {product.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{product.user?.name}</p>
                      <p className="text-xs text-gray-400">{product.user?.businessName || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                    {product.category?.name || 'No Category'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.sku || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  ৳{product.price}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      product.quantity === 0 ? 'text-red-600' :
                      product.quantity <= product.reorderLevel ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {product.quantity}
                    </span>
                    <span className="text-xs text-gray-400">/ min {product.reorderLevel}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.quantity === 0
                      ? 'bg-red-100 text-red-700' :
                    product.quantity <= product.reorderLevel
                      ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                  }`}>
                    {product.quantity === 0 ? 'Out of Stock' :
                     product.quantity <= product.reorderLevel ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-2 opacity-50" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;