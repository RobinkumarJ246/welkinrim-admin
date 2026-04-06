# Welkinrim Admin Console

Admin console for managing Welkinrim products, series, and content. Built with Next.js, TypeScript, and Supabase.

## Features

- **Product Management**: Full CRUD operations for motors, ESCs, flight controllers, and IPS
- **Series Management**: Configure product series with branding and colors
- **Image Upload**: Product thumbnails and icons with validation
- **Custom Fields**: Add additional metadata to products
- **Real-time Updates**: Supabase integration with live data
- **Authentication**: Secure admin access via Supabase Auth

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Admin user credentials

## Setup

### 1. Environment Configuration

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your Supabase project settings.

### 2. Database Setup

The database schema includes:

- `public.products` - Product catalog
- `public.series` - Product series configuration
- Storage buckets: `product-assets`, `series-assets`

**Run migrations** in your Supabase SQL editor:

```sql
-- See supabase/migrations/ for full schema
```

### 3. Create Storage Buckets

In Supabase Dashboard → Storage, create:

1. `product-assets` (public bucket)
2. `series-assets` (public bucket)

Set policies to allow authenticated uploads and public reads.

### 4. Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Add new user with email/password
2. Use these credentials to log into the admin console

### 5. Seed Database (Optional)

```bash
npm install
npx tsx scripts/seedDatabase.ts
```

This seeds series and sample products from the client website.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

## Project Structure

```
├── app/
│   ├── (auth)/          # Login pages
│   └── (dashboard)/     # Admin pages (products, series, settings)
├── components/
│   ├── products/        # Product management UI
│   ├── loading/         # Skeleton loaders
│   └── layout/          # Sidebar, header
├── hooks/
│   ├── useProducts.ts   # Product data hook
│   ├── useSeries.ts     # Series data hook
│   └── useProductActions.ts  # Product actions with toasts
├── lib/
│   ├── supabaseClient.ts     # Supabase client
│   ├── auth.ts               # Authentication helpers
│   ├── imageUpload.ts        # Image validation and upload
│   └── products.ts           # Product types
└── scripts/
    └── seedDatabase.ts       # Database seeding script
```

## Usage

### Managing Products

1. Navigate to **Products** in the sidebar
2. Click **Add Product** to create new products
3. Fill in product details, upload images, add custom fields
4. Products are automatically synced to Supabase

**Image Requirements:**
- Thumbnails: min 800×600px, aspect 1.3-1.9, max 1MB
- Icons: min 256×256px, square, max 256KB

### Managing Series

1. Navigate to **Series** in the sidebar
2. Configure series branding (colors, logos)
3. Series are used for product categorization

### Authentication

- Login at `/login`
- Sessions are cached in localStorage
- Logout via user menu in header

## API Integration

To fetch products from the client website:

```typescript
import { supabase } from '@/lib/supabaseClient';

const { data: products } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false });
```

## Troubleshooting

**Cannot login:**
- Verify Supabase URL and anon key in `.env.local`
- Check user exists in Supabase Auth

**Images not uploading:**
- Verify storage buckets exist and are public
- Check bucket policies allow authenticated uploads

**Products not saving:**
- Check RLS policies on `products` table
- Ensure user is authenticated

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

Deploy to Vercel, Netlify, or any Next.js hosting platform:

1. Set environment variables in hosting dashboard
2. Deploy from GitHub repository
3. Ensure Supabase project is accessible

## License

Proprietary - Welkinrim Technologies
