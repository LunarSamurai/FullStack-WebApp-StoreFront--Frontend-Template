import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, email, reason, details } = req.body;

    if (!orderId || !email || !reason) {
      return res.status(400).json({ error: 'Order ID, email, and reason are required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the order exists and email matches
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match the order' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        error: `This order has already been ${order.status.replace('_', ' ')}`
      });
    }

    // Create cancellation record
    const { error: cancelError } = await supabase
      .from('cancellations')
      .insert({
        order_id: orderId,
        customer_email: email,
        reason: `${reason}${details ? ': ' + details : ''}`,
        status: 'pending',
      });

    if (cancelError) {
      console.error('Error creating cancellation:', cancelError);
      return res.status(500).json({ error: 'Failed to submit cancellation request' });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancellation_requested',
        cancellation_reason: `${reason}${details ? ': ' + details : ''}`,
        cancellation_requested_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
    }

    return res.status(200).json({ success: true, message: 'Cancellation request submitted' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: error.message });
  }
}
