# LUXE Store - Unified E-commerce Platform

A modern, secure e-commerce storefront with Supabase authentication, MFA support, and Stripe payments. **No Firebase or Google Cloud required.**

## Features

- **Email/Password Authentication** via Supabase
- **Two-Factor Authentication (MFA)** - TOTP with QR codes (Google Authenticator, Authy, etc.)
- **Email Verification** - Secure account verification
- **Admin Dashboard** - Full CRUD for products
- **Shopping Cart** - Persistent cart with localStorage
- **Stripe Checkout** - Secure payment processing
- **One Project Deployment** - Frontend + API on Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for project to initialize (~2 minutes)

**Get your API keys:**
- Go to Project Settings > API
- Copy the **Project URL** → `VITE_SUPABASE_URL`
- Copy the **anon public** key → `VITE_SUPABASE_ANON_KEY`

**Create database tables:**
Go to SQL Editor and run:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  category VARCHAR(100) DEFAULT 'general',
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table (for dynamic admin management)
CREATE TABLE admins (
  email VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies for products (anyone can read, authenticated can write)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for admins (authenticated can read)
CREATE POLICY "Authenticated can view admins" ON admins FOR SELECT USING (auth.role() = 'authenticated');

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE products;
```

**Set up Storage for product images:**
1. Go to Storage > Create new bucket
2. Name it `products`
3. Make it **Public**
4. Add policy: Allow authenticated users to upload

```sql
-- Storage policy (run in SQL editor)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view" ON storage.objects
FOR SELECT USING (bucket_id = 'products');
```

**Enable MFA:**
1. Go to Authentication > Providers > MFA
2. Enable "TOTP"

### 3. Stripe Setup

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. Copy **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
4. Copy **Secret key** → `STRIPE_SECRET_KEY` (for Vercel env vars)

### 4. Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_ADMIN_EMAIL=your-email@example.com
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

### One-Command Deploy

```bash
npm i -g vercel
vercel
```

### Environment Variables (add in Vercel Dashboard)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
VITE_ADMIN_EMAIL=your-email@example.com
```

### After Deploy

Add your Vercel domain to Supabase:
1. Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel URL to **Site URL** and **Redirect URLs**

## Project Structure

```
luxe-unified/
├── api/
│   └── create-checkout-session.js  # Stripe API endpoint
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── Footer.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── AccountPage.jsx      # MFA setup
│   ├── context/
│   │   ├── AuthContext.jsx      # Supabase auth + MFA
│   │   ├── CartContext.jsx
│   │   └── ProductsContext.jsx
│   ├── config/
│   │   ├── supabase.js
│   │   └── stripe.js
│   ├── App.jsx
│   └── main.jsx
├── vercel.json
├── package.json
└── .env.example
```

## Authentication Flow

1. **Sign Up**: User registers with email/password
2. **Email Verification**: Supabase sends verification email
3. **Sign In**: User logs in with credentials
4. **MFA (optional)**: User can enable TOTP in Account Settings
5. **MFA Challenge**: If enabled, user enters 6-digit code on login

## Admin Access

Admins are determined by:
1. `VITE_ADMIN_EMAIL` environment variable
2. Or entries in the `admins` database table

To add an admin via SQL:
```sql
INSERT INTO admins (email) VALUES ('admin@example.com');
```

## Security Features

- Row Level Security (RLS) on all tables
- TOTP-based MFA support
- Secure session management via Supabase
- Server-side Stripe secret key (never exposed to client)
- Input sanitization on all forms

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with MFA
- **Storage**: Supabase Storage
- **Payments**: Stripe Checkout
- **Hosting**: Vercel (frontend + serverless API)

## Free Tier Limits

- **Supabase**: 500MB database, 1GB storage, 50K monthly users
- **Vercel**: 100GB bandwidth, serverless functions
- **Stripe**: No monthly fee, 2.9% + 30¢ per transaction

All services have generous free tiers suitable for small stores.
