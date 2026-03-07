-- ============================================
-- LUXE Store - Supabase Setup Script
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables, storage, RLS policies, and realtime needed for the app.
-- ============================================


-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  category TEXT DEFAULT 'general',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  added_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. BRANDING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.branding (
  id INTEGER PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default branding row (id = 1, the app always uses this row)
INSERT INTO public.branding (id, settings)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- --- PRODUCTS ---
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public storefront)
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (true);

-- Only authenticated users can insert (admin check is done in app)
CREATE POLICY "products_auth_insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "products_auth_update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "products_auth_delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);


-- --- ADMINS ---
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read the admins list
CREATE POLICY "admins_auth_read"
  ON public.admins FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert new admins
CREATE POLICY "admins_auth_insert"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can delete admins
CREATE POLICY "admins_auth_delete"
  ON public.admins FOR DELETE
  TO authenticated
  USING (true);


-- --- BRANDING ---
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

-- Anyone can read branding (needed for the public storefront)
CREATE POLICY "branding_public_read"
  ON public.branding FOR SELECT
  USING (true);

-- Only authenticated users can update branding
CREATE POLICY "branding_auth_update"
  ON public.branding FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can insert/upsert branding
CREATE POLICY "branding_auth_insert"
  ON public.branding FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================
-- 5. STORAGE BUCKET - "products"
-- ============================================
-- Create a public bucket for product images and videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view/download files (public product images)
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Allow authenticated users to upload files
CREATE POLICY "products_storage_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update their uploads
CREATE POLICY "products_storage_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products');

-- Allow authenticated users to delete files
CREATE POLICY "products_storage_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');


-- ============================================
-- 6. ENABLE REALTIME FOR PRODUCTS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;


-- ============================================
-- 7. AUTO-UPDATE updated_at TRIGGER
-- ============================================
-- Function to auto-set updated_at on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Apply trigger to branding table
DROP TRIGGER IF EXISTS set_branding_updated_at ON public.branding;
CREATE TRIGGER set_branding_updated_at
  BEFORE UPDATE ON public.branding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- DONE!
-- ============================================
-- After running this script, make sure your .env has:
--   VITE_SUPABASE_URL=https://your-project.supabase.co
--   VITE_SUPABASE_ANON_KEY=your-anon-key
--   VITE_ADMIN_EMAIL=your-email@example.com
-- ============================================
