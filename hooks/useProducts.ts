"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Product, SupabaseProduct } from '@/lib/products';
import { supabase } from '@/lib/supabaseClient';

interface ProductRow {
  id: string;
  category: string;
  series: string;
  model: string;
  data: Product;
}

export function useProducts() {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFromSupabase = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products from Supabase', error);
      setProducts([]);
      setLoading(false);
      return;
    }

    const mapped = (data as ProductRow[]).map(row => ({
      ...(row.data as Product),
      id: row.id,
      data: row.data,
      series: row.series,
      model: row.model,
      category: row.category as any,
      created_at: (row as any).created_at,
      updated_at: (row as any).updated_at,
    }));

    setProducts(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  const refresh = useCallback(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  const getAll = useMemo((): SupabaseProduct[] => {
    return products;
  }, [products]);

  const getById = useCallback((id: string): SupabaseProduct | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const create = useCallback(async (product: Product): Promise<boolean> => {
    const { error } = await supabase.from('products').insert({
      category: product.category,
      series: (product as any).series,
      model: (product as any).model,
      data: product,
    });

    if (error) {
      console.error('Error creating product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const update = useCallback(async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const existing = products.find(p => p.id === id);
    if (!existing) return false;

    const merged = { ...existing, ...updates } as Product;

    const { error } = await supabase
      .from('products')
      .update({
        category: merged.category,
        series: (merged as any).series,
        model: (merged as any).model,
        data: merged,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [products, loadFromSupabase]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    // Soft delete: mark as deleted instead of removing
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error deleting product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const getByCategory = useCallback((category: string): Product[] => {
    if (category === 'all') return products;
    if (category === 'haemng') {
      return products.filter(p => p.category === 'motor' && p.series === 'Haemng');
    }
    if (category === 'maelard') {
      return products.filter(p => p.category === 'motor' && p.series === 'Maelard');
    }
    return products.filter(p => p.category === category);
  }, [products]);

  return {
    products,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
    getByCategory,
    refresh,
  };
}
