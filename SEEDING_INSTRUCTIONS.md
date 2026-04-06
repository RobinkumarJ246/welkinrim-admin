# Database Seeding Instructions

## Prerequisites

1. **Supabase Project Setup**
   - Database tables created (`products`, `series`)
   - RLS policies configured
   - Storage buckets created

2. **Environment Variables**
   - `.env.local` file with Supabase credentials configured

## Method 1: Using the Seed Script (Recommended)

```bash
cd admin_console/welkinrim-admin

# Make sure you have the environment variables
# NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

# Run the seed script
npx tsx scripts/seedFromClient.ts
```

This will:
- Seed all 5 series (haemng, maelard, esc, fc, ips)
- Import all products from `WelkinrimTech/src/data/products.ts`
- Upsert data (won't create duplicates)

## Method 2: Manual Seeding via Admin Console

1. **Start the admin console:**
   ```bash
   npm run dev
   ```

2. **Log in** at http://localhost:3000/login

3. **Create Series:**
   - Go to `/series` page
   - Click "Add Series"
   - Add each series:
     * **haemng**: Haemng Series, accent #ffc812, SVG logo: haemng.svg
     * **maelard**: Maelard Series, accent #ffc812, SVG logo: Maelard.svg
     * **esc**: ESCs, accent #ffc812
     * **fc**: Flight Controller, accent #ffc812
     * **ips**: Integrated Power Systems, accent #ffc812

4. **Add Products:**
   - Go to `/products` page
   - Click "Add Product"
   - Enter product details for each item from client data

## Verification

After seeding, verify:

1. **Series are available:**
   - Visit `/series` page
   - Should see 5 series listed

2. **Products are present:**
   - Visit `/products` page
   - Should see all products with proper filtering

3. **Series dropdown works:**
   - Click "Add Product"
   - Series dropdown should show all 5 series

4. **API endpoints work:**
   - Test: `curl http://localhost:3000/api/series`
   - Test: `curl http://localhost:3000/api/products`

## Troubleshooting

### Series not showing in dropdown

**Issue:** When creating a product, the series dropdown is empty.

**Solution:**
1. Check if series exist in database:
   - Go to Supabase Dashboard → Table Editor → series
   - Verify rows are present

2. Check RLS policies:
   - Ensure authenticated users can SELECT from series table

3. Re-run seed script:
   ```bash
   npx tsx scripts/seedFromClient.ts
   ```

### Products not importing

**Issue:** Seed script fails to import products.

**Solution:**
1. Check the client products file exists:
   - Path: `../../../WelkinrimTech/src/data/products.ts`

2. Verify the file exports PRODUCTS array:
   ```typescript
   export const PRODUCTS: Product[] = [...]
   ```

3. Check console output for specific errors

### RLS Policy Errors

**Issue:** "new row violates row-level security policy"

**Solution:**
1. Ensure you're authenticated when seeding
2. Check RLS policies allow INSERT for authenticated users:
   ```sql
   -- In Supabase SQL Editor
   CREATE POLICY "Allow authenticated insert series"
     ON public.series FOR INSERT
     TO authenticated
     WITH CHECK (true);
   
   CREATE POLICY "Allow authenticated insert products"
     ON public.products FOR INSERT
     TO authenticated
     WITH CHECK (true);
   ```

## Next Steps

After seeding:
1. Test the admin console functionality
2. Update `USE_API = true` in client Products.tsx
3. Deploy admin console and update API_URL in client
4. Test end-to-end product display on client website
