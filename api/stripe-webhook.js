import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await handleCheckoutCompleted(stripe, event.data.object);
    } catch (err) {
      console.error('Error handling checkout.session.completed:', err);
      // Still return 200 so Stripe doesn't retry
    }
  }

  return res.status(200).json({ received: true });
}

async function handleCheckoutCompleted(stripe, sessionData) {
  // Retrieve full session with line items
  const session = await stripe.checkout.sessions.retrieve(sessionData.id, {
    expand: ['line_items'],
  });

  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Parse metadata
  let itemsData = [];
  try {
    itemsData = JSON.parse(session.metadata?.items_data || '[]');
  } catch (e) {
    console.error('Error parsing items_data:', e);
  }

  const sameAsBilling = session.metadata?.same_as_billing === 'true';
  let shippingMeta = null;
  try {
    shippingMeta = session.metadata?.shipping_address
      ? JSON.parse(session.metadata.shipping_address)
      : null;
  } catch (e) {}

  // Addresses
  const billingAddress = session.customer_details?.address || null;
  const shippingAddress = sameAsBilling
    ? billingAddress
    : (shippingMeta || session.shipping_details?.address || billingAddress);

  // Amounts
  const subtotal = (session.amount_subtotal || 0) / 100;
  const total = (session.amount_total || 0) / 100;
  const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
  const taxAmount = (session.total_details?.amount_tax || 0) / 100;

  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name || null;

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      customer_email: customerEmail,
      customer_name: customerName,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      subtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total,
      currency: session.currency || 'usd',
      status: 'completed',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error inserting order:', orderError);
    throw orderError;
  }

  // Build order items from Stripe line_items + our metadata
  const lineItems = session.line_items?.data || [];
  const orderItems = lineItems.map((li, i) => {
    const custom = itemsData[i] || {};
    return {
      order_id: order.id,
      product_name: li.description || custom.n || 'Product',
      product_id: custom.pid || null,
      quantity: li.quantity || custom.q || 1,
      unit_price: (li.price?.unit_amount || 0) / 100,
      total_price: (li.amount_total || 0) / 100,
      image_url: custom.img || null,
    };
  });

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
    }
  }

  // Send confirmation email
  await sendConfirmationEmail(order, orderItems, {
    customerEmail, customerName, subtotal, taxAmount, shippingCost, total,
  });
}

async function sendConfirmationEmail(order, orderItems, details) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping confirmation email');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.SITE_URL
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LUXE Store <onboarding@resend.dev>';
    const orderNum = order.id.slice(0, 8).toUpperCase();
    const cancelUrl = `${siteUrl}/cancel-order?orderId=${order.id}&email=${encodeURIComponent(details.customerEmail)}`;

    const itemRows = orderItems.map(item => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;color:#2c1810;font-size:14px;">${item.product_name}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;color:#6b5c4f;font-size:14px;">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;color:#2c1810;font-size:14px;">$${item.total_price.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#2c1810;padding:32px;text-align:center;">
            <h1 style="color:#d4a853;margin:0;font-size:24px;letter-spacing:2px;">LUXE STORE</h1>
          </td>
        </tr>
        <!-- Title -->
        <tr>
          <td style="padding:32px 32px 16px;text-align:center;">
            <h2 style="color:#2c1810;margin:0;font-size:22px;">Order Confirmed!</h2>
            <p style="color:#6b5c4f;margin:8px 0 0;font-size:15px;">Thank you for your purchase, ${details.customerName || 'there'}.</p>
            <p style="color:#6b5c4f;margin:4px 0 0;font-size:14px;">Order <strong>#${orderNum}</strong></p>
          </td>
        </tr>
        <!-- Items -->
        <tr>
          <td style="padding:0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr style="background-color:#f8f5f0;">
                <th style="padding:10px 8px;text-align:left;color:#2c1810;font-size:13px;font-weight:600;">Item</th>
                <th style="padding:10px 8px;text-align:center;color:#2c1810;font-size:13px;font-weight:600;">Qty</th>
                <th style="padding:10px 8px;text-align:right;color:#2c1810;font-size:13px;font-weight:600;">Price</th>
              </tr>
              ${itemRows}
            </table>
          </td>
        </tr>
        <!-- Totals -->
        <tr>
          <td style="padding:16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f0;border-radius:8px;">
              <tr>
                <td style="padding:12px 16px;color:#6b5c4f;font-size:14px;">Subtotal</td>
                <td style="padding:12px 16px;text-align:right;color:#2c1810;font-size:14px;">$${details.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 16px 12px;color:#6b5c4f;font-size:14px;">Shipping</td>
                <td style="padding:4px 16px 12px;text-align:right;color:#2c1810;font-size:14px;">${details.shippingCost > 0 ? '$' + details.shippingCost.toFixed(2) : 'Free'}</td>
              </tr>
              ${details.taxAmount > 0 ? `<tr>
                <td style="padding:4px 16px 12px;color:#6b5c4f;font-size:14px;">Tax</td>
                <td style="padding:4px 16px 12px;text-align:right;color:#2c1810;font-size:14px;">$${details.taxAmount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 16px;border-top:1px solid #ddd;color:#2c1810;font-size:16px;font-weight:700;">Total</td>
                <td style="padding:12px 16px;border-top:1px solid #ddd;text-align:right;color:#2c1810;font-size:16px;font-weight:700;">$${details.total.toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#999;font-size:13px;margin:0;line-height:1.5;">
              Didn't place this order?
              <a href="${cancelUrl}" style="color:#d4a853;text-decoration:underline;">Click here</a>
              to request a cancellation.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: fromEmail,
      to: details.customerEmail,
      subject: `Order Confirmed - #${orderNum}`,
      html,
    });

    console.log('Confirmation email sent to', details.customerEmail);
  } catch (err) {
    console.error('Error sending confirmation email:', err);
  }
}
