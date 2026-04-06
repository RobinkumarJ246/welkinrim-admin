# Storage Bucket Setup

## Fix "row-level security policy" Error

The upload error occurs because storage buckets need RLS policies. Configure in Supabase Dashboard:

### Option 1: Quick Fix - Make Buckets Public

1. Go to **Supabase Dashboard** → **Storage**
2. For `product-images` bucket:
   - Click the bucket
   - Toggle **Public bucket** ON
3. For `product-icons` bucket:
   - Click the bucket
   - Toggle **Public bucket** ON

### Option 2: Proper RLS Policies (Recommended)

1. Go to **Supabase Dashboard** → **Storage** → **Policies**

2. For **product-images** bucket, add:
   ```
   Policy name: Allow authenticated uploads
   Allowed operation: INSERT
   Target roles: authenticated
   WITH CHECK expression: true
   ```

   ```
   Policy name: Allow public read
   Allowed operation: SELECT
   Target roles: public
   USING expression: true
   ```

   ```
   Policy name: Allow authenticated updates
   Allowed operation: UPDATE
   Target roles: authenticated  
   WITH CHECK expression: true
   USING expression: true
   ```

3. Repeat same policies for **product-icons** bucket

After setup, image uploads will work!
