import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package,
  Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown,
  Eye, MoreHorizontal
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const TIME_PERIODS = [
  { id: 'day', label: 'Today', days: 1 },
  { id: 'week', label: '7 Days', days: 7 },
  { id: 'month', label: '30 Days', days: 30 },
  { id: 'year', label: '12 Months', days: 365 },
];

export default function SalesDashboard() {
  const [timePeriod, setTimePeriod] = useState('week');
  const [salesData, setSalesData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productTrends, setProductTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [timePeriod]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_STRIPE_BACKEND_URL || 'http://localhost:3001';
      const apiUrl = `${backendUrl}/api/sales-analytics`;
      
      const response = await fetch(`${apiUrl}?period=${timePeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.analytics);
        setRecentOrders(data.recentOrders || []);
        setProductTrends(data.productTrends || []);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Use mock data for demo
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const days = TIME_PERIODS.find(p => p.id === timePeriod)?.days || 7;
    const chartData = generateMockChartData(days);
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
    
    setSalesData({
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCustomers: Math.floor(totalOrders * 0.85),
      revenueChange: Math.random() * 40 - 10,
      ordersChange: Math.random() * 30 - 5,
      aovChange: Math.random() * 20 - 10,
      customersChange: Math.random() * 25 - 5,
      chartData,
    });

    setRecentOrders([
      { id: 'ord_1', customer: 'John Smith', email: 'john@example.com', amount: 125.00, status: 'completed', date: new Date().toISOString(), items: 2 },
      { id: 'ord_2', customer: 'Sarah Johnson', email: 'sarah@example.com', amount: 89.99, status: 'completed', date: new Date(Date.now() - 3600000).toISOString(), items: 1 },
      { id: 'ord_3', customer: 'Mike Davis', email: 'mike@example.com', amount: 245.50, status: 'processing', date: new Date(Date.now() - 7200000).toISOString(), items: 3 },
      { id: 'ord_4', customer: 'Emily Brown', email: 'emily@example.com', amount: 67.00, status: 'completed', date: new Date(Date.now() - 86400000).toISOString(), items: 1 },
      { id: 'ord_5', customer: 'David Wilson', email: 'david@example.com', amount: 189.99, status: 'completed', date: new Date(Date.now() - 172800000).toISOString(), items: 2 },
    ]);

    setProductTrends([
      { name: 'Test 3', sales: 45, revenue: 4500, percentage: 35 },
      { name: 'Test Product 2', sales: 32, revenue: 800, percentage: 25 },
      { name: 'Test 1', sales: 28, revenue: 56, percentage: 22 },
      { name: 'Other Products', sales: 23, revenue: 1150, percentage: 18 },
    ]);
  };

  const generateMockChartData = (days) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 500 + Math.random() * 1500;
      const variance = Math.sin(i / 3) * 300;
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(days > 30 ? { year: '2-digit' } : {})
        }),
        fullDate: date.toISOString(),
        revenue: Math.max(0, baseRevenue + variance),
        orders: Math.floor(3 + Math.random() * 12),
        customers: Math.floor(2 + Math.random() * 8),
      });
    }
    
    return data;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSalesData();
    setRefreshing(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const COLORS = ['#C4A052', '#3D2E1E', '#7A6A5A', '#B8943E'];

  if (loading && !salesData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-cream-200 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-coffee-900">Sales Analytics</h2>
          <p className="text-coffee-500 text-sm mt-1">Track your store performance and revenue</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Period Selector */}
          <div className="flex bg-cream-100 rounded-xl p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.id}
                onClick={() => setTimePeriod(period.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timePeriod === period.id
                    ? 'bg-white text-coffee-900 shadow-sm'
                    : 'text-coffee-500 hover:text-coffee-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-cream-100 hover:bg-cream-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-coffee-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(salesData?.totalRevenue || 0)}
          change={salesData?.revenueChange || 0}
          icon={DollarSign}
          color="gold"
        />
        <MetricCard
          title="Total Orders"
          value={salesData?.totalOrders || 0}
          change={salesData?.ordersChange || 0}
          icon={ShoppingBag}
          color="coffee"
        />
        <MetricCard
          title="Avg. Order Value"
          value={formatCurrency(salesData?.averageOrderValue || 0)}
          change={salesData?.aovChange || 0}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Customers"
          value={salesData?.totalCustomers || 0}
          change={salesData?.customersChange || 0}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-coffee-900">Revenue Overview</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-500" />
              <span className="text-coffee-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-coffee-400" />
              <span className="text-coffee-600">Orders</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData?.chartData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4A052" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C4A052" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E8" />
              <XAxis 
                dataKey="date" 
                stroke="#7A6A5A" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#7A6A5A" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C4A052"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#5C4A3A"
                strokeWidth={2}
                dot={false}
                yAxisId={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-coffee-900">Recent Orders</h3>
            <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-gold-700">
                      {order.customer?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-coffee-900 text-sm">{order.customer}</p>
                    <p className="text-xs text-coffee-500">{order.items} item{order.items > 1 ? 's' : ''} • {formatDate(order.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-coffee-900">{formatCurrency(order.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gold-100 text-gold-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-coffee-900">Top Products</h3>
            <span className="text-sm text-coffee-500">By sales volume</span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Pie Chart */}
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productTrends}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {productTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {productTrends.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-coffee-700 truncate max-w-[120px]">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-coffee-900">
                      {product.sales} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div className="mt-6 pt-4 border-t border-cream-200 space-y-2">
            {productTrends.slice(0, 3).map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-cream-100 rounded-full flex items-center justify-center text-xs font-medium text-coffee-600">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-coffee-900">{product.name}</span>
                </div>
                <span className="text-sm text-coffee-600">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-coffee-900">3.2%</p>
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} />
            +0.5% from last period
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Eye size={20} className="text-blue-600" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Page Views</h3>
          </div>
          <p className="text-3xl font-bold text-coffee-900">12,458</p>
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} />
            +12.3% from last period
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gold-100 rounded-xl">
              <Package size={20} className="text-gold-600" />
            </div>
            <h3 className="font-display font-semibold text-coffee-900">Fulfillment Rate</h3>
          </div>
          <p className="text-3xl font-bold text-coffee-900">98.5%</p>
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} />
            +1.2% from last period
          </p>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change >= 0;
  
  const colorClasses = {
    gold: 'bg-gold-100 text-gold-600',
    coffee: 'bg-coffee-100 text-coffee-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-500'
        }`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-coffee-900">{value}</p>
      <p className="text-sm text-coffee-500 mt-1">{title}</p>
    </div>
  );
}