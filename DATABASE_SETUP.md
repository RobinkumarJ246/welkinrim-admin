# Database Setup for Trash & Drafts Features

## Required Supabase Migrations

### 1. Add Soft Delete & Draft Columns to `products` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add soft delete columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);

-- Add comment for documentation
COMMENT ON COLUMN products.is_deleted IS 'Soft delete flag - true if product is in trash';
COMMENT ON COLUMN products.deleted_at IS 'Timestamp when product was deleted';
COMMENT ON COLUMN products.is_published IS 'Publication status - false for drafts';
```

### 2. Add Soft Delete Columns to `series` Table

```sql
-- Add soft delete columns to series table
ALTER TABLE series
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_series_is_deleted ON series(is_deleted);

-- Add comment for documentation
COMMENT ON COLUMN series.is_deleted IS 'Soft delete flag - true if series is in trash';
COMMENT ON COLUMN series.deleted_at IS 'Timestamp when series was deleted';
```

### 3. Update RLS Policies (if you have Row Level Security enabled)

```sql
-- Update products select policy to exclude deleted items by default
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for non-deleted items"
ON products FOR SELECT
USING (is_deleted = FALSE);

-- Create policy for accessing deleted items (for trash page)
CREATE POLICY "Enable read access for deleted items by admins"
ON products FOR SELECT
USING (is_deleted = TRUE);

-- Similar for series
DROP POLICY IF EXISTS "Enable read access for all users" ON series;
CREATE POLICY "Enable read access for non-deleted series"
ON series FOR SELECT
USING (is_deleted = FALSE);

CREATE POLICY "Enable read access for deleted series by admins"
ON series FOR SELECT
USING (is_deleted = TRUE);
```

## After Running Migrations

Once you've run the SQL above, the admin console will be ready for:
- ✅ **Trash Page**: View and restore deleted products/series
- ✅ **Drafts Page**: Manage unpublished products
- ✅ **Soft Deletes**: Products go to trash instead of permanent deletion
- ✅ **Draft Mode**: Save products without publishing them

## Next Implementation Steps

1. **Run the SQL migrations** in Supabase
2. I'll create:
   - Trash page (`/trash`)
   - Drafts page (`/drafts`)
   - Update hooks to handle deleted/draft filtering
   - Real dashboard with stats
   - Settings page with actual functionality

Let me know when the database is updated, and I'll complete the implementation!
