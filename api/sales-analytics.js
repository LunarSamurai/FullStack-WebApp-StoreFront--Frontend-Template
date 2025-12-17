import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000);

    // Fetch payment intents (successful payments)
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: startTimestamp },
      limit: 100,
    });

    // Fetch checkout sessions for customer details
    const sessions = await stripe.checkout.sessions.list({
      created: { gte: startTimestamp },
      limit: 100,
      expand: ['data.line_items'],
    });

    // Process payment intents for analytics
    const successfulPayments = paymentIntents.data.filter(
      pi => pi.status === 'succeeded'
    );

    // Calculate metrics
    const totalRevenue = successfulPayments.reduce(
      (sum, pi) => sum + pi.amount, 0
    ) / 100; // Convert from cents

    const totalOrders = successfulPayments.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(
      successfulPayments
        .map(pi => pi.customer || pi.receipt_email)
        .filter(Boolean)
    );
    const totalCustomers = uniqueCustomers.size || Math.floor(totalOrders * 0.85);

    // Generate chart data
    const chartData = generateChartData(successfulPayments, period);

    // Calculate period-over-period changes
    const previousPeriodStart = new Date(startDate);
    const periodDays = getPeriodDays(period);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
    
    const previousPayments = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(previousPeriodStart.getTime() / 1000),
        lt: startTimestamp,
      },
      limit: 100,
    });

    const previousSuccessful = previousPayments.data.filter(
      pi => pi.status === 'succeeded'
    );
    const previousRevenue = previousSuccessful.reduce(
      (sum, pi) => sum + pi.amount, 0
    ) / 100;
    const previousOrders = previousSuccessful.length;
    const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const ordersChange = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0;
    const aovChange = previousAOV > 0 
      ? ((averageOrderValue - previousAOV) / previousAOV) * 100 
      : 0;

    // Get recent orders with customer details
    const recentOrders = sessions.data
      .filter(s => s.payment_status === 'paid')
      .slice(0, 10)
      .map(session => ({
        id: session.id,
        customer: session.customer_details?.name || 'Guest Customer',
        email: session.customer_details?.email || 'N/A',
        amount: session.amount_total / 100,
        status: 'completed',
        date: new Date(session.created * 1000).toISOString(),
        items: session.line_items?.data?.length || 1,
      }));

    // Calculate product trends from line items
    const productSales = {};
    sessions.data.forEach(session => {
      if (session.payment_status === 'paid' && session.line_items?.data) {
        session.line_items.data.forEach(item => {
          const name = item.description || 'Unknown Product';
          if (!productSales[name]) {
            productSales[name] = { name, sales: 0, revenue: 0 };
          }
          productSales[name].sales += item.quantity || 1;
          productSales[name].revenue += (item.amount_total || 0) / 100;
        });
      }
    });

    const productTrends = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((product, index, arr) => {
        const totalSales = arr.reduce((sum, p) => sum + p.sales, 0);
        return {
          ...product,
          percentage: totalSales > 0 ? Math.round((product.sales / totalSales) * 100) : 0,
        };
      });

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        revenueChange,
        ordersChange,
        aovChange,
        customersChange: ordersChange * 0.9, // Approximate
        chartData,
      },
      recentOrders,
      productTrends,
    });

  } catch (error) {
    console.error('Sales analytics error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

function getPeriodDays(period) {
  switch (period) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'year': return 365;
    default: return 7;
  }
}

function generateChartData(payments, period) {
  const days = getPeriodDays(period);
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayPayments = payments.filter(pi => {
      const piDate = new Date(pi.created * 1000);
      return piDate >= date && piDate < nextDate;
    });

    const revenue = dayPayments.reduce((sum, pi) => sum + pi.amount, 0) / 100;
    const orders = dayPayments.length;

    data.push({
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(days > 60 ? { year: '2-digit' } : {}),
      }),
      fullDate: date.toISOString(),
      revenue,
      orders,
      customers: Math.floor(orders * 0.85) || 0,
    });
  }

  return data;
}