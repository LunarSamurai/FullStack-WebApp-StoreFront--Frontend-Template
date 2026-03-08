export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe key not configured' });

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, customerEmail, sameAsBilling, shippingAddress, successUrl, cancelUrl } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Calculate shipping based on subtotal
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shippingAmount = itemsSubtotal >= 100 ? 0 : 999;

    const sessionConfig = {
      payment_method_types: ['card'],
      customer_email: customerEmail,
      billing_address_collection: 'required',
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || 'Product',
            ...(item.description ? { description: item.description } : {}),
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: successUrl || `https://example.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || 'https://example.com/shop',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingAmount, currency: 'usd' },
            display_name: shippingAmount === 0 ? 'Free Shipping' : 'Standard Shipping ($9.99)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      metadata: {
        same_as_billing: sameAsBilling ? 'true' : 'false',
        items_data: JSON.stringify(items.slice(0, 10).map(i => ({
          n: i.name,
          pid: i.productId || null,
          p: i.price,
          q: i.quantity || 1,
          img: i.imageUrl || null,
        }))),
      },
    };

    // Store shipping address in metadata if different from billing
    if (!sameAsBilling && shippingAddress) {
      sessionConfig.metadata.shipping_address = JSON.stringify(shippingAddress);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
