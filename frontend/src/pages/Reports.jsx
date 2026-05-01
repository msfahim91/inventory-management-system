import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Download, FileText, Package, ShoppingBag, ShoppingCart } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, salesRes, purchaseRes] = await Promise.all([
        API.get('/products'),
        API.get('/sales-orders'),
        API.get('/purchase-orders'),
      ]);
      setProducts(productsRes.data.data || []);
      setSalesOrders(salesRes.data.data || []);
      setPurchaseOrders(purchaseRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const exportStockReport = () => {
    setGenerating('stock');
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 220, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Stock Report', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 29);

      // Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, 50);

      const totalProducts = products.length;
      const lowStock = products.filter(p => p.quantity <= p.reorderLevel).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

      autoTable(doc, {
        startY: 55,
        head: [['Total Products', 'Low Stock', 'Out of Stock', 'Total Value']],
        body: [[totalProducts, lowStock, outOfStock, `BDT ${totalValue.toFixed(2)}`]],
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10 },
      });

      // Products Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Product Details', 14, doc.lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Product', 'Category', 'SKU', 'Price', 'Stock', 'Status']],
        body: products.map(p => [
          p.name,
          p.category?.name || '-',
          p.sku || '-',
          `BDT ${p.price}`,
          p.quantity,
          p.quantity === 0 ? 'Out of Stock' :
          p.quantity <= p.reorderLevel ? 'Low Stock' : 'In Stock'
        ]),
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 255] },
      });

      doc.save('stock-report.pdf');
      toast.success('Stock report downloaded!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const exportSalesReport = () => {
    setGenerating('sales');
    try {
      const doc = new jsPDF();

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 220, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Report', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 29);

      doc.setTextColor(0, 0, 0);
      const totalSales = salesOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
      const delivered = salesOrders.filter(o => o.status === 'DELIVERED').length;

      autoTable(doc, {
        startY: 45,
        head: [['Total Orders', 'Delivered', 'Total Revenue']],
        body: [[salesOrders.length, delivered, `BDT ${totalSales.toFixed(2)}`]],
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Order #', 'Customer', 'Total', 'Status', 'Date']],
        body: salesOrders.map(o => [
          o.orderNumber,
          o.customerName || '-',
          `BDT ${o.totalAmount}`,
          o.status,
          new Date(o.createdAt).toLocaleDateString()
        ]),
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });

      doc.save('sales-report.pdf');
      toast.success('Sales report downloaded!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const exportPurchaseReport = () => {
    setGenerating('purchase');
    try {
      const doc = new jsPDF();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 220, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Purchase Report', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 29);

      doc.setTextColor(0, 0, 0);
      const totalPurchase = purchaseOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
      const received = purchaseOrders.filter(o => o.status === 'RECEIVED').length;

      autoTable(doc, {
        startY: 45,
        head: [['Total Orders', 'Received', 'Total Spent']],
        body: [[purchaseOrders.length, received, `BDT ${totalPurchase.toFixed(2)}`]],
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Order #', 'Supplier', 'Total', 'Status', 'Date']],
        body: purchaseOrders.map(o => [
          o.orderNumber,
          o.supplier?.name || '-',
          `BDT ${o.totalAmount}`,
          o.status,
          new Date(o.createdAt).toLocaleDateString()
        ]),
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [239, 246, 255] },
      });

      doc.save('purchase-report.pdf');
      toast.success('Purchase report downloaded!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const totalStockValue = products.reduce((sum, p) =>
    sum + (parseFloat(p.price) * p.quantity), 0);
  const totalSalesRevenue = salesOrders.reduce((sum, o) =>
    sum + parseFloat(o.totalAmount || 0), 0);
  const totalPurchaseSpent = purchaseOrders.reduce((sum, o) =>
    sum + parseFloat(o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Download detailed reports as PDF</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Package size={20} className="text-indigo-600" />
            </div>
            <p className="font-medium text-gray-700">Stock Value</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ৳{totalStockValue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-xl">
              <ShoppingBag size={20} className="text-green-600" />
            </div>
            <p className="font-medium text-gray-700">Sales Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ৳{totalSalesRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{salesOrders.length} orders</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <p className="font-medium text-gray-700">Purchase Spent</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ৳{totalPurchaseSpent.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{purchaseOrders.length} orders</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <Package size={24} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Stock Report</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Complete inventory with stock levels, prices and status
          </p>
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Products</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Low Stock</span>
              <span className="font-medium text-yellow-600">
                {products.filter(p => p.quantity <= p.reorderLevel).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Out of Stock</span>
              <span className="font-medium text-red-600">
                {products.filter(p => p.quantity === 0).length}
              </span>
            </div>
          </div>
          <button onClick={exportStockReport}
            disabled={generating === 'stock'}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50">
            {generating === 'stock' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Download size={16} />}
            Download PDF
          </button>
        </div>

        {/* Sales Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Sales Report</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            All sales orders with customer info and revenue
          </p>
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Orders</span>
              <span className="font-medium">{salesOrders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivered</span>
              <span className="font-medium text-green-600">
                {salesOrders.filter(o => o.status === 'DELIVERED').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Revenue</span>
              <span className="font-medium text-green-600">
                ৳{totalSalesRevenue.toFixed(0)}
              </span>
            </div>
          </div>
          <button onClick={exportSalesReport}
            disabled={generating === 'sales'}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50">
            {generating === 'sales' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Download size={16} />}
            Download PDF
          </button>
        </div>

        {/* Purchase Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingCart size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Purchase Report</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            All purchase orders with supplier info and spending
          </p>
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Orders</span>
              <span className="font-medium">{purchaseOrders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Received</span>
              <span className="font-medium text-blue-600">
                {purchaseOrders.filter(o => o.status === 'RECEIVED').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Spent</span>
              <span className="font-medium text-blue-600">
                ৳{totalPurchaseSpent.toFixed(0)}
              </span>
            </div>
          </div>
          <button onClick={exportPurchaseReport}
            disabled={generating === 'purchase'}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {generating === 'purchase' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Download size={16} />}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;