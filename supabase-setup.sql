-- ============================================
-- LUXE Store - Supabase Setup Script
-- ============================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- This script is SAFE TO RE-RUN (idempotent).
-- It creates all tables, RLS policies, storage,
-- realtime, and triggers needed by the app.
-- ============================================


-- ============================================
-- 1. TABLES
-- ============================================

-- Products table (storefront items)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url TEXT,
  video_url TEXT,
  category TEXT DEFAULT 'general',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admins table (email-based admin access list)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  added_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admins_email_key'
  ) THEN
    ALTER TABLE public.admins ADD CONSTRAINT admins_email_key UNIQUE (email);
  END IF;
END $$;

-- Branding table (single-row JSONB store for site branding/config)
CREATE TABLE IF NOT EXISTS public.branding (
  id INTEGER PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the default branding row (app always reads id=1)
INSERT INTO public.branding (id, settings)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Drop existing policies first so this script is re-runnable.

-- --- PRODUCTS ---
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read"   ON public.products;
DROP POLICY IF EXISTS "products_auth_insert"   ON public.products;
DROP POLICY IF EXISTS "products_auth_update"   ON public.products;
DROP POLICY IF EXISTS "products_auth_delete"   ON public.products;

-- Anyone (anon + authenticated) can read products
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create products
CREATE POLICY "products_auth_insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update products
CREATE POLICY "products_auth_update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete products
CREATE POLICY "products_auth_delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);


-- --- ADMINS ---
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_auth_read"   ON public.admins;
DROP POLICY IF EXISTS "admins_auth_insert" ON public.admins;
DROP POLICY IF EXISTS "admins_auth_delete" ON public.admins;

-- Authenticated users can read the admin list (needed to check admin status)
CREATE POLICY "admins_auth_read"
  ON public.admins FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can add admins
CREATE POLICY "admins_auth_insert"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can remove admins
CREATE POLICY "admins_auth_delete"
  ON public.admins FOR DELETE
  TO authenticated
  USING (true);


-- --- BRANDING ---
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branding_public_read"  ON public.branding;
DROP POLICY IF EXISTS "branding_auth_update"  ON public.branding;
DROP POLICY IF EXISTS "branding_auth_insert"  ON public.branding;

-- Anyone can read branding (public storefront needs it)
CREATE POLICY "branding_public_read"
  ON public.branding FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update branding
CREATE POLICY "branding_auth_update"
  ON public.branding FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert/upsert branding
CREATE POLICY "branding_auth_insert"
  ON public.branding FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================
-- 3. STORAGE BUCKETa
-- ============================================

-- Create the "products" public bucket for images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  52428800,  -- 50MB max file size
  ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','video/mp4','video/webm','video/quicktime'];

-- Storage policies (drop first for re-runnability)
DROP POLICY IF EXISTS "products_storage_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "products_storage_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "products_storage_auth_update"  ON storage.objects;
DROP POLICY IF EXISTS "products_storage_auth_delete"  ON storage.objects;

-- Anyone can view product images/videos
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

-- Authenticated users can upload files
CREATE POLICY "products_storage_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Authenticated users can update files
CREATE POLICY "products_storage_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products');

-- Authenticated users can delete files
CREATE POLICY "products_storage_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');


-- ============================================
-- 4. REALTIME
-- ============================================
-- Enable realtime for products table (live updates on the storefront)
-- This is safe to re-run; it will error harmlessly if already added.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================
-- 5. TRIGGERS (auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_branding_updated_at ON public.branding;
CREATE TRIGGER set_branding_updated_at
  BEFORE UPDATE ON public.branding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- 6. INDEXES (performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON public.products (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock   ON public.products (in_stock) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admins_email        ON public.admins (email);


-- ============================================
-- DONE! Your Supabase database is ready.
-- ============================================
-- .env should have:
--   VITE_SUPABASE_URL=https://your-project.supabase.co
--   VITE_SUPABASE_ANON_KEY=your-anon-key
--   VITE_ADMIN_EMAIL=your-email@example.com
--   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
--   VITE_STRIPE_BACKEND_URL=https://your-stripe-backend.vercel.app
-- ============================================
