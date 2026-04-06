# Debug: Data Display Issue

## Problem
Product specifications showing as "-" in table and empty in detail modal.

## Steps to Debug

1. **Open Browser Console** (F12 → Console tab)
2. **Go to Products page** in admin console
3. **Click on any product row** to open detail modal
4. **Check console logs** for:
   - `ProductDetailModal - product:` - shows raw product object
   - `ProductDetailModal - productData:` - shows extracted data

## Expected Data Structure

Products from Supabase should have:
```json
{
  "id": "esc-bxxdn0bgg",
  "category": "esc",
  "series": "esc",
  "model": "E120 12S",
  "data": {
    "id": "esc-bxxdn0bgg",
    "model": "E120 12S",
    "series": "esc",
    "category": "esc",
    "continuousCurrent": 120,
    "currentLimit": 150,
    "recommendedBattery": "6-12S",
    "weight": 85,
    // ... other specs
  },
  "created_at": "2026-04-06T...",
  "updated_at": "2026-04-06T..."
}
```

## If Data is Missing

Run this query in Supabase SQL Editor to check:

```sql
SELECT id, model, category, series, data FROM products LIMIT 5;
```

The `data` column should contain a JSONB object with all product specifications.

## Quick Fix

If data column is empty, re-run the seed script:
```bash
cd admin_console/welkinrim-admin
npx tsx scripts/seedFromClient.ts
```
