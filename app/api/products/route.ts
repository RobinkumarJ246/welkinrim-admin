import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60; // Revalidate every 60 seconds

/**
 * GET /api/products
 * Public API endpoint for client website to fetch products
 * 
 * Query params:
 * - category: filter by category (motor|esc|fc|ips)
 * - series: filter by series
 * - limit: max number of results
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const series = searchParams.get('series');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (series) {
      query = query.eq('series', series);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform data to match client format
    const products = data.map((row) => row.data);

    return NextResponse.json(
      { products, count: products.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
