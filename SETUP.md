# Welkinrim Admin Console - Complete Setup Guide

## Quick Start Summary

1. **Create Supabase Project** → Get URL and keys
2. **Run SQL Migrations** → Create tables and policies  
3. **Create Storage Buckets** → For image uploads
4. **Add Admin User** → In Supabase Auth
5. **Configure Environment** → Add `.env.local`
6. **Seed Database** (optional) → Load sample data
7. **Start Development Server** → `npm run dev`

---

## Detailed Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (choose `ap-south-1` region for Welkinrim)
3. Wait for project initialization
4. Note down:
   - Project URL: `https://[project-id].supabase.co`
   - Anon/Public key
   - Service role key (Settings → API)

### Step 2: Run Database Migrations

In Supabase Dashboard → SQL Editor, run these migrations:

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('motor', 'esc', 'fc', 'ips')),
  series TEXT,
  model TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  use_svg_logo BOOLEAN DEFAULT false,
  logo_src TEXT,
  accent TEXT DEFAULT '#ffc812',
  text_on_accent TEXT DEFAULT '#000',
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Allow authenticated users to read products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for series
CREATE POLICY "Allow authenticated users to read series"
  ON public.series FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert series"
  ON public.series FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update series"
  ON public.series FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete series"
  ON public.series FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_series ON public.products(series);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
```

### Step 3: Create Storage Buckets

In Supabase Dashboard → Storage:

1. Click **New Bucket**
2. Name: `product-assets`, Public: ☑️, Create
3. Click **New Bucket**
4. Name: `series-assets`, Public: ☑️, Create

**Set bucket policies:**

For both buckets, go to Policies tab:
- Enable: "Allow authenticated uploads"
- Enable: "Allow public read access"

### Step 4: Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Click **Add User** → **Create new user**
2. Enter email: `admin@welkinrim.com` (or your email)
3. Enter password: (choose a strong password)
4. Check "Auto Confirm User"
5. Click **Create user**

### Step 5: Configure Environment

In `welkinrim-admin` directory, create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://axjomaehmyohlnbyekjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** Never commit `.env.local` to version control!

### Step 6: Install Dependencies

```bash
cd welkinrim-admin
npm install
```

### Step 7: Seed Database (Optional)

```bash
npx tsx scripts/seedDatabase.ts
```

This will:
- Create all series (haemng, maelard, esc, fc, ips)
- Add sample products from client website

### Step 8: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 and log in with your admin credentials.

---

## Verification Checklist

- [ ] Supabase project created and accessible
- [ ] Database tables created (`products`, `series`)
- [ ] RLS policies enabled and configured
- [ ] Storage buckets created (`product-assets`, `series-assets`)
- [ ] Admin user created in Supabase Auth
- [ ] `.env.local` configured with correct keys
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts without errors
- [ ] Can log in to admin console
- [ ] Can create/edit/delete products
- [ ] Can upload images
- [ ] Can manage series

---

## Troubleshooting

### Cannot connect to Supabase
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check anon key is valid
- Ensure project is not paused in Supabase dashboard

### Login fails
- Verify user exists in Supabase Auth
- Check email/password are correct
- Look at browser console for errors

### Images not uploading
- Verify storage buckets exist
- Check bucket policies allow authenticated uploads
- Ensure buckets are public
- Check file size limits (thumbnails: 1MB, icons: 256KB)

### Products not saving
- Check RLS policies on `products` table
- Verify user is authenticated
- Look at Supabase logs in dashboard

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall

---

## API Endpoints for Client Website

Once set up, your client website can fetch products:

```typescript
// Fetch all products
const res = await fetch('https://your-admin-domain/api/products');
const { products } = await res.json();

// Fetch filtered products
const res = await fetch('https://your-admin-domain/api/products?category=motor&series=haemng');

// Fetch series configuration
const res = await fetch('https://your-admin-domain/api/series');
const { series } = await res.json();
```

---

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Security Checklist

- [ ] Environment variables set in hosting platform
- [ ] RLS policies verified
- [ ] Storage bucket policies reviewed
- [ ] Admin user password is strong
- [ ] CORS configured if needed for API
- [ ] Rate limiting considered for API endpoints

---

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Review browser console for errors
- Verify all setup steps completed
- Check Supabase status page

---

**Setup complete!** You now have a fully functional admin console integrated with Supabase.
