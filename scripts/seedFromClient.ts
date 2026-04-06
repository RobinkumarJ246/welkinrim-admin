/**
 * Seed Supabase database with client products
 * Run: npx tsx scripts/seedFromClient.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env.local file
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  console.error('Current URL:', supabaseUrl || '(not set)');
  process.exit(1);
}

// Check if using service role key (required to bypass RLS)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  WARNING: Using anon key instead of service role key.');
  console.warn('   This may cause RLS policy errors. Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
  console.warn('   Get it from: Supabase Dashboard → Settings → API → service_role key\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Series from client
const SERIES = [
  { id: 'haemng', label: 'Haemng Series', use_svg_logo: true, logo_src: 'haemng.svg', accent: '#ffc812', text_on_accent: '#000' },
  { id: 'maelard', label: 'Maelard Series', use_svg_logo: true, logo_src: 'Maelard.svg', accent: '#ffc812', text_on_accent: '#000' },
  { id: 'esc', label: 'ESCs', use_svg_logo: false, accent: '#ffc812', text_on_accent: '#000' },
  { id: 'fc', label: 'Flight Controller', use_svg_logo: false, accent: '#ffc812', text_on_accent: '#000' },
  { id: 'ips', label: 'Integrated Power Systems', use_svg_logo: false, accent: '#ffc812', text_on_accent: '#000' },
];

async function seedSeries() {
  console.log('\n📦 Seeding series...');
  for (const series of SERIES) {
    const { error } = await supabase.from('series').upsert(series, { onConflict: 'id' });
    if (error) {
      console.error(`  ❌ Error seeding ${series.id}:`, error.message);
    } else {
      console.log(`  ✓ ${series.label}`);
    }
  }
}

async function seedProducts() {
  console.log('\n📦 Seeding products from client data...');
  
  // Read client products file - adjust path to correct location
  const clientProductsPath = 'D:\\Projects\\WelkinrimTech\\src\\data\\products.ts';
  const content = readFileSync(clientProductsPath, 'utf-8');
  
  // Extract PRODUCTS array using regex (simple approach)
  const productsMatch = content.match(/export const PRODUCTS[^=]*=\s*(\[[\s\S]*?\]);/);
  if (!productsMatch) {
    console.error('❌ Could not find PRODUCTS array in client file');
    return;
  }
  
  // Use eval to parse the array (in a controlled environment)
  const PRODUCTS = eval('(' + productsMatch[1] + ')');
  
  console.log(`Found ${PRODUCTS.length} products in client data`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of PRODUCTS) {
    const category = product.series === 'haemng' || product.series === 'maelard' ? 'motor' :
                    product.series === 'esc' ? 'esc' :
                    product.series === 'fc' ? 'fc' : 'ips';
    
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      category,
      series: product.series,
      model: product.model,
      data: product,
    }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ ${product.model}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 5 === 0) {
        process.stdout.write(`  ✓ ${successCount}/${PRODUCTS.length}...\r`);
      }
    }
  }
  
  console.log(`\n  ✓ Successfully seeded ${successCount} products`);
  if (errorCount > 0) {
    console.log(`  ❌ ${errorCount} errors`);
  }
}

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    await seedSeries();
    await seedProducts();
    console.log('\n✅ Database seeding completed!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
