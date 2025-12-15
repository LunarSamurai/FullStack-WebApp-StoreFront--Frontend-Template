# LUXE Store - Premium E-commerce Storefront

A modern, secure e-commerce storefront with Google authentication, admin dashboard, and Stripe payments.

## Features

- **Google OAuth Authentication** - Secure login via Firebase Auth
- **Admin Dashboard** - Full CRUD for product listings (admin-only)
- **Product Management** - Add images, videos/GIFs for hover effects
- **Shopping Cart** - Sophisticated cart with localStorage persistence
- **Stripe Integration** - Secure payment processing
- **Responsive Design** - Mobile-first, white/brown/gold aesthetic
- **Real-time Updates** - Firestore database with live sync

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → Google
4. Enable **Firestore Database** → Create database (production mode)
5. Enable **Storage** → Get started
6. Go to Project Settings → Your apps → Add Web app
7. Copy config values to `.env`

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users: Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins: Only authenticated users can read
    match /admins/{email} {
      allow read: if request.auth != null;
    }
  }
}
```

**Storage Security Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*|video/.*');
    }
  }
}
```

### 3. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your **Publishable key** from Developers → API keys
3. Add to `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`

**For full checkout, create a backend endpoint:**

```javascript
// server/create-checkout.js (Node.js example)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { items, successUrl, cancelUrl } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  
  res.json({ sessionId: session.id });
});
```

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 5. Configure Admin Access

Add admin emails to `VITE_ADMIN_EMAIL` in `.env`, or add documents to the `admins` collection in Firestore:

```javascript
// Firestore: admins/{email}
{
  email: "admin@example.com",
  createdAt: timestamp
}
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
luxe-store/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation with auth
│   │   ├── ProductCard.jsx  # Card with video hover
│   │   ├── CartDrawer.jsx   # Slide-out cart
│   │   ├── Footer.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── ShopPage.jsx     # Product grid
│   │   ├── AdminPage.jsx    # CRUD dashboard
│   │   └── AboutPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx  # Google auth + admin check
│   │   ├── CartContext.jsx  # Cart state management
│   │   └── ProductsContext.jsx # Firestore products
│   ├── config/
│   │   ├── firebase.js      # Firebase setup
│   │   └── stripe.js        # Stripe setup
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Security Features

- **CSP Headers** - Content Security Policy in index.html
- **Firebase Security Rules** - Role-based access control
- **Input Sanitization** - All user inputs sanitized
- **File Validation** - Type and size limits on uploads
- **HTTPS Only** - Enforced in production
- **No Sensitive Data in Client** - All secrets server-side

## Admin Features

1. **Add Products** - Name, description, price, category
2. **Upload Media** - Images and videos/GIFs for hover
3. **Edit Listings** - Update any product details
4. **Delete Products** - With confirmation dialog
5. **Toggle Status** - In stock / featured flags

## Cart Features

- Persistent across sessions (localStorage)
- Quantity controls
- Tax calculation (8%)
- Free shipping over $100
- Real-time totals

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## License

MIT
