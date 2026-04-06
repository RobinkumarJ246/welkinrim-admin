# Making Storage Buckets Publicly Accessible

The product thumbnails are stored in Supabase Storage and need to be publicly accessible for images to load in both admin and client websites.

## Quick Fix - Make Buckets Public

1. Go to **Supabase Dashboard** → **Storage**
2. For each bucket (`product-images`, `product-icons`):
   - Click the bucket name
   - Click **Settings** (gear icon)
   - Toggle **"Public bucket"** to **ON**
   - Click **Save**

## Alternative - Add RLS Policy for Public Read

If you want to keep the bucket private but allow public reads:

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. For `product-images` bucket, add this policy:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );
```

3. For `product-icons` bucket:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-icons' );
```

## Verify Images Are Accessible

After making buckets public, test by visiting:
```
https://axjomaehmyohlnbyekjr.supabase.co/storage/v1/object/public/product-images/[filename]
```

If you see the image, it's working! ✅

## CORS Configuration (if needed)

If images still don't load, add CORS configuration:

1. Go to **Supabase Dashboard** → **Storage** → **Configuration**
2. Add allowed origins:
   - `http://localhost:3000` (admin dev)
   - `http://localhost:5173` (client dev)
   - Your production domains

**Note:** Making buckets public is the simplest solution for product images that should be visible to everyone.
